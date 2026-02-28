export type OffboardingEntityType = 'OFFBOARDING' | 'TASK' | 'ASSET' | 'EXIT_INTERVIEW';

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
}
