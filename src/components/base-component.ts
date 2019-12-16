namespace App {
  export abstract class Component<
    T extends HTMLElement,
    U extends HTMLElement
  > {
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
}
