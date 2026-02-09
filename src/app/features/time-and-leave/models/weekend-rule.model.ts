export interface WeekendRule {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string;
  name: string;
  saturday: boolean;
  sunday: boolean;
}
