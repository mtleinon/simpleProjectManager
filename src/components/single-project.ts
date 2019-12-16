/// <reference path="base-component.ts"/>
/// <reference path="../models/drag-and-drop.ts"/>
/// <reference path="../decorators/autobind.ts"/>

namespace App {
  export class SingleProject extends Component<HTMLDivElement, HTMLElement>
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
}
