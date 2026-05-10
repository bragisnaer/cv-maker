import type { Template } from '../types/template';

/**
 * Template registry. Each entry advertises an id, name, default
 * theme, and a render function. CVDocument owns the visual layer
 * for now; render() is a hook for templates that need bespoke
 * markup later. Adding entries here makes them appear in the
 * Templates picker.
 */

export const TEMPLATES: Template[] = [
  {
    id: 'editorial',
    name: 'Editorial',
    description:
      "The two-column flagship. Theme-tinted sidebar with metrics callouts and a readable main column.",
    defaultTweaks: { theme: { ink: '#1a2a3a', side: '#f4efe6' } },
    render: () => null, // CVDocument owns the actual render for now
  },
  {
    id: 'classic-ats',
    name: 'Classic ATS',
    description:
      'Single column, no graphics, recruiter-friendly. Optimised for resume parsers.',
    defaultTweaks: { theme: { ink: '#1a1a1a', side: '#ffffff' } },
    render: () => null,
  },
  {
    id: 'modern-twocol',
    name: 'Modern Two-Column',
    description: 'Sidebar left, content right. Cooler ink, denser layout.',
    defaultTweaks: { theme: { ink: '#0e3a52', side: '#e6edf0' } },
    render: () => null,
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Typographic and quiet. No colour, no decoration.',
    defaultTweaks: { theme: { ink: '#0f0f0f', side: '#fafafa' } },
    render: () => null,
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Designer-leaning portfolio look. Larger type and accents.',
    defaultTweaks: { theme: { ink: '#3a1f3d', side: '#f1ebef' } },
    render: () => null,
  },
  {
    id: 'academic',
    name: 'Academic',
    description: 'Multi-page friendly with publication blocks and serif tone.',
    defaultTweaks: { theme: { ink: '#1f3b2d', side: '#eef0e8' } },
    render: () => null,
  },
];

export const TEMPLATE_BY_ID: Record<string, Template> = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, t]),
);

export const DEFAULT_TEMPLATE_ID = TEMPLATES[0].id;
