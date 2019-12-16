/// <reference path="base-component.ts"/>

/// <reference path="../models/drag-and-drop.ts"/>
/// <reference path="../models/project.ts"/>
/// <reference path="../state/project-state.ts"/>
/// <reference path="../decorators/autobind.ts"/>
/// <reference path="../components/single-project.ts"/>

namespace App {
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
}
