import { ProjectList } from './components/project-list.js';
import { ProjectInput } from './components/project-input.js';
import { ProjectStatus } from './models/project.js';
new ProjectInput();
new ProjectList(ProjectStatus.Active);
new ProjectList(ProjectStatus.Finished);

// projectState.addProject('Test', 'Test projects', 2);
// projectState.addProject('Test2', 'Test projects 2', 3);
