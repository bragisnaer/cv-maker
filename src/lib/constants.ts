import type { ApplicationStatus } from '../types/application';

export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;

export const DEFAULT_PROFILE_NAME = 'Base CV';

export const COLOR_SCHEMES = [
  { id: 'ink', name: 'Navy ink', ink: '#1a2a3a', side: '#f4efe6' },
  { id: 'forest', name: 'Forest', ink: '#1f3b2d', side: '#eef0e8' },
  { id: 'rust', name: 'Rust', ink: '#7a3418', side: '#f5ece3' },
  { id: 'slate', name: 'Slate mono', ink: '#1a1a1a', side: '#ececea' },
  { id: 'plum', name: 'Plum', ink: '#3a1f3d', side: '#f1ebef' },
  { id: 'ocean', name: 'Ocean', ink: '#0e3a52', side: '#e6edf0' },
  { id: 'crimson', name: 'Crimson', ink: '#000000', side: '#faf9f4' },
] as const;

export interface ApplicationStatusMeta {
  id: ApplicationStatus;
  label: string;
  color: string;
}

export const APPLICATION_STATUS_META: ApplicationStatusMeta[] = [
  { id: 'drafting', label: 'Drafting', color: '#9aa1a6' },
  { id: 'applied', label: 'Applied', color: '#2f6fb3' },
  { id: 'screening', label: 'Screening', color: '#a36b1a' },
  { id: 'interview', label: 'Interview', color: '#7a3418' },
  { id: 'offer', label: 'Offer', color: '#1f7a3a' },
  { id: 'rejected', label: 'Rejected', color: '#7a1f1f' },
  { id: 'withdrawn', label: 'Withdrawn', color: '#5c5c58' },
];

export const APPLICATION_STATUS_BY_ID: Record<ApplicationStatus, ApplicationStatusMeta> =
  Object.fromEntries(APPLICATION_STATUS_META.map((s) => [s.id, s])) as Record<
    ApplicationStatus,
    ApplicationStatusMeta
  >;

export const LANGUAGE_LEVELS = [
  { level: 'Native', pct: 100 },
  { level: 'Full Professional', pct: 90 },
  { level: 'Professional', pct: 80 },
  { level: 'Working', pct: 60 },
  { level: 'Limited', pct: 40 },
  { level: 'Elementary', pct: 20 },
] as const;
