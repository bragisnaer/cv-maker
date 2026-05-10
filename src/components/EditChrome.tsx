/**
 * Inline editing affordances. Hidden via .screen-only in print.
 */

interface AddRowProps {
  label: string;
  onClick: () => void;
}

export function AddRow({ label, onClick }: AddRowProps) {
  return (
    <button type="button" className="cv-add screen-only" onClick={onClick}>
      + {label}
    </button>
  );
}

interface RemoveButtonProps {
  label: string;
  onClick: () => void;
}

export function RemoveButton({ label, onClick }: RemoveButtonProps) {
  return (
    <button
      type="button"
      className="cv-remove screen-only"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={label}
      title={label}
    >
      ×
    </button>
  );
}
