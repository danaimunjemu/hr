export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  employeeNumber: string;
  position?: Position;
}

export interface Position {
  id: number;
  name: string;
}
