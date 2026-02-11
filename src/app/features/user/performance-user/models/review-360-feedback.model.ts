import { Employee } from './appraisal.model';

export interface Review360FeedbackReviewerAssignment {
  id: number;
  setup?: {
    anonymous?: boolean;
  } | null;
  reviewer?: Employee | null;
  completed?: boolean;
}

export interface Review360FeedbackReceived {
  id: number;
  createdOn?: string;
  updatedOn?: string;
  deletedOn?: string | null;
  setup?: any | null;
  reviewer?: Review360FeedbackReviewerAssignment | null;
  startDoing?: string;
  stopDoing?: string;
  continueDoing?: string;
  maximiseImpact?: string;
  rating?: number;
}
