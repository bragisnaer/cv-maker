import type { CSSProperties } from 'react';
import type {
  CVData,
  Education,
  Experience,
  Honour,
  Language,
  Metric,
  Position,
  Role,
  SidebarItem,
  ToolEntry,
} from '../types/cv';
import { useCVStore } from '../state/useCVStore';
import { EditableText } from './EditableText';
import { A4_HEIGHT_PX, A4_WIDTH_PX } from '../lib/constants';

interface CVDocumentProps {
  data: CVData;
  /** Read-only mode (preview, print). Hides editing chrome. */
  readOnly?: boolean;
}

export function CVDocument({ data, readOnly }: CVDocumentProps) {
  const cssVars: CSSProperties & Record<string, string> = {
    '--cv-ink': data.theme.ink,
    '--cv-side': data.theme.side,
    '--cv-page-w': `${A4_WIDTH_PX}px`,
    '--cv-page-h': `${A4_HEIGHT_PX}px`,
  };

  return (
    <article className="cv-page" style={cssVars} aria-label={`${data.name} — CV`}>
      <CVSidebar data={data} readOnly={readOnly} />
      <CVMain data={data} readOnly={readOnly} />
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Sidebar (left column, theme-tinted)
   ───────────────────────────────────────────────────────────── */

function CVSidebar({ data, readOnly }: { data: CVData; readOnly?: boolean }) {
  return (
    <aside className="cv-sidebar">
      <SidebarHeader data={data} readOnly={readOnly} />
      <SidebarContact data={data} readOnly={readOnly} />
      {data.sidebar
        .filter((s) => s.visible)
        .map((section) => (
          <SidebarSection
            key={section.id}
            section={section}
            data={data}
            readOnly={readOnly}
          />
        ))}
    </aside>
  );
}

function SidebarHeader({ data, readOnly }: { data: CVData; readOnly?: boolean }) {
  const { updatePath } = useCVStore();
  return (
    <header className="cv-sidebar__header">
      <EditableText
        as="h1"
        className="cv-sidebar__name"
        value={data.name}
        onChange={(v) => updatePath(['name'], v)}
        readOnly={readOnly}
        placeholder="Your name"
        ariaLabel="Name"
      />
      <EditableText
        className="cv-sidebar__title"
        value={data.title}
        onChange={(v) => updatePath(['title'], v)}
        readOnly={readOnly}
        placeholder="Title"
        ariaLabel="Title"
      />
    </header>
  );
}

function SidebarContact({ data, readOnly }: { data: CVData; readOnly?: boolean }) {
  const { updatePath } = useCVStore();
  const items: Array<{ key: keyof CVData['contact']; label: string }> = [
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'location', label: 'Location' },
    { key: 'relocation', label: 'Relocation' },
    { key: 'dob', label: 'Date of birth' },
  ];
  return (
    <section className="cv-block">
      <h2 className="cv-block__title">Contact</h2>
      <dl className="cv-contact">
        {items.map(({ key, label }) => (
          <div className="cv-contact__row" key={key}>
            <dt>{label}</dt>
            <dd>
              <EditableText
                value={data.contact[key]}
                onChange={(v) => updatePath(['contact', key], v)}
                readOnly={readOnly}
                placeholder={label}
                ariaLabel={label}
              />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function SidebarSection({
  section,
  data,
  readOnly,
}: {
  section: SidebarItem;
  data: CVData;
  readOnly?: boolean;
}) {
  return (
    <section className="cv-block">
      <h2 className="cv-block__title">{section.title}</h2>
      <SidebarBody id={section.id} data={data} readOnly={readOnly} />
    </section>
  );
}

function SidebarBody({
  id,
  data,
  readOnly,
}: {
  id: string;
  data: CVData;
  readOnly?: boolean;
}) {
  const { updatePath } = useCVStore();
  switch (id) {
    case 'competencies':
      return (
        <ul className="cv-list">
          {data.competencies.map((c, i) => (
            <li key={i}>
              <EditableText
                value={c}
                onChange={(v) => updatePath(['competencies', i], v)}
                readOnly={readOnly}
                placeholder="Competency"
              />
            </li>
          ))}
        </ul>
      );
    case 'tools':
      return <ToolsList tools={data.tools} readOnly={readOnly} />;
    case 'languages':
      return <LanguagesList languages={data.languages} readOnly={readOnly} />;
    case 'certifications':
      return (
        <ul className="cv-list">
          {data.certifications.map((c, i) => (
            <li key={i}>
              <EditableText
                value={c.name}
                onChange={(v) => updatePath(['certifications', i, 'name'], v)}
                readOnly={readOnly}
                placeholder="Certification"
              />
              {c.year && (
                <span className="cv-meta">
                  {' · '}
                  <EditableText
                    value={c.year}
                    onChange={(v) => updatePath(['certifications', i, 'year'], v)}
                    readOnly={readOnly}
                  />
                </span>
              )}
            </li>
          ))}
        </ul>
      );
    case 'softSkills':
      return (
        <ul className="cv-list">
          {data.softSkills.map((s, i) => (
            <li key={i}>
              <EditableText
                value={s}
                onChange={(v) => updatePath(['softSkills', i], v)}
                readOnly={readOnly}
              />
            </li>
          ))}
        </ul>
      );
    case 'positions':
      return <PositionsList positions={data.positions} readOnly={readOnly} />;
    case 'interests':
      return (
        <ul className="cv-list cv-list--inline">
          {data.interests.map((s, i) => (
            <li key={i}>
              <EditableText
                value={s}
                onChange={(v) => updatePath(['interests', i], v)}
                readOnly={readOnly}
              />
            </li>
          ))}
        </ul>
      );
    case 'additional':
      return (
        <EditableText
          as="p"
          className="cv-paragraph"
          value={data.additional}
          onChange={(v) => updatePath(['additional'], v)}
          readOnly={readOnly}
          multiline
          placeholder="Additional info"
        />
      );
    default:
      return null;
  }
}

function ToolsList({ tools, readOnly }: { tools: ToolEntry[]; readOnly?: boolean }) {
  const { updatePath } = useCVStore();
  return (
    <ul className="cv-list">
      {tools.map((t, i) => (
        <li key={i} className="cv-tool">
          <EditableText
            value={t.name}
            onChange={(v) => updatePath(['tools', i, 'name'], v)}
            readOnly={readOnly}
          />
          <span className="cv-meta">
            <EditableText
              value={t.level}
              onChange={(v) => updatePath(['tools', i, 'level'], v)}
              readOnly={readOnly}
            />
          </span>
        </li>
      ))}
    </ul>
  );
}

function LanguagesList({
  languages,
  readOnly,
}: {
  languages: Language[];
  readOnly?: boolean;
}) {
  const { updatePath } = useCVStore();
  return (
    <ul className="cv-list cv-languages">
      {languages.map((l, i) => (
        <li key={i}>
          <div className="cv-language__row">
            <EditableText
              value={l.name}
              onChange={(v) => updatePath(['languages', i, 'name'], v)}
              readOnly={readOnly}
            />
            <span className="cv-meta">
              <EditableText
                value={l.level}
                onChange={(v) => updatePath(['languages', i, 'level'], v)}
                readOnly={readOnly}
              />
            </span>
          </div>
          <div className="cv-language__bar">
            <div className="cv-language__fill" style={{ width: `${l.pct}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function PositionsList({
  positions,
  readOnly,
}: {
  positions: Position[];
  readOnly?: boolean;
}) {
  const { updatePath } = useCVStore();
  return (
    <ul className="cv-list">
      {positions.map((p, i) => (
        <li key={i}>
          <EditableText
            value={p.role}
            onChange={(v) => updatePath(['positions', i, 'role'], v)}
            readOnly={readOnly}
          />
          <div className="cv-meta">
            <EditableText
              value={p.org}
              onChange={(v) => updatePath(['positions', i, 'org'], v)}
              readOnly={readOnly}
            />
            {p.dates && (
              <>
                {' · '}
                <EditableText
                  value={p.dates}
                  onChange={(v) => updatePath(['positions', i, 'dates'], v)}
                  readOnly={readOnly}
                />
              </>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main column
   ───────────────────────────────────────────────────────────── */

function CVMain({ data, readOnly }: { data: CVData; readOnly?: boolean }) {
  const { updatePath } = useCVStore();
  return (
    <main className="cv-main">
      <section className="cv-block">
        <EditableText
          as="h2"
          className="cv-block__title cv-block__title--main"
          value={data.sectionTitles.profile}
          onChange={(v) => updatePath(['sectionTitles', 'profile'], v)}
          readOnly={readOnly}
        />
        <EditableText
          as="p"
          className="cv-paragraph"
          value={data.summary}
          onChange={(v) => updatePath(['summary'], v)}
          readOnly={readOnly}
          multiline
          placeholder="Profile summary"
        />
      </section>

      <MetricsGrid metrics={data.metrics} readOnly={readOnly} />

      <section className="cv-block">
        <EditableText
          as="h2"
          className="cv-block__title cv-block__title--main"
          value={data.sectionTitles.experience}
          onChange={(v) => updatePath(['sectionTitles', 'experience'], v)}
          readOnly={readOnly}
        />
        {data.experience.map((exp, i) => (
          <ExperienceBlock key={i} exp={exp} ci={i} readOnly={readOnly} />
        ))}
      </section>

      <section className="cv-block">
        <EditableText
          as="h2"
          className="cv-block__title cv-block__title--main"
          value={data.sectionTitles.education}
          onChange={(v) => updatePath(['sectionTitles', 'education'], v)}
          readOnly={readOnly}
        />
        {data.education.map((ed, i) => (
          <EducationBlock key={i} ed={ed} index={i} readOnly={readOnly} />
        ))}
      </section>

      {data.honours.length > 0 && (
        <section className="cv-block">
          <EditableText
            as="h2"
            className="cv-block__title cv-block__title--main"
            value={data.sectionTitles.honours}
            onChange={(v) => updatePath(['sectionTitles', 'honours'], v)}
            readOnly={readOnly}
          />
          {data.honours.map((h, i) => (
            <HonourBlock key={i} honour={h} index={i} readOnly={readOnly} />
          ))}
        </section>
      )}
    </main>
  );
}

function MetricsGrid({
  metrics,
  readOnly,
}: {
  metrics: Metric[];
  readOnly?: boolean;
}) {
  const { updatePath } = useCVStore();
  if (metrics.length === 0) return null;
  return (
    <section className="cv-metrics">
      {metrics.map((m, i) => (
        <div key={i} className="cv-metric">
          <div className="cv-metric__value">
            <EditableText
              value={m.value}
              onChange={(v) => updatePath(['metrics', i, 'value'], v)}
              readOnly={readOnly}
            />
            <span className="cv-metric__unit">
              {' '}
              <EditableText
                value={m.unit}
                onChange={(v) => updatePath(['metrics', i, 'unit'], v)}
                readOnly={readOnly}
              />
            </span>
          </div>
          <div className="cv-metric__label">
            <EditableText
              value={m.label}
              onChange={(v) => updatePath(['metrics', i, 'label'], v)}
              readOnly={readOnly}
              multiline
            />
          </div>
        </div>
      ))}
    </section>
  );
}

function ExperienceBlock({
  exp,
  ci,
  readOnly,
}: {
  exp: Experience;
  ci: number;
  readOnly?: boolean;
}) {
  const { updatePath } = useCVStore();
  return (
    <article className="cv-experience">
      <header className="cv-experience__header">
        <div>
          <EditableText
            as="h3"
            className="cv-experience__company"
            value={exp.company}
            onChange={(v) => updatePath(['experience', ci, 'company'], v)}
            readOnly={readOnly}
          />
          {exp.companyNote && (
            <EditableText
              as="span"
              className="cv-meta"
              value={exp.companyNote}
              onChange={(v) => updatePath(['experience', ci, 'companyNote'], v)}
              readOnly={readOnly}
            />
          )}
        </div>
        <div className="cv-experience__meta">
          <EditableText
            value={exp.location}
            onChange={(v) => updatePath(['experience', ci, 'location'], v)}
            readOnly={readOnly}
          />
          {' · '}
          <EditableText
            value={exp.dates}
            onChange={(v) => updatePath(['experience', ci, 'dates'], v)}
            readOnly={readOnly}
          />
        </div>
      </header>
      {exp.roles.map((role, ri) => (
        <RoleBlock key={ri} role={role} ci={ci} ri={ri} readOnly={readOnly} />
      ))}
    </article>
  );
}

function RoleBlock({
  role,
  ci,
  ri,
  readOnly,
}: {
  role: Role;
  ci: number;
  ri: number;
  readOnly?: boolean;
}) {
  const { updatePath } = useCVStore();
  return (
    <div className="cv-role">
      <div className="cv-role__header">
        <EditableText
          as="h4"
          className="cv-role__title"
          value={role.title}
          onChange={(v) => updatePath(['experience', ci, 'roles', ri, 'title'], v)}
          readOnly={readOnly}
        />
        <EditableText
          className="cv-meta"
          value={role.dates}
          onChange={(v) => updatePath(['experience', ci, 'roles', ri, 'dates'], v)}
          readOnly={readOnly}
        />
      </div>
      <ul className="cv-bullets">
        {role.bullets.map((b, bi) => (
          <li key={bi}>
            <EditableText
              value={b}
              onChange={(v) =>
                updatePath(['experience', ci, 'roles', ri, 'bullets', bi], v)
              }
              readOnly={readOnly}
              multiline
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function EducationBlock({
  ed,
  index,
  readOnly,
}: {
  ed: Education;
  index: number;
  readOnly?: boolean;
}) {
  const { updatePath } = useCVStore();
  return (
    <article className="cv-education">
      <header className="cv-education__header">
        <div>
          <EditableText
            as="h3"
            className="cv-education__degree"
            value={ed.degree}
            onChange={(v) => updatePath(['education', index, 'degree'], v)}
            readOnly={readOnly}
          />
          {ed.spec && (
            <EditableText
              as="span"
              className="cv-meta"
              value={ed.spec}
              onChange={(v) => updatePath(['education', index, 'spec'], v)}
              readOnly={readOnly}
            />
          )}
        </div>
        <div className="cv-education__meta">
          <EditableText
            value={ed.school}
            onChange={(v) => updatePath(['education', index, 'school'], v)}
            readOnly={readOnly}
          />
          {' · '}
          <EditableText
            value={ed.location}
            onChange={(v) => updatePath(['education', index, 'location'], v)}
            readOnly={readOnly}
          />
          {' · '}
          <EditableText
            value={ed.dates}
            onChange={(v) => updatePath(['education', index, 'dates'], v)}
            readOnly={readOnly}
          />
        </div>
      </header>
      {ed.note && (
        <EditableText
          as="p"
          className="cv-paragraph"
          value={ed.note}
          onChange={(v) => updatePath(['education', index, 'note'], v)}
          readOnly={readOnly}
          multiline
        />
      )}
    </article>
  );
}

function HonourBlock({
  honour,
  index,
  readOnly,
}: {
  honour: Honour;
  index: number;
  readOnly?: boolean;
}) {
  const { updatePath } = useCVStore();
  return (
    <article className="cv-honour">
      <header className="cv-honour__header">
        <EditableText
          as="h3"
          className="cv-honour__title"
          value={honour.title}
          onChange={(v) => updatePath(['honours', index, 'title'], v)}
          readOnly={readOnly}
        />
        {honour.years && (
          <EditableText
            className="cv-meta"
            value={honour.years}
            onChange={(v) => updatePath(['honours', index, 'years'], v)}
            readOnly={readOnly}
          />
        )}
      </header>
      <EditableText
        as="p"
        className="cv-paragraph"
        value={honour.text}
        onChange={(v) => updatePath(['honours', index, 'text'], v)}
        readOnly={readOnly}
        multiline
      />
    </article>
  );
}
