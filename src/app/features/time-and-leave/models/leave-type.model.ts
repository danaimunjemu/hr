export interface LeaveType {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string;
  name: string;
  description?: string;
  daysPerYear: number;
  carryOverAllowed: boolean;
  maxCarryOverDays?: number;
  paid: boolean;
}
