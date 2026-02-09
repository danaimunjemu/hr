export interface ShiftDefinition {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string;
  name: string;
  code: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  breakMinutes: number;
  paidHours: number;
  nightShift: boolean;
  weekendShift: boolean;
}
