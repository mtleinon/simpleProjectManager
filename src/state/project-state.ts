import { Project, ProjectStatus } from '../models/project';

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

export class ProjectState extends State<Project> {
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

export const projectState = ProjectState.getInstance();
