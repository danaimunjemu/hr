export interface PerformanceGoalTemplateItem {
  id?: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string;
  title: string;
  description: string;
  weight: number;
  measurement: string;
  dueDate: string;
  templateId?: number;
}

export interface AddGoalItemsRequest {
  templateId: number;
  items: PerformanceGoalTemplateItem[];
}
