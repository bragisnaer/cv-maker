import {
  Fragment,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
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
import { Headshot } from './Headshot';
import { AddRow, RemoveButton } from './EditChrome';
import { A4_HEIGHT_PX, A4_WIDTH_PX } from '../lib/constants';

interface CVDocumentProps {
  data: CVData;
  /** Read-only mode (preview, print). Hides editing chrome. */
  readOnly?: boolean;
}

const PAGE_MARGIN_PX = 36;
const PAGE_CONTENT_PX = A4_HEIGHT_PX - 2 * PAGE_MARGIN_PX;

interface MainBlock {
  id: string;
  node: ReactNode;
}

export function CVDocument({ data, readOnly }: CVDocumentProps) {
  const cssVars: CSSProperties & Record<string, string> = {
    '--cv-ink': data.theme.ink,
    '--cv-side': data.theme.side,
    '--cv-page-w': `${A4_WIDTH_PX}px`,
    '--cv-page-h': `${A4_HEIGHT_PX}px`,
  };

  return <PaginatedCV data={data} readOnly={readOnly} themeVars={cssVars} />;
}

function PaginatedCV({
  data,
  readOnly,
  themeVars,
}: {
  data: CVData;
  readOnly?: boolean;
  themeVars: CSSProperties & Record<string, string>;
}) {
  const { active } = useCVStore();

  const blocks = useMainBlocks(data, readOnly);

  // Measurement pass: render every block in a ghost article (off-screen,
  // visibility: hidden) so we can measure each block's natural height
  // at the real cv-main width.
  const measureRef = useRef<HTMLElement | null>(null);
  const [heights, setHeights] = useState<number[] | null>(null);

  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!root) return;
    const children = Array.from(root.children) as HTMLElement[];
    const measured = children.map((el) => {
      const cs = getComputedStyle(el);
      return (
        el.offsetHeight +
        (parseFloat(cs.marginTop) || 0) +
        (parseFloat(cs.marginBottom) || 0)
      );
    });
    setHeights((prev) => {
      if (
        prev &&
        prev.length === measured.length &&
        prev.every((h, i) => Math.abs(h - measured[i]) < 0.5)
      ) {
        return prev;
      }
      return measured;
    });
  });

  const pages = useMemo(() => {
    if (!heights || heights.length !== blocks.length) {
      return [blocks.map((_, i) => i)];
    }
    return distributeBlocks(heights);
  }, [heights, blocks]);

  return (
    <div className="cv-stack" style={themeVars}>
      <article className="cv-page cv-page--ghost" aria-hidden>
        <aside className="cv-sidebar" />
        <main className="cv-main" ref={measureRef as React.RefObject<HTMLElement>}>
          {blocks.map((b) => (
            <Fragment key={b.id}>{b.node}</Fragment>
          ))}
        </main>
      </article>

      {pages.map((blockIndices, pageIdx) => (
        <article
          key={pageIdx}
          className="cv-page"
          aria-label={
            pageIdx === 0
              ? `${data.name} — CV`
              : `${data.name} — CV (page ${pageIdx + 1})`
          }
        >
          <aside className="cv-sidebar">
            {pageIdx === 0 ? (
              <SidebarContent
                data={data}
                readOnly={readOnly}
                profileName={active}
              />
            ) : null}
          </aside>
          <main className="cv-main">
            {blockIndices.map((i) => (
              <Fragment key={blocks[i].id}>{blocks[i].node}</Fragment>
            ))}
          </main>
        </article>
      ))}
    </div>
  );
}

function distributeBlocks(heights: number[]): number[][] {
  const result: number[][] = [[]];
  let used = 0;
  heights.forEach((h, i) => {
    const current = result[result.length - 1];
    if (used + h > PAGE_CONTENT_PX && current.length > 0) {
      result.push([i]);
      used = h;
    } else {
      current.push(i);
      used += h;
    }
  });
  return result;
}

/* ─────────────────────────────────────────────────────────────────
   Block list — flat sequence of cv-main children for pagination.
   Section headers are bundled with their first entry so we never
   leave a widow header at the bottom of a page.
   ───────────────────────────────────────────────────────────── */

function useMainBlocks(data: CVData, readOnly?: boolean): MainBlock[] {
  return useMemo(() => {
    const blocks: MainBlock[] = [];

    blocks.push({
      id: 'header',
      node: <MainHeader data={data} readOnly={readOnly} />,
    });
    blocks.push({
      id: 'profile',
      node: <ProfileBlock data={data} readOnly={readOnly} />,
    });
    if (data.metrics.length > 0 || !readOnly) {
      blocks.push({
        id: 'metrics',
        node: <MetricsGrid metrics={data.metrics} readOnly={readOnly} />,
      });
    }

    blocks.push({
      id: 'exp-section',
      node: (
        <ExperienceSectionStart
          data={data}
          readOnly={readOnly}
          firstExp={data.experience[0]}
        />
      ),
    });
    for (let i = 1; i < data.experience.length; i++) {
      blocks.push({
        id: `exp-${i}`,
        node: (
          <ExperienceBlock
            exp={data.experience[i]}
            ci={i}
            readOnly={readOnly}
          />
        ),
      });
    }
    if (!readOnly) {
      blocks.push({ id: 'exp-add', node: <ExperienceAddRow /> });
    }

    blocks.push({
      id: 'edu-section',
      node: (
        <EducationSectionStart
          data={data}
          readOnly={readOnly}
          firstEd={data.education[0]}
        />
      ),
    });
    for (let i = 1; i < data.education.length; i++) {
      blocks.push({
        id: `edu-${i}`,
        node: (
          <EducationBlock ed={data.education[i]} index={i} readOnly={readOnly} />
        ),
      });
    }
    if (!readOnly) {
      blocks.push({ id: 'edu-add', node: <EducationAddRow /> });
    }

    if (data.honours.length > 0 || !readOnly) {
      blocks.push({
        id: 'hon-section',
        node: (
          <HonoursSectionStart
            data={data}
            readOnly={readOnly}
            firstHonour={data.honours[0]}
          />
        ),
      });
      for (let i = 1; i < data.honours.length; i++) {
        blocks.push({
          id: `hon-${i}`,
          node: (
            <HonourBlock
              honour={data.honours[i]}
              index={i}
              readOnly={readOnly}
            />
          ),
        });
      }
      if (!readOnly) {
        blocks.push({ id: 'hon-add', node: <HonourAddRow /> });
      }
    }

    return blocks;
  }, [data, readOnly]);
}

/* ─────────────────────────────────────────────────────────────────
   Sidebar — full content stack, rendered on page 1 only.
   ───────────────────────────────────────────────────────────── */

function SidebarContent({
  data,
  readOnly,
  profileName,
}: {
  data: CVData;
  readOnly?: boolean;
  profileName: string;
}) {
  return (
    <>
      <Headshot config={data.headshot} profileName={profileName} readOnly={readOnly} />
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
    </>
  );
}

function MainHeader({ data, readOnly }: { data: CVData; readOnly?: boolean }) {
  const { updatePath } = useCVStore();
  return (
    <header className="cv-main__header">
      <EditableText
        as="h1"
        className="cv-main__name"
        value={data.name}
        onChange={(v) => updatePath(['name'], v)}
        readOnly={readOnly}
        placeholder="Your name"
        ariaLabel="Name"
      />
      <EditableText
        className="cv-main__title"
        value={data.title}
        onChange={(v) => updatePath(['title'], v)}
        readOnly={readOnly}
        placeholder="Title"
        ariaLabel="Title"
      />
    </header>
  );
}

function ProfileBlock({ data, readOnly }: { data: CVData; readOnly?: boolean }) {
  const { updatePath } = useCVStore();
  return (
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
  );
}

function SectionTitle({
  value,
  path,
  readOnly,
}: {
  value: string;
  path: (string | number)[];
  readOnly?: boolean;
}) {
  const { updatePath } = useCVStore();
  return (
    <EditableText
      as="h2"
      className="cv-block__title cv-block__title--main cv-section-title"
      value={value}
      onChange={(v) => updatePath(path, v)}
      readOnly={readOnly}
    />
  );
}

function ExperienceSectionStart({
  data,
  readOnly,
  firstExp,
}: {
  data: CVData;
  readOnly?: boolean;
  firstExp?: Experience;
}) {
  return (
    <div className="cv-section-bundle">
      <SectionTitle
        value={data.sectionTitles.experience}
        path={['sectionTitles', 'experience']}
        readOnly={readOnly}
      />
      {firstExp && (
        <ExperienceBlock exp={firstExp} ci={0} readOnly={readOnly} />
      )}
    </div>
  );
}

function EducationSectionStart({
  data,
  readOnly,
  firstEd,
}: {
  data: CVData;
  readOnly?: boolean;
  firstEd?: Education;
}) {
  return (
    <div className="cv-section-bundle">
      <SectionTitle
        value={data.sectionTitles.education}
        path={['sectionTitles', 'education']}
        readOnly={readOnly}
      />
      {firstEd && (
        <EducationBlock ed={firstEd} index={0} readOnly={readOnly} />
      )}
    </div>
  );
}

function HonoursSectionStart({
  data,
  readOnly,
  firstHonour,
}: {
  data: CVData;
  readOnly?: boolean;
  firstHonour?: Honour;
}) {
  return (
    <div className="cv-section-bundle">
      <SectionTitle
        value={data.sectionTitles.honours}
        path={['sectionTitles', 'honours']}
        readOnly={readOnly}
      />
      {firstHonour && (
        <HonourBlock honour={firstHonour} index={0} readOnly={readOnly} />
      )}
    </div>
  );
}

function ExperienceAddRow() {
  const { appendAt } = useCVStore();
  return (
    <AddRow
      label="company"
      onClick={() =>
        appendAt(['experience'], {
          company: 'New company',
          companyNote: '',
          location: 'Location',
          dates: 'Dates',
          roles: [
            { title: 'Role', dates: 'Dates', bullets: ['Bullet point.'] },
          ],
        })
      }
    />
  );
}

function EducationAddRow() {
  const { appendAt } = useCVStore();
  return (
    <AddRow
      label="education"
      onClick={() =>
        appendAt(['education'], {
          degree: 'Degree',
          spec: '',
          school: 'School',
          location: 'Location',
          dates: 'Dates',
          note: '',
        })
      }
    />
  );
}

function HonourAddRow() {
  const { appendAt } = useCVStore();
  return (
    <AddRow
      label="honour"
      onClick={() =>
        appendAt(['honours'], {
          title: 'Honour',
          years: '',
          text: 'Description.',
        })
      }
    />
  );
}

/* ─────────────────────────────────────────────────────────────────
   Sidebar sub-components (unchanged from previous version)
   ───────────────────────────────────────────────────────────── */

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
  const { updatePath, appendAt, removeAt } = useCVStore();
  switch (id) {
    case 'competencies':
      return (
        <>
          <ul className="cv-list">
            {data.competencies.map((c, i) => (
              <li key={i} className="cv-li">
                <EditableText
                  value={c}
                  onChange={(v) => updatePath(['competencies', i], v)}
                  readOnly={readOnly}
                  placeholder="Competency"
                />
                {!readOnly && (
                  <RemoveButton
                    label="Remove competency"
                    onClick={() => removeAt(['competencies'], i)}
                  />
                )}
              </li>
            ))}
          </ul>
          {!readOnly && (
            <AddRow
              label="competency"
              onClick={() => appendAt(['competencies'], 'New competency')}
            />
          )}
        </>
      );
    case 'tools':
      return <ToolsList tools={data.tools} readOnly={readOnly} />;
    case 'languages':
      return <LanguagesList languages={data.languages} readOnly={readOnly} />;
    case 'certifications':
      return (
        <>
          <ul className="cv-list">
            {data.certifications.map((c, i) => (
              <li key={i} className="cv-li">
                <EditableText
                  value={c.name}
                  onChange={(v) => updatePath(['certifications', i, 'name'], v)}
                  readOnly={readOnly}
                  placeholder="Certification"
                />
                <span className="cv-meta">
                  {' · '}
                  <EditableText
                    value={c.year ?? ''}
                    onChange={(v) => updatePath(['certifications', i, 'year'], v)}
                    readOnly={readOnly}
                    placeholder="Year"
                  />
                </span>
                {!readOnly && (
                  <RemoveButton
                    label="Remove certification"
                    onClick={() => removeAt(['certifications'], i)}
                  />
                )}
              </li>
            ))}
          </ul>
          {!readOnly && (
            <AddRow
              label="certification"
              onClick={() =>
                appendAt(['certifications'], { name: 'Certification', year: '' })
              }
            />
          )}
        </>
      );
    case 'softSkills':
      return (
        <>
          <ul className="cv-list">
            {data.softSkills.map((s, i) => (
              <li key={i} className="cv-li">
                <EditableText
                  value={s}
                  onChange={(v) => updatePath(['softSkills', i], v)}
                  readOnly={readOnly}
                />
                {!readOnly && (
                  <RemoveButton
                    label="Remove soft skill"
                    onClick={() => removeAt(['softSkills'], i)}
                  />
                )}
              </li>
            ))}
          </ul>
          {!readOnly && (
            <AddRow
              label="soft skill"
              onClick={() => appendAt(['softSkills'], 'New soft skill')}
            />
          )}
        </>
      );
    case 'positions':
      return <PositionsList positions={data.positions} readOnly={readOnly} />;
    case 'interests':
      return (
        <>
          <ul className="cv-list cv-list--inline">
            {data.interests.map((s, i) => (
              <li key={i} className="cv-li cv-li--inline">
                <EditableText
                  value={s}
                  onChange={(v) => updatePath(['interests', i], v)}
                  readOnly={readOnly}
                />
                {!readOnly && (
                  <RemoveButton
                    label="Remove interest"
                    onClick={() => removeAt(['interests'], i)}
                  />
                )}
              </li>
            ))}
          </ul>
          {!readOnly && (
            <AddRow
              label="interest"
              onClick={() => appendAt(['interests'], 'New interest')}
            />
          )}
        </>
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
  const { updatePath, appendAt, removeAt } = useCVStore();
  return (
    <>
      <ul className="cv-list">
        {tools.map((t, i) => (
          <li key={i} className="cv-tool cv-li">
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
            {!readOnly && (
              <RemoveButton
                label="Remove tool"
                onClick={() => removeAt(['tools'], i)}
              />
            )}
          </li>
        ))}
      </ul>
      {!readOnly && (
        <AddRow
          label="tool"
          onClick={() => appendAt(['tools'], { name: 'New tool', level: 'Fundamental' })}
        />
      )}
    </>
  );
}

function LanguagesList({
  languages,
  readOnly,
}: {
  languages: Language[];
  readOnly?: boolean;
}) {
  const { updatePath, appendAt, removeAt } = useCVStore();
  return (
    <>
      <ul className="cv-list cv-languages">
        {languages.map((l, i) => (
          <li key={i} className="cv-li">
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
            {!readOnly && (
              <RemoveButton
                label="Remove language"
                onClick={() => removeAt(['languages'], i)}
              />
            )}
          </li>
        ))}
      </ul>
      {!readOnly && (
        <AddRow
          label="language"
          onClick={() =>
            appendAt(['languages'], { name: 'Language', level: 'Working', pct: 60 })
          }
        />
      )}
    </>
  );
}

function PositionsList({
  positions,
  readOnly,
}: {
  positions: Position[];
  readOnly?: boolean;
}) {
  const { updatePath, appendAt, removeAt } = useCVStore();
  return (
    <>
      <ul className="cv-list">
        {positions.map((p, i) => (
          <li key={i} className="cv-li">
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
              {' · '}
              <EditableText
                value={p.dates ?? ''}
                onChange={(v) => updatePath(['positions', i, 'dates'], v)}
                readOnly={readOnly}
                placeholder="Dates"
              />
            </div>
            {!readOnly && (
              <RemoveButton
                label="Remove position"
                onClick={() => removeAt(['positions'], i)}
              />
            )}
          </li>
        ))}
      </ul>
      {!readOnly && (
        <AddRow
          label="position"
          onClick={() =>
            appendAt(['positions'], { role: 'Role', org: 'Organisation', dates: '' })
          }
        />
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main column blocks
   ───────────────────────────────────────────────────────────── */

function MetricsGrid({
  metrics,
  readOnly,
}: {
  metrics: Metric[];
  readOnly?: boolean;
}) {
  const { updatePath, appendAt, removeAt } = useCVStore();
  if (metrics.length === 0 && readOnly) return null;
  return (
    <section className="cv-metrics-wrap">
      <div className="cv-metrics">
        {metrics.map((m, i) => (
          <div key={i} className="cv-metric cv-li">
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
            {!readOnly && (
              <RemoveButton
                label="Remove metric"
                onClick={() => removeAt(['metrics'], i)}
              />
            )}
          </div>
        ))}
      </div>
      {!readOnly && (
        <AddRow
          label="metric"
          onClick={() =>
            appendAt(['metrics'], { value: 'X', unit: 'unit', label: 'Label' })
          }
        />
      )}
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
  const { updatePath, appendAt, removeAt } = useCVStore();
  return (
    <article className="cv-experience cv-li">
      <header className="cv-experience__header">
        <div>
          <EditableText
            as="h3"
            className="cv-experience__company"
            value={exp.company}
            onChange={(v) => updatePath(['experience', ci, 'company'], v)}
            readOnly={readOnly}
          />
          <EditableText
            as="div"
            className="cv-meta"
            value={exp.companyNote ?? ''}
            onChange={(v) => updatePath(['experience', ci, 'companyNote'], v)}
            readOnly={readOnly}
            placeholder="Company note"
          />
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
        <RoleBlock
          key={ri}
          role={role}
          ci={ci}
          ri={ri}
          rolesLength={exp.roles.length}
          readOnly={readOnly}
        />
      ))}
      {!readOnly && (
        <AddRow
          label="role"
          onClick={() =>
            appendAt(['experience', ci, 'roles'], {
              title: 'New role',
              dates: 'Dates',
              bullets: ['Bullet point.'],
            })
          }
        />
      )}
      {!readOnly && (
        <RemoveButton
          label="Remove company"
          onClick={() => removeAt(['experience'], ci)}
        />
      )}
    </article>
  );
}

function RoleBlock({
  role,
  ci,
  ri,
  rolesLength,
  readOnly,
}: {
  role: Role;
  ci: number;
  ri: number;
  rolesLength: number;
  readOnly?: boolean;
}) {
  const { updatePath, appendAt, removeAt } = useCVStore();
  return (
    <div className="cv-role cv-li">
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
          <li key={bi} className="cv-li">
            <EditableText
              value={b}
              onChange={(v) =>
                updatePath(['experience', ci, 'roles', ri, 'bullets', bi], v)
              }
              readOnly={readOnly}
              multiline
            />
            {!readOnly && (
              <RemoveButton
                label="Remove bullet"
                onClick={() => removeAt(['experience', ci, 'roles', ri, 'bullets'], bi)}
              />
            )}
          </li>
        ))}
      </ul>
      {!readOnly && (
        <AddRow
          label="bullet"
          onClick={() =>
            appendAt(['experience', ci, 'roles', ri, 'bullets'], 'Bullet point.')
          }
        />
      )}
      {!readOnly && rolesLength > 1 && (
        <RemoveButton
          label="Remove role"
          onClick={() => removeAt(['experience', ci, 'roles'], ri)}
        />
      )}
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
  const { updatePath, removeAt } = useCVStore();
  return (
    <article className="cv-education cv-li">
      <header className="cv-education__header">
        <div>
          <EditableText
            as="h3"
            className="cv-education__degree"
            value={ed.degree}
            onChange={(v) => updatePath(['education', index, 'degree'], v)}
            readOnly={readOnly}
          />
          <EditableText
            as="div"
            className="cv-meta"
            value={ed.spec ?? ''}
            onChange={(v) => updatePath(['education', index, 'spec'], v)}
            readOnly={readOnly}
            placeholder="Specialisation"
          />
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
      <EditableText
        as="p"
        className="cv-paragraph"
        value={ed.note ?? ''}
        onChange={(v) => updatePath(['education', index, 'note'], v)}
        readOnly={readOnly}
        multiline
        placeholder="Note"
      />
      {!readOnly && (
        <RemoveButton
          label="Remove education"
          onClick={() => removeAt(['education'], index)}
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
  const { updatePath, removeAt } = useCVStore();
  return (
    <article className="cv-honour cv-li">
      <header className="cv-honour__header">
        <EditableText
          as="h3"
          className="cv-honour__title"
          value={honour.title}
          onChange={(v) => updatePath(['honours', index, 'title'], v)}
          readOnly={readOnly}
        />
        <EditableText
          className="cv-meta"
          value={honour.years ?? ''}
          onChange={(v) => updatePath(['honours', index, 'years'], v)}
          readOnly={readOnly}
          placeholder="Year"
        />
      </header>
      <EditableText
        as="p"
        className="cv-paragraph"
        value={honour.text}
        onChange={(v) => updatePath(['honours', index, 'text'], v)}
        readOnly={readOnly}
        multiline
      />
      {!readOnly && (
        <RemoveButton
          label="Remove honour"
          onClick={() => removeAt(['honours'], index)}
        />
      )}
    </article>
  );
}
