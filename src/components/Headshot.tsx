import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type { Headshot as HeadshotConfig, HeadshotShape } from '../types/cv';
import { HEADSHOT_SHAPES } from '../types/cv';
import {
  imageDelete,
  imageGet,
  imagePut,
  profileHeadshotKey,
} from '../lib/storage';
import { useCVStore } from '../state/useCVStore';
import { classNames } from '../lib/helpers';

const SHAPE_CLIP: Record<HeadshotShape, string> = {
  circle: 'circle(50%)',
  rounded: 'inset(0 round 14%)',
  square: 'inset(0)',
  arch: 'inset(0 round 50% 50% 0 0 / 50% 50% 0 0)',
  hexagon: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
  capsule: 'inset(0 round 50%)',
};

const SHAPE_LABEL: Record<HeadshotShape, string> = {
  circle: 'Circle',
  rounded: 'Rounded',
  square: 'Square',
  arch: 'Arch',
  hexagon: 'Hexagon',
  capsule: 'Capsule',
};

interface HeadshotProps {
  config: HeadshotConfig;
  profileName: string;
  readOnly?: boolean;
}

export function Headshot({ config, profileName, readOnly }: HeadshotProps) {
  const { updatePath } = useCVStore();
  const [src, setSrc] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    initX: number;
    initY: number;
  } | null>(null);

  // Load bytes whenever the active profile changes.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const data = await imageGet(profileHeadshotKey(profileName));
      if (!cancelled) setSrc(data);
    })();
    return () => {
      cancelled = true;
    };
  }, [profileName]);

  // Measure intrinsic image size so the centring math is correct.
  useEffect(() => {
    if (!src) {
      setImgSize(null);
      return;
    }
    const img = new Image();
    img.onload = () => setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = src;
  }, [src]);

  const onUploadClick = () => fileRef.current?.click();

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = String(reader.result ?? '');
        if (!dataUrl) return;
        await imagePut(profileHeadshotKey(profileName), dataUrl);
        setSrc(dataUrl);
        // Reset transform on new image
        updatePath(['headshot'], { ...config, x: 0, y: 0, scale: 1 });
      };
      reader.readAsDataURL(file);
      if (fileRef.current) fileRef.current.value = '';
    },
    [profileName, config, updatePath],
  );

  const onRemove = useCallback(async () => {
    if (!window.confirm('Remove the headshot?')) return;
    await imageDelete(profileHeadshotKey(profileName));
    setSrc(null);
  }, [profileName]);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (!editing || !src) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initX: config.x,
      initY: config.y,
    };
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    if (!dragRef.current) return;
    const { startX, startY, initX, initY } = dragRef.current;
    updatePath(['headshot', 'x'], initX + (e.clientX - startX));
    updatePath(['headshot', 'y'], initY + (e.clientY - startY));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const imgStyle = useMemo<CSSProperties>(() => {
    if (!imgSize) return {};
    // Scale image so the smaller side fits the frame, then apply user scale
    const baseScale = Math.max(
      config.size / imgSize.w,
      config.size / imgSize.h,
    );
    const totalScale = baseScale * config.scale;
    const drawnW = imgSize.w * totalScale;
    const drawnH = imgSize.h * totalScale;
    const cx = (config.size - drawnW) / 2;
    const cy = (config.size - drawnH) / 2;
    return {
      transform: `translate(${cx + config.x}px, ${cy + config.y}px) scale(${totalScale})`,
    };
  }, [imgSize, config.size, config.scale, config.x, config.y]);

  const frameStyle: CSSProperties = {
    width: config.size,
    height: config.size,
    clipPath: SHAPE_CLIP[config.shape],
  };

  const alignStyle: CSSProperties = {
    alignSelf:
      config.align === 'center'
        ? 'center'
        : config.align === 'right'
          ? 'flex-end'
          : 'flex-start',
  };

  if (!src && readOnly) return null;

  return (
    <div className="hs" style={alignStyle}>
      <div
        className={classNames(
          'hs__frame',
          editing && 'hs__frame--editing',
          !src && 'hs__frame--empty',
        )}
        style={frameStyle}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {src ? (
          <img className="hs__img" src={src} style={imgStyle} alt="" draggable={false} />
        ) : (
          !readOnly && <span className="hs__placeholder">Headshot</span>
        )}
      </div>

      {!readOnly && (
        <div className="hs__tools screen-only">
          {!editing ? (
            <button
              type="button"
              className="hs__btn"
              onClick={() => (src ? setEditing(true) : onUploadClick())}
            >
              {src ? 'Edit' : 'Upload'}
            </button>
          ) : (
            <>
              <div className="hs__shapes">
                {HEADSHOT_SHAPES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={classNames(
                      'hs__shape',
                      config.shape === s && 'hs__shape--active',
                    )}
                    onClick={() => updatePath(['headshot', 'shape'], s)}
                    title={SHAPE_LABEL[s]}
                    aria-label={SHAPE_LABEL[s]}
                  >
                    {SHAPE_LABEL[s].charAt(0)}
                  </button>
                ))}
              </div>
              <label className="hs__slider">
                <span>Zoom</span>
                <input
                  type="range"
                  min={0.5}
                  max={3}
                  step={0.05}
                  value={config.scale}
                  onChange={(e) =>
                    updatePath(['headshot', 'scale'], Number(e.target.value))
                  }
                />
              </label>
              <div className="hs__align">
                {(['left', 'center', 'right'] as const).map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={classNames(
                      'hs__btn hs__btn--small',
                      config.align === a && 'hs__btn--active',
                    )}
                    onClick={() => updatePath(['headshot', 'align'], a)}
                    title={`Align ${a}`}
                  >
                    {a.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="hs__row">
                <button type="button" className="hs__btn" onClick={onUploadClick}>
                  Replace
                </button>
                <button
                  type="button"
                  className="hs__btn"
                  onClick={() =>
                    updatePath(['headshot'], { ...config, x: 0, y: 0, scale: 1 })
                  }
                >
                  Re-centre
                </button>
                <button
                  type="button"
                  className="hs__btn hs__btn--danger"
                  onClick={onRemove}
                >
                  Remove
                </button>
                <button
                  type="button"
                  className="hs__btn hs__btn--primary"
                  onClick={() => setEditing(false)}
                >
                  Done
                </button>
              </div>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            hidden
          />
        </div>
      )}
    </div>
  );
}
