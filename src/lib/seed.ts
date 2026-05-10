import type { CVData } from '../types/cv';
import type { Application } from '../types/application';

/**
 * Fictional first-run CV. The empty state a brand-new visitor sees;
 * also the fallback for JSON imports that lack newer fields.
 */
export const SEED_CV: CVData = {
  templateId: 'editorial',
  language: 'English',
  name: 'Alex Rivera',
  title: 'Senior Product Designer',
  contact: {
    email: 'alex.rivera@example.com',
    phone: '+1 555 0142',
    linkedin: 'linkedin.com/in/alexrivera',
    location: 'Berlin, Germany',
    relocation: 'Open to relocation',
    dob: '12 March 1992',
  },
  summary:
    'Senior product designer with eight years across SaaS, fintech, and consumer e-commerce. Leads small cross-functional teams from research through shipped product, with a track record of redesigns that lift activation and retention. Comfortable in Figma, prototyping, and design systems; partners closely with engineering on complex flows.',
  metrics: [
    { value: '+38%', unit: 'activation', label: 'Onboarding redesign at Lumen Pay' },
    { value: '12', unit: 'designers', label: 'Hired and mentored across two teams' },
    { value: '4', unit: 'design systems', label: 'Built or migrated end-to-end' },
    { value: '8 yrs', unit: 'product design', label: 'B2B SaaS, fintech, consumer' },
    { value: '$2.1M', unit: 'ARR impact', label: 'Tied to checkout redesign in 2024' },
    { value: '3', unit: 'continents', label: 'Worked across NA, EU, and APAC teams' },
  ],
  experience: [
    {
      company: 'Lumen Pay',
      companyNote: 'Series B fintech, 220 employees',
      location: 'Berlin, Germany',
      dates: 'June 2022 – present',
      roles: [
        {
          title: 'Senior Product Designer',
          dates: '2024 – present',
          bullets: [
            'Lead design for the merchant onboarding workstream; redesigned KYC + bank-link flow lifted activation by 38 per cent quarter over quarter.',
            'Own the checkout component library across web and mobile, used by 14 product engineers and 4 designers.',
            'Run weekly design critique and pair with researchers on quarterly usability rounds with merchants in DE, FR, and NL.',
            'Mentor two mid-level designers; both promoted within the last review cycle.',
          ],
        },
        {
          title: 'Product Designer',
          dates: 'June 2022 – 2024',
          bullets: [
            'Shipped the dashboard analytics rebuild, cutting time-to-first-insight from 4 minutes to under 30 seconds.',
            'Migrated the design system from Sketch to Figma with token-based theming for white-label customers.',
            'Partnered with Growth on activation experiments; three of five reached statistical significance.',
          ],
        },
      ],
    },
    {
      company: 'Northwind Commerce',
      companyNote: 'Mid-market e-commerce platform',
      location: 'Amsterdam, Netherlands',
      dates: 'Aug 2018 – May 2022',
      roles: [
        {
          title: 'Product Designer',
          dates: 'Aug 2018 – May 2022',
          bullets: [
            'Designed storefront editor used by 6,000 merchants; cut average setup time from 90 minutes to 22.',
            'Led mobile checkout overhaul that contributed to a 12 per cent lift in mobile conversion.',
            'Built and maintained the merchant-facing component library.',
          ],
        },
      ],
    },
  ],
  education: [
    {
      degree: 'B.A. Interaction Design',
      spec: 'Human-Computer Interaction',
      school: 'Malmö University',
      location: 'Malmö, Sweden',
      dates: 'Graduated June 2017',
      note: 'Three-year programme combining design research, prototyping, and front-end implementation.',
    },
  ],
  honours: [
    {
      title: 'Awwwards Site of the Day',
      years: '2023',
      text: 'Recognised for the public Lumen Pay marketing site relaunch led with the brand team.',
    },
  ],
  languages: [
    { name: 'English', level: 'Native', pct: 100 },
    { name: 'Spanish', level: 'Professional', pct: 80 },
    { name: 'German', level: 'Working', pct: 60 },
  ],
  certifications: [{ name: 'NN/g UX Certification', year: '2021' }],
  competencies: [
    'End-to-end product design',
    'Design systems and tokens',
    'User research and usability testing',
    'Prototyping and motion',
    'Cross-functional team leadership',
    'Mentorship and hiring',
    'Workshop facilitation',
  ],
  tools: [
    { name: 'Figma', level: 'Advanced' },
    { name: 'Framer', level: 'Advanced' },
    { name: 'Notion', level: 'Advanced' },
    { name: 'HTML & CSS', level: 'Advanced' },
    { name: 'React', level: 'Fundamental' },
    { name: 'Adobe Creative Cloud', level: 'Fundamental' },
    { name: 'Webflow', level: 'Fundamental' },
  ],
  softSkills: [
    'Team collaboration',
    'Clear written communication',
    'Mentorship',
    'Stakeholder management',
    'Calm under pressure',
  ],
  positions: [{ role: 'Mentor', org: 'ADPList', dates: '2021 – present' }],
  interests: ['Generative art', 'Cycling', 'Specialty coffee', 'Bouldering'],
  additional:
    'Open-source contributor to a small handful of design tooling projects. Speak occasionally at local meetups on design systems.',
  sidebar: [
    { id: 'competencies', title: 'Core Competencies', visible: true },
    { id: 'tools', title: 'Technical Tools', visible: true },
    { id: 'languages', title: 'Languages', visible: true },
    { id: 'certifications', title: 'Certification', visible: true },
    { id: 'softSkills', title: 'Soft Skills', visible: true },
    { id: 'positions', title: 'Positions of Trust', visible: true },
    { id: 'interests', title: 'Personal Interests', visible: true },
    { id: 'additional', title: 'Additional', visible: true },
  ],
  theme: { ink: '#1a2a3a', side: '#f4efe6' },
  headshot: {
    shape: 'rounded',
    align: 'left',
    x: 0,
    y: 0,
    scale: 1,
    size: 144,
  },
  sectionTitles: {
    profile: 'Profile',
    experience: 'Work Experience',
    education: 'Education',
    honours: 'Honours and Achievements',
  },
  coverLetter: {
    sender: { lines: [] },
    date: '',
    recipient: { name: '', title: '', company: '', address: '' },
    subject: '',
    salutation: 'Dear Hiring Manager,',
    body: "Open with a hook tied to the role and why this company specifically.\n\nMiddle paragraph: 2–3 concrete accomplishments that map to the role. Tie each to a measurable outcome.\n\nClose with what you'd bring and a clear ask for the next step.",
    signoff: 'Sincerely,',
    signName: '',
  },
};

export const SEED_APPLICATIONS: Application[] = [
  {
    id: 'sample-app-001',
    company: 'Northstar Studio',
    role: 'Senior Product Designer',
    postingUrl: 'https://example.com/jobs/northstar-senior-product-designer',
    appliedDate: '',
    status: 'drafting',
    notes: 'Sample application. Replace or delete to start your own list.',
    createdAt: '2026-05-01T09:00:00.000Z',
    updatedAt: '2026-05-01T09:00:00.000Z',
    sourceProfile: 'Base CV',
    snapshot: { cv: null, headshotKey: null },
  },
];
