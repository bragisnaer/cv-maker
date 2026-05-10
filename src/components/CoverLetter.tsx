import type { CSSProperties } from 'react';
import type { CVData } from '../types/cv';
import { useCVStore } from '../state/useCVStore';
import { EditableText } from './EditableText';
import { AddRow, RemoveButton } from './EditChrome';
import { A4_HEIGHT_PX, A4_WIDTH_PX } from '../lib/constants';

interface CoverLetterProps {
  data: CVData;
  readOnly?: boolean;
}

/**
 * Default sender lines if the user hasn't customised them yet.
 * Mirrors the v1 virtual-seed behaviour: derive from CV name +
 * contact, but only persist once the user actually edits.
 */
function deriveSenderLines(data: CVData): string[] {
  const out: string[] = [];
  if (data.name) out.push(data.name);
  if (data.contact.location) out.push(data.contact.location);
  if (data.contact.email) out.push(data.contact.email);
  if (data.contact.phone) out.push(data.contact.phone);
  return out;
}

function todayString(): string {
  const d = new Date();
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function CoverLetter({ data, readOnly }: CoverLetterProps) {
  const { updatePath, appendAt, removeAt } = useCVStore();
  const cl = data.coverLetter;
  const senderLines =
    cl.sender.lines.length > 0 ? cl.sender.lines : deriveSenderLines(data);
  const dateText = cl.date || todayString();

  const cssVars: CSSProperties & Record<string, string> = {
    '--cv-page-w': `${A4_WIDTH_PX}px`,
    '--cv-page-h': `${A4_HEIGHT_PX}px`,
    '--cv-side': data.theme.side,
    '--cv-ink': data.theme.ink,
  };

  function moveLine(i: number, dir: -1 | 1) {
    const lines = senderLines.slice();
    const j = i + dir;
    if (j < 0 || j >= lines.length) return;
    [lines[i], lines[j]] = [lines[j], lines[i]];
    updatePath(['coverLetter', 'sender', 'lines'], lines);
  }

  return (
    <article className="cl-page" style={cssVars} aria-label="Cover letter">
      <header className="cl-sender">
        <ul className="cl-sender__list">
          {senderLines.map((line, i) => (
            <li key={i} className="cv-li cl-sender__row">
              <EditableText
                value={line}
                onChange={(v) => {
                  // First edit promotes virtual seed to a stored array
                  const next = senderLines.slice();
                  next[i] = v;
                  updatePath(['coverLetter', 'sender', 'lines'], next);
                }}
                readOnly={readOnly}
                placeholder="Sender line"
              />
              {!readOnly && (
                <div className="cl-sender__tools screen-only">
                  <button
                    type="button"
                    onClick={() => moveLine(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLine(i, 1)}
                    disabled={i === senderLines.length - 1}
                    aria-label="Move down"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <RemoveButton
                    label="Remove line"
                    onClick={() => removeAt(['coverLetter', 'sender', 'lines'], i)}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
        {!readOnly && (
          <AddRow
            label="sender line"
            onClick={() =>
              appendAt(['coverLetter', 'sender', 'lines'], 'New line')
            }
          />
        )}
      </header>

      <div className="cl-date">
        <EditableText
          value={cl.date}
          onChange={(v) => updatePath(['coverLetter', 'date'], v)}
          readOnly={readOnly}
          placeholder={dateText}
        />
      </div>

      <section className="cl-recipient">
        <EditableText
          as="div"
          value={cl.recipient.name}
          onChange={(v) => updatePath(['coverLetter', 'recipient', 'name'], v)}
          readOnly={readOnly}
          placeholder="Recipient name"
        />
        <EditableText
          as="div"
          value={cl.recipient.title}
          onChange={(v) => updatePath(['coverLetter', 'recipient', 'title'], v)}
          readOnly={readOnly}
          placeholder="Recipient title"
        />
        <EditableText
          as="div"
          value={cl.recipient.company}
          onChange={(v) => updatePath(['coverLetter', 'recipient', 'company'], v)}
          readOnly={readOnly}
          placeholder="Company"
        />
        <EditableText
          as="div"
          value={cl.recipient.address}
          onChange={(v) => updatePath(['coverLetter', 'recipient', 'address'], v)}
          readOnly={readOnly}
          placeholder="Address"
          multiline
        />
      </section>

      {cl.subject && (
        <EditableText
          as="h2"
          className="cl-subject"
          value={cl.subject}
          onChange={(v) => updatePath(['coverLetter', 'subject'], v)}
          readOnly={readOnly}
        />
      )}
      {!cl.subject && !readOnly && (
        <EditableText
          as="h2"
          className="cl-subject"
          value=""
          onChange={(v) => updatePath(['coverLetter', 'subject'], v)}
          readOnly={false}
          placeholder="Subject (optional)"
        />
      )}

      <EditableText
        as="p"
        className="cl-salutation"
        value={cl.salutation}
        onChange={(v) => updatePath(['coverLetter', 'salutation'], v)}
        readOnly={readOnly}
      />

      <EditableText
        as="div"
        className="cl-body"
        value={cl.body}
        onChange={(v) => updatePath(['coverLetter', 'body'], v)}
        readOnly={readOnly}
        multiline
        placeholder="Letter body"
      />

      <footer className="cl-signoff">
        <EditableText
          as="p"
          value={cl.signoff}
          onChange={(v) => updatePath(['coverLetter', 'signoff'], v)}
          readOnly={readOnly}
        />
        <EditableText
          as="p"
          className="cl-signname"
          value={cl.signName || data.name}
          onChange={(v) => updatePath(['coverLetter', 'signName'], v)}
          readOnly={readOnly}
          placeholder="Your name"
        />
      </footer>
    </article>
  );
}
