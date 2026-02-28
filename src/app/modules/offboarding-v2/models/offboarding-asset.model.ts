export type AssetType =
  | 'VEHICLE'
  | 'FUEL_CARD'
  | 'CREDIT_CARD'
  | 'LAPTOP'
  | 'MOBILE_PHONE'
  | 'ACCESS_CARDS'
  | 'TOOLS_EQUIPMENT'
  | 'PPE'
  | 'OTHER';

export type AssetReturnStatus = 'NOT_RETURNED' | 'RETURNED' | 'RETURNED_DAMAGED';

export interface OffboardingAsset {
  assetNoteId: string;
  employeeId: string;
  assetType: AssetType;
  assetId: string;
  description: string;
  serialNumber: string;
  issueDate: string;
  returnStatus: AssetReturnStatus;
  returned?: boolean;
  returnDate?: string;
  conditionOnReturn?: string;
  remarks?: string;
  employeeConfirmed?: boolean;
  disputeReason?: string;
  disputeEvidenceFilePath?: string;
}

export interface AssetReturnPayload {
  returned: boolean;
  returnDate: string;
  conditionOnReturn: string;
  remarks?: string;
  offboardingId: number;
}

export interface AssetAcknowledgePayload {
  employeeConfirmed: boolean;
  disputeReason?: string;
  evidenceFilePath?: string;
}
