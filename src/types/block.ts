export type BlockType =
  | "text"
  | "heading1"
  | "heading2"
  | "heading3"
  | "bulleted-list"
  | "numbered-list"
  | "todo"
  | "toggle"
  | "quote"
  | "code"
  | "image"
  | "divider"
  | "page"
  | "database";

export type ProjectStatus = "not-started" | "in-progress" | "done" | "blocked";
export type ProjectPriority = "low" | "medium" | "high" | "urgent";
export type DatabaseView = "table" | "board";

export interface DatabaseSelectOption {
  id: string;
  name: string;
  color: "slate" | "blue" | "green" | "amber" | "purple" | "rose" | "orange";
}

export interface ProjectRow {
  id: string;
  title: string;
  category: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  deadline: string;
  owner: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseBlockProperties {
  view: DatabaseView;
  columns: {
    title: string;
    category: string;
    status: string;
    deadline: string;
    countdown: string;
    priority: string;
    owner: string;
    notes: string;
  };
  options: {
    projects: DatabaseSelectOption[];
    categories: DatabaseSelectOption[];
  };
  projects: ProjectRow[];
}

export interface BlockProperties {
  database?: DatabaseBlockProperties;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  checked?: boolean;
  collapsed?: boolean;
  properties?: BlockProperties;
}
