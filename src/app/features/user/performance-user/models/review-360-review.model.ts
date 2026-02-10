import { Employee } from './appraisal.model';

export interface Review360Feedback {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string | null;
  setup?: string;
  reviewer?: string;
  startDoing?: string;
  stopDoing?: string;
  continueDoing?: string;
  maximiseImpact?: string;
  rating?: number;
}

export interface Review360Review {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string | null;
  setup?: string;
  reviewer?: Employee;
  completed: boolean;
  feedback: Review360Feedback[];
}
