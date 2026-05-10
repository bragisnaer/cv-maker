/**
 * CV data shape. Extend cautiously — every field here is persisted
 * to localStorage and travels with exported JSON.
 */

export const HEADSHOT_SHAPES = [
  'circle',
  'rounded',
  'square',
  'arch',
  'hexagon',
  'capsule',
] as const;
export type HeadshotShape = (typeof HEADSHOT_SHAPES)[number];

export type HeadshotAlign = 'left' | 'center' | 'right';

export interface Theme {
  ink: string;
  side: string;
}

export interface Headshot {
  shape: HeadshotShape;
  align: HeadshotAlign;
  x: number;
  y: number;
  scale: number;
  size: number;
}

export interface Contact {
  email: string;
  phone: string;
  linkedin: string;
  location: string;
  relocation: string;
  dob: string;
}

export interface Metric {
  value: string;
  unit: string;
  label: string;
}

export interface Role {
  title: string;
  dates: string;
  bullets: string[];
}

export interface Experience {
  company: string;
  companyNote?: string;
  location: string;
  dates: string;
  roles: Role[];
}

export interface Education {
  degree: string;
  spec?: string;
  school: string;
  location: string;
  dates: string;
  note?: string;
}

export interface Honour {
  title: string;
  years?: string;
  text: string;
}

export interface Language {
  name: string;
  level: string;
  pct: number;
}

export interface Certification {
  name: string;
  year?: string;
}

export interface ToolEntry {
  name: string;
  level: string;
}

export interface Position {
  role: string;
  org: string;
  dates?: string;
}

export interface SidebarItem {
  id: string;
  title: string;
  visible: boolean;
}

export interface SectionTitles {
  profile: string;
  experience: string;
  education: string;
  honours: string;
}

export interface CoverLetterSender {
  lines: string[];
}

export interface CoverLetterRecipient {
  name: string;
  title: string;
  company: string;
  address: string;
}

export interface CoverLetter {
  sender: CoverLetterSender;
  date: string;
  recipient: CoverLetterRecipient;
  subject: string;
  salutation: string;
  body: string;
  signoff: string;
  signName: string;
}

export interface CVData {
  /** ID of the active template (see src/templates/registry). */
  templateId: string;
  /** ISO-ish language label of this CV ("English", "Dansk"…). */
  language: string;
  name: string;
  title: string;
  contact: Contact;
  summary: string;
  metrics: Metric[];
  experience: Experience[];
  education: Education[];
  honours: Honour[];
  languages: Language[];
  certifications: Certification[];
  competencies: string[];
  tools: ToolEntry[];
  softSkills: string[];
  positions: Position[];
  interests: string[];
  additional: string;
  sidebar: SidebarItem[];
  theme: Theme;
  headshot: Headshot;
  sectionTitles: SectionTitles;
  coverLetter: CoverLetter;
}

export interface Profile {
  cv: CVData;
}

export type ProfileMap = Record<string, Profile>;
