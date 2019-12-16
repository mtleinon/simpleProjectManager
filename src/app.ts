/// <reference path="models/project.ts"/>
/// <reference path="components/project-list.ts"/>
/// <reference path="components/project-input.ts"/>

namespace App {
  new ProjectInput();
  new ProjectList(ProjectStatus.Active);
  new ProjectList(ProjectStatus.Finished);

  // projectState.addProject('Test', 'Test projects', 2);
  // projectState.addProject('Test2', 'Test projects 2', 3);
}
