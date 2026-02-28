export type OffboardingEntityType = 'OFFBOARDING' | 'TASK' | 'ASSET' | 'EXIT_INTERVIEW';

export interface EventPerformer {
  firstName?: string | null;
  lastName?: string | null;
}

export interface OffboardingEvent {
  eventId: string;
  offboardingId: string;
  timestamp: string;
  actor: string;
  action: string;
  entity: OffboardingEntityType;
  systemName?: string;
  accessRevoked?: boolean;
  notes?: string;
  eventType?: string;
  description?: string;
  occurredAt?: string;
  performedBy?: EventPerformer | null;
}
