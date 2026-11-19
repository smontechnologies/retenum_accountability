/** The monochrome mark drawn for generated icons (D-60). `padding` keeps maskable icons in the safe zone. */
export function Mark({ size, padding = 0 }: { size: number; padding?: number }) {
  const inner = size - padding * 2;
  return (
    <div style={{ width: size, height: size, background: "#000000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: inner,
          height: inner,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontSize: Math.round(inner * 0.58),
          fontWeight: 600,
          fontFamily: "sans-serif",
          letterSpacing: -Math.round(inner * 0.02),
        }}
      >
        R
      </div>
    </div>
  );
}
