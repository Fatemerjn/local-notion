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

export interface ProjectRow {
  id: string;
  title: string;
  status: ProjectStatus;
  deadline: string;
  owner: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseBlockProperties {
  view: "table";
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
