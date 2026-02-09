export interface HolidayCalendar {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string;
  name: string;
  description?: string;
  holidayDates?: HolidayDate[];
}

export interface HolidayDate {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string;
  name: string;
  date: string;
  holidayCalendar?: HolidayCalendar;
}
