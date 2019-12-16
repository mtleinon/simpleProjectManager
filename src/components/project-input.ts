import { Component } from './base-component';
import { autoBind } from '../decorators/autobind';
import { Validatable, validate } from '../util/validation';
import { projectState } from '../state/project-state';

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
