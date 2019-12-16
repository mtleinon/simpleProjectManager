enum ProjectStatus {
  Active = 'active',
  Finished = 'finished'
}

interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listener: Listener<T>) {
    this.listeners.push(listener);
  }
  notifyListeners(items: T[]) {
    for (const listener of this.listeners) {
      listener(items);
    }
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;
  private constructor() {
    super();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new ProjectState();
    }
    return this.instance;
  }

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    this.notifyListeners(this.projects.slice());
  }

  setProjectStatus(id: string, newStatus: ProjectStatus) {
    const projectIndex = this.projects.findIndex(project => project.id === id);
    if (projectIndex >= 0 && this.projects[projectIndex].status !== newStatus) {
      this.projects[projectIndex].status = newStatus;
      this.notifyListeners(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

interface Validatable {
  value?: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validatableInput: Validatable) {
  let isValid = true;
  const value = validatableInput.value!;
  if (validatableInput.required) {
    isValid = isValid && value?.toString().trim().length !== 0;
  }
  if (validatableInput.minLength != null && typeof value === 'string') {
    isValid = isValid && value.length >= validatableInput.minLength;
  }
  if (validatableInput.maxLength != null && typeof value === 'string') {
    isValid = isValid && value.length <= validatableInput.maxLength;
  }
  if (validatableInput.min != null && typeof value === 'number') {
    isValid = isValid && value >= validatableInput.min;
  }
  if (validatableInput.max != null && typeof value === 'number') {
    isValid = isValid && value <= validatableInput.max;
  }
  return isValid;
}

function autoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    }
  };
  return adjustedDescriptor;
}

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    private insertAt: 'beforeend' | 'afterbegin',
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }
    this.attach();
    this.configure();
  }

  protected attach() {
    this.hostElement.insertAdjacentElement(this.insertAt, this.element);
  }

  abstract renderContent(): void;

  abstract configure(): void;
}

class SingleProject extends Component<HTMLDivElement, HTMLElement>
  implements Draggable {
  get persons() {
    if (this.project.people === 1) {
      return '1 person';
    }
    return `${this.project.people} persons`;
  }

  constructor(projectListId: string, private project: Project) {
    super('single-project', projectListId, 'beforeend', project.id);
    this.renderContent();
  }

  @autoBind
  dragStartHandler(event: DragEvent) {
    console.debug('dragStartHandler: DragEvent =', event);
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  dragEndHandler(_: DragEvent) {
    console.debug('dragEndHandler');
  }

  public configure() {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }

  public renderContent() {
    this.element.querySelector('h2')!.innerText = this.project.title;
    this.element.querySelector('h3')!.innerText = this.persons;
    this.element.querySelector('p')!.innerText = this.project.description;
  }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget {
  assignedProjects: Project[] = [];

  constructor(private type: ProjectStatus) {
    super('project-list', 'app', 'beforeend', `${type}-projects`);
    this.renderContent();
  }

  @autoBind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      const listEl = this.element.querySelector('ul');
      listEl?.classList.add('droppable');
    }
  }

  @autoBind
  dropHandler(event: DragEvent) {
    console.debug(
      'data =',
      event.dataTransfer!.getData('text/plain'),
      'type =',
      this.type
    );
    const projectId = event.dataTransfer!.getData('text/plain');
    projectState.setProjectStatus(projectId, this.type);
  }

  @autoBind
  dragLeaveHandler(_: DragEvent) {
    const listEl = this.element.querySelector('ul');
    listEl?.classList.remove('droppable');
  }

  public configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);
    projectState.addListener((projects: Project[]) => {
      this.assignedProjects = projects.filter(p => p.status === this.type);
      this.renderProjects();
    });
  }

  public renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = '';
    for (const projectItem of this.assignedProjects) {
      new SingleProject(`${this.type}-projects-list`, projectItem);
    }
  }

  public renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' PROJECTS';
  }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', 'afterbegin', 'user-input');
    this.titleInputElement = this.element.querySelector(
      '#title'
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      '#description'
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      '#people'
    ) as HTMLInputElement;

    this.renderContent();
  }

  public configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  public renderContent() {}

  private clearInput() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  @autoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    console.debug('title =', this.titleInputElement.value);
    const userInput = this.gatherUserInput();
    console.debug('gatherUserInput() =', userInput);
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      projectState.addProject(title, description, people);
    }
  }

  private gatherUserInput(): [string, string, number] | void {
    const title = this.titleInputElement.value.trim();
    const description = this.descriptionInputElement.value.trim();
    const people = this.peopleInputElement.value.trim();
    if (title.length && description.length && people.length) {
      const titleValidatable: Validatable = {
        value: title,
        required: true
      };
      const descriptionValidatable: Validatable = {
        value: description,
        required: true,
        minLength: 5
      };
      const peopleValidatable: Validatable = {
        value: +people,
        required: true,
        min: 1,
        max: 5
      };
      if (
        validate(titleValidatable) &&
        validate(descriptionValidatable) &&
        validate(peopleValidatable)
      ) {
        this.clearInput();
        return [title, description, +people];
      }
    }
    alert('Please fill all fields');
    return;
  }
}

const projectInput = new ProjectInput();
const activeProjectList = new ProjectList(ProjectStatus.Active);
const finishedProjectList = new ProjectList(ProjectStatus.Finished);
projectState.addProject('Test', 'Test projects', 2);
projectState.addProject('Test2', 'Test projects 2', 3);
