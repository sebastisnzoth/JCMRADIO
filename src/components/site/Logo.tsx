const EQ_COLUMNS = [3, 4, 5, 7, 5];
const DOT_W = 4;
const DOT_H = 3;
const GAP_X = 2.2;
const GAP_Y = 1.5;
const EQ_ROWS = Math.max(...EQ_COLUMNS);
const EQ_WIDTH = EQ_COLUMNS.length * DOT_W + (EQ_COLUMNS.length - 1) * GAP_X;
const EQ_HEIGHT = EQ_ROWS * DOT_H + (EQ_ROWS - 1) * GAP_Y;

function Equalizer() {
  return (
    <svg className="jcm-logo__eq" viewBox={`0 0 ${EQ_WIDTH} ${EQ_HEIGHT}`} aria-hidden="true" focusable="false">
      {EQ_COLUMNS.map((count, column) =>
        Array.from({ length: count }, (_, row) => (
          <rect
            key={`${column}-${row}`}
            x={column * (DOT_W + GAP_X)}
            y={EQ_HEIGHT - DOT_H - row * (DOT_H + GAP_Y)}
            width={DOT_W}
            height={DOT_H}
            rx={0.6}
            fill={row === count - 1 ? '#ef233c' : '#f1f3f7'}
          />
        )),
      )}
    </svg>
  );
}

/** Logo de JCM Radio: "JCM" blanco, "RADIO" rojo con la O como botón de play y ecualizador. */
export function Logo({ tagline = true }: { tagline?: boolean }) {
  return (
    <span className="jcm-logo" role="img" aria-label="JCM Radio, la radio que te acompaña">
      <span className="jcm-logo__wordmark" aria-hidden="true">
        <span className="jcm-logo__jcm">JCM</span>
        <span className="jcm-logo__radio">RADI</span>
        <svg className="jcm-logo__play" viewBox="0 0 30 36" focusable="false">
          <rect width="30" height="36" rx="13" fill="currentColor" />
          <path d="M11.5 10.5 22.5 18l-11 7.5Z" fill="#fff" />
        </svg>
        <Equalizer />
      </span>
      {tagline && (
        <span className="jcm-logo__tagline" aria-hidden="true">
          La radio que te acompaña
        </span>
      )}
    </span>
  );
}

/** Miniatura cuadrada con la marca (portada por defecto del reproductor). */
export function BrandTile() {
  return (
    <span className="jcm-brand-tile" aria-hidden="true">
      <b>JCM</b>
      <b>RADIO</b>
      <small>LA RADIO QUE TE ACOMPAÑA</small>
    </span>
  );
}
