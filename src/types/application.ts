import type { CVData } from './cv';

export const APPLICATION_STATUSES = [
  'drafting',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface ApplicationSnapshot {
  cv: CVData | null;
  headshotKey: string | null;
}

export interface Application {
  id: string;
  company: string;
  role: string;
  postingUrl: string;
  appliedDate: string;
  status: ApplicationStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
  sourceProfile: string;
  snapshot: ApplicationSnapshot;
}
