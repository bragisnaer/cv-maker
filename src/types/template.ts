import type { ReactNode } from 'react';
import type { CVData, Theme } from './cv';

/**
 * Per-template tweakables. A template advertises which controls
 * the user can adjust; the editor renders only those.
 */
export interface TemplateTweaks {
  theme: Theme;
}

export interface TemplateRenderProps {
  data: CVData;
  tweaks: TemplateTweaks;
  headshotSrc: string | null;
  /** True when rendering for print / PDF — disables editing chrome. */
  printMode?: boolean;
}

export interface Template {
  id: string;
  name: string;
  /** One-line description for the template picker UI. */
  description: string;
  /** Built-in defaults applied when the user first selects this template. */
  defaultTweaks: TemplateTweaks;
  /** Path to a thumbnail asset (under /public). Optional — fall back to a generated preview. */
  thumbnail?: string;
  render: (props: TemplateRenderProps) => ReactNode;
}
