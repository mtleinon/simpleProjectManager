import { Component } from './base-component.js';
import { DragTarget } from '../models/drag-and-drop.js';
import { autoBind } from '../decorators/autobind.js';
import { Project, ProjectStatus } from '../models/project.js';
import { projectState } from '../state/project-state.js';
import { SingleProject } from './single-project.js';

export class ProjectList extends Component<HTMLDivElement, HTMLElement>
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
