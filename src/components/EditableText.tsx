import { useCallback, useEffect, useRef, type CSSProperties } from 'react';
import { classNames } from '../lib/helpers';

interface EditableTextProps {
  value: string;
  onChange: (next: string) => void;
  /** HTML tag to render. Defaults to span. */
  as?: keyof HTMLElementTagNameMap;
  className?: string;
  style?: CSSProperties;
  placeholder?: string;
  /** Disables the contentEditable surface (read-only render). */
  readOnly?: boolean;
  /** Allow newlines via Enter (otherwise Enter blurs). */
  multiline?: boolean;
  ariaLabel?: string;
}

/**
 * Controlled contentEditable. Stays uncontrolled internally to avoid
 * caret jumps; reconciles back to the prop value only when the prop
 * changes externally.
 */
export function EditableText({
  value,
  onChange,
  as = 'span',
  className,
  style,
  placeholder,
  readOnly,
  multiline,
  ariaLabel,
}: EditableTextProps) {
  const ref = useRef<HTMLElement | null>(null);

  // Sync external changes only when they differ from current DOM text
  // (prevents wiping the user's caret on every keystroke).
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.textContent !== value) {
      el.textContent = value;
    }
  }, [value]);

  const handleInput = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    onChange(el.textContent ?? '');
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!multiline && e.key === 'Enter') {
        e.preventDefault();
        (e.target as HTMLElement).blur();
      }
    },
    [multiline],
  );

  const Tag = as as 'span';
  return (
    <Tag
      ref={ref as React.RefObject<HTMLSpanElement>}
      className={classNames('editable', !value && 'editable--empty', className)}
      style={style}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      spellCheck
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      data-placeholder={placeholder ?? ''}
      role={readOnly ? undefined : 'textbox'}
      aria-label={ariaLabel}
      aria-multiline={multiline ? true : undefined}
    />
  );
}
