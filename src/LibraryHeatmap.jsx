import { useState, useEffect } from "react";


const SVG_W = 700;
const SVG_H = 460;

// ── Build table grid inside a room rect 
function makeTables(room, cols, rows, prefix, caps, idStart) {
  const PAD_X = 12, PAD_Y = 22, GAP_X = 10, GAP_Y = 10;
  const tw = (room.w - PAD_X * 2 - GAP_X * (cols - 1)) / cols;
  const th = (room.h - PAD_Y - 12 - GAP_Y * (rows - 1)) / rows;
  const out = [];
  let id = idStart;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      out.push({
        id: id++,
        label: `${prefix}${r * cols + c + 1}`,
        capacity: caps[r * cols + c],

        x: (room.x + PAD_X + c * (tw + GAP_X)) / SVG_W,
        y: (room.y + PAD_Y + r * (th + GAP_Y)) / SVG_H,
        w: tw / SVG_W,
        h: th / SVG_H,
      });
  return out;
}


const RA = { x: 28,  y: 62, w: 154, h: 374 };
const MH = { x: 214, y: 62, w: 268, h: 374 };
const RB = { x: 512, y: 62, w: 160, h: 374 };

const TABLES = [
  ...makeTables(RA, 2, 3, "A", [4, 4, 6, 6, 4, 4],   1),
  ...makeTables(MH, 2, 3, "M", [8, 8, 6, 6, 10, 10],  7),
  ...makeTables(RB, 2, 3, "B", [4, 4, 6, 6, 4, 4],   13),
];

function randomCounts() {
  return TABLES.map((t) => ({ id: t.id, count: Math.floor(Math.random() * (t.capacity + 1)) }));
}

function getColor(count, capacity, dark) {
  if (count === 0)
    return dark
      ? { bg: "rgba(59,130,246,0.20)",  border: "#3b82f6", text: "#93c5fd" }
      : { bg: "rgba(219,234,254,0.80)", border: "#3b82f6", text: "#1d4ed8" };
  if (count >= capacity)
    return dark
      ? { bg: "rgba(239,68,68,0.22)",   border: "#f87171", text: "#fca5a5" }
      : { bg: "rgba(254,226,226,0.90)", border: "#f87171", text: "#b91c1c" };
  const ratio = count / capacity;
  if (ratio <= 0.5)
    return dark
      ? { bg: "rgba(34,197,94,0.20)",   border: "#4ade80", text: "#86efac" }
      : { bg: "rgba(220,252,231,0.90)", border: "#4ade80", text: "#166534" };
  return dark
    ? { bg: "rgba(234,179,8,0.20)",   border: "#facc15", text: "#fde047" }
    : { bg: "rgba(254,249,195,0.92)", border: "#facc15", text: "#854d0e" };
}


function TableZone({ table, count, dark }) {
  const [hovered, setHovered] = useState(false);
  const col = getColor(count, table.capacity, dark);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "absolute",
        left:   `${(table.x * 100).toFixed(3)}%`,
        top:    `${(table.y * 100).toFixed(3)}%`,
        width:  `${(table.w * 100).toFixed(3)}%`,
        height: `${(table.h * 100).toFixed(3)}%`,
        background: col.bg,
        border: `1.5px solid ${col.border}`,
        borderRadius: 5,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 2,
        cursor: "default",
        transition: "background 0.5s ease, border-color 0.5s ease",
        userSelect: "none",
        zIndex: hovered ? 20 : 1,
      }}
    >
      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.04em", color: col.text, lineHeight: 1, opacity: 0.85 }}>
        {table.label}
      </span>
      <span style={{ fontSize: 12, fontWeight: 700, color: col.text, lineHeight: 1 }}>
        {count}
      </span>
      {hovered && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 7px)", left: "50%",
          transform: "translateX(-50%)",
          background: dark ? "#1e293b" : "#0f172a",
          color: "#f8fafc", borderRadius: 6,
          padding: "5px 11px", fontSize: 11, fontWeight: 500,
          whiteSpace: "nowrap", zIndex: 50, pointerEvents: "none",
          border: dark ? "1px solid #334155" : "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}>
          Table {table.label} · {count} / {table.capacity} seats
          <div style={{
            position: "absolute", top: "100%", left: "50%",
            transform: "translateX(-50%)",
            borderLeft: "5px solid transparent", borderRight: "5px solid transparent",
            borderTop: `5px solid ${dark ? "#1e293b" : "#0f172a"}`,
            width: 0, height: 0,
          }} />
        </div>
      )}
    </div>
  );
}


function FloorPlan({ dark }) {
  const c = {
    outer:  dark ? "#0f172a" : "#f1f5f9",
    plate:  dark ? "#1e293b" : "#ffffff",
    strip:  dark ? "#162032" : "#f8fafc",
    room:   dark ? "#172033" : "#fafafa",
    sk:     dark ? "#2e3f55" : "#e2e8f0",
    corr:   dark ? "#111827" : "#f0f4f8",
    lbl:    dark ? "#4b6080" : "#94a3b8",
    ttl:    dark ? "#5a7090" : "#64748b",
    div:    dark ? "#1c2d40" : "#eeeff2",
    exitBg: dark ? "#162030" : "#f0f4f8",
  };
  const f = "system-ui,-apple-system,sans-serif";

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block", width: "100%", height: "100%" }}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* canvas bg */}
      <rect width={SVG_W} height={SVG_H} fill={c.outer} />
      {/* floor plate */}
      <rect x="18" y="18" width="664" height="424" fill={c.plate} stroke={c.sk} strokeWidth="1" rx="10" />
      {/* header */}
      <rect x="18" y="18" width="664" height="38" fill={c.strip} rx="10" />
      <rect x="18" y="44" width="664" height="12" fill={c.strip} />
      <text x="350" y="43" textAnchor="middle" fontSize="11" fontWeight="600"
        fill={c.ttl} fontFamily={f} letterSpacing="0.08em">
        CITY CENTRAL LIBRARY · FLOOR 2
      </text>

      {/* Room A */}
      <rect x={RA.x} y={RA.y} width={RA.w} height={RA.h} fill={c.room} stroke={c.sk} strokeWidth="0.75" rx="4" />
      <text x={RA.x + RA.w / 2} y={RA.y + 14} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={c.lbl} fontFamily={f} letterSpacing="0.07em">ROOM A</text>

      {/* Corridor */}
      <rect x="182" y={RA.y} width="32" height={RA.h} fill={c.corr} />
      <line x1="182" y1={RA.y} x2="182" y2={RA.y + RA.h} stroke={c.sk} strokeWidth="0.75" />
      <line x1="214" y1={RA.y} x2="214" y2={RA.y + RA.h} stroke={c.sk} strokeWidth="0.75" />
      <text x="198" y="260" textAnchor="middle" fontSize="7.5" fill={c.corr === c.outer ? c.lbl : (dark ? "#253545" : "#c0ccd8")}
        fontFamily={f} transform="rotate(-90,198,260)">CORRIDOR</text>

      {/* Main Hall */}
      <rect x={MH.x} y={MH.y} width={MH.w} height={MH.h} fill={c.room} stroke={c.sk} strokeWidth="0.75" />
      <text x={MH.x + MH.w / 2} y={MH.y + 14} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={c.lbl} fontFamily={f} letterSpacing="0.07em">MAIN READING HALL</text>
      <line x1="348" y1={MH.y + 20} x2="348" y2={MH.y + MH.h - 8}
        stroke={c.div} strokeWidth="0.5" strokeDasharray="5,4" />

      {/* Aisle */}
      <rect x="482" y={RA.y} width="30" height={RA.h} fill={c.corr} />
      <line x1="482" y1={RA.y} x2="482" y2={RA.y + RA.h} stroke={c.sk} strokeWidth="0.75" />
      <line x1="512" y1={RA.y} x2="512" y2={RA.y + RA.h} stroke={c.sk} strokeWidth="0.75" />
      <text x="497" y="260" textAnchor="middle" fontSize="7.5" fill={dark ? "#253545" : "#c0ccd8"}
        fontFamily={f} transform="rotate(-90,497,260)">AISLE</text>

      {/* Room B */}
      <rect x={RB.x} y={RB.y} width={RB.w} height={RB.h} fill={c.room} stroke={c.sk} strokeWidth="0.75" rx="4" />
      <text x={RB.x + RB.w / 2} y={RB.y + 14} textAnchor="middle" fontSize="8" fontWeight="600"
        fill={c.lbl} fontFamily={f} letterSpacing="0.07em">ROOM B</text>

      {/* Exit */}
      <rect x="306" y="428" width="88" height="14" fill={c.exitBg} rx="3" />
      <text x="350" y="439" textAnchor="middle" fontSize="8" fill={c.lbl}
        fontFamily={f} letterSpacing="0.08em">EXIT</text>
    </svg>
  );
}


function StatCard({ label, value, accent, dark }) {
  return (
    <div style={{
      background: dark ? "#1e293b" : "#ffffff",
      border: `1px solid ${dark ? "#2e3f55" : "#e8ecf0"}`,
      borderRadius: 12, padding: "14px 18px",
      display: "flex", flexDirection: "column", gap: 5,
    }}>
      <span style={{ fontSize: 10, fontWeight: 600, color: dark ? "#4b6080" : "#94a3b8", letterSpacing: "0.07em", textTransform: "uppercase" }}>
        {label}
      </span>
      <span style={{ fontSize: 24, fontWeight: 700, color: accent || (dark ? "#f1f5f9" : "#0f172a"), lineHeight: 1 }}>
        {value}
      </span>
    </div>
  );
}

function DarkToggle({ dark, onToggle }) {
  return (
    <button onClick={onToggle} style={{
      display: "flex", alignItems: "center", gap: 7,
      background: dark ? "#1e293b" : "#ffffff",
      border: `1px solid ${dark ? "#2e3f55" : "#e2e8f0"}`,
      borderRadius: 8, padding: "7px 13px",
      cursor: "pointer", fontSize: 12, fontWeight: 500,
      color: dark ? "#94a3b8" : "#64748b",
      transition: "all 0.2s", flexShrink: 0,
    }}>
      <span style={{ fontSize: 14 }}>{dark ? "☀️" : "🌙"}</span>
      <span>{dark ? "Light" : "Dark"}</span>
    </button>
  );
}

// ── Root
export default function LibraryHeatmap() {
  const [counts, setCounts]  = useState(randomCounts);
  const [lastUpdate, setLast] = useState(new Date());
  const [dark, setDark]       = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setCounts((prev) =>
        prev.map((c) => {
          const t = TABLES.find((t) => t.id === c.id);
          const delta = Math.random() < 0.55 ? Math.floor(Math.random() * 3) - 1 : 0;
          return { id: c.id, count: Math.max(0, Math.min(t.capacity, c.count + delta)) };
        })
      );
      setLast(new Date());
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const getCount      = (id) => counts.find((c) => c.id === id)?.count ?? 0;
  const totalSeats    = TABLES.reduce((s, t) => s + t.capacity, 0);
  const totalOccupied = counts.reduce((s, c) => s + c.count, 0);
  const fullTables    = TABLES.filter((t) => getCount(t.id) >= t.capacity).length;
  const emptyTables   = TABLES.filter((t) => getCount(t.id) === 0).length;
  const pct           = Math.round((totalOccupied / totalSeats) * 100);
  const pctAccent     = pct >= 80 ? "#ef4444" : pct >= 50 ? "#f59e0b" : "#22c55e";

  const fmt = (d) =>
    [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map((n) => String(n).padStart(2, "0")).join(":");

  const T = {
    bg:      dark ? "#0b1120" : "#f1f5f9",
    surface: dark ? "#0f172a" : "#ffffff",
    border:  dark ? "#1e293b" : "#e2e8f0",
    textPri: dark ? "#f1f5f9" : "#0f172a",
    textSec: dark ? "#64748b" : "#94a3b8",
    textMut: dark ? "#94a3b8" : "#475569",
    pill:    dark ? "#1e293b" : "#ffffff",
  };

  const LEGEND = [
    { bg: dark ? "rgba(59,130,246,0.20)"  : "rgba(219,234,254,0.80)", border: "#3b82f6", label: "Empty" },
    { bg: dark ? "rgba(34,197,94,0.20)"   : "rgba(220,252,231,0.90)", border: "#4ade80", label: "Low ≤50%" },
    { bg: dark ? "rgba(234,179,8,0.20)"   : "rgba(254,249,195,0.92)", border: "#facc15", label: "Partial >50%" },
    { bg: dark ? "rgba(239,68,68,0.22)"   : "rgba(254,226,226,0.90)", border: "#f87171", label: "Full" },
  ];

  return (
    <>
      <style>{`
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.2} }
        html, body, #root { height: 100%; margin: 0; padding: 0; }
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      <div style={{
        fontFamily: "system-ui,-apple-system,sans-serif",
        background: T.bg,
        height: "100vh",
        display: "flex", flexDirection: "column",
        padding: "20px 28px 14px",
        color: T.textPri,
        transition: "background 0.3s, color 0.3s",
        overflow: "hidden",
      }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexShrink: 0, gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 21, fontWeight: 700, letterSpacing: "-0.02em", color: T.textPri }}>Library Occupancy</h1>
            <p style={{ fontSize: 12, color: T.textSec, marginTop: 2 }}>Real-time seat availability · City Central Library, Floor 2</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: T.pill, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 13px", fontSize: 12, color: T.textMut, fontWeight: 500 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", animation: "pulse-dot 2s infinite" }} />
              <span>Live</span>
              <span style={{ color: T.border }}>|</span>
              <span style={{ color: T.textSec, fontWeight: 400 }}>{fmt(lastUpdate)}</span>
            </div>
            <DarkToggle dark={dark} onToggle={() => setDark((d) => !d)} />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 12, flexShrink: 0 }}>
          <StatCard label="Seats used"  value={`${totalOccupied} / ${totalSeats}`} dark={dark} />
          <StatCard label="Occupancy"   value={`${pct}%`}   accent={pctAccent} dark={dark} />
          <StatCard label="Full tables" value={fullTables}  accent="#ef4444"   dark={dark} />
          <StatCard label="Free tables" value={emptyTables} accent="#3b82f6"   dark={dark} />
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10, flexShrink: 0, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: T.textSec, fontWeight: 600, letterSpacing: "0.05em" }}>KEY:</span>
          {LEGEND.map(({ bg: lb, border: lbr, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 18, height: 11, borderRadius: 3, background: lb, border: `1.5px solid ${lbr}`, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: T.textMut, fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── Map wrapper
            Key fix: use aspect-ratio matching the SVG viewBox so the overlay
            div is always exactly the same shape as the rendered SVG.
            The outer flex container centers it; overflow:hidden clips tooltips
            that would escape the floor, but we allow overflow:visible on the
            inner layer so tooltips above tables still show.*/}
        <div style={{
          flex: 1, minHeight: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {/* This box has the exact same aspect ratio as the SVG viewBox */}
          <div style={{
            position: "relative",
            width: "100%",
            maxHeight: "100%",
            aspectRatio: `${SVG_W} / ${SVG_H}`,
            // constrain by height when viewport is short
            maxWidth: `calc((100vh - 220px) * ${SVG_W / SVG_H})`,
            borderRadius: 12,
            border: `1px solid ${T.border}`,
            overflow: "hidden",
            transition: "border-color 0.3s",
          }}>
            {/* SVG fills the box completely */}
            <FloorPlan dark={dark} />

            {/* Overlay: same size as SVG, overflow visible for tooltips */}
            <div style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              {TABLES.map((t) => (
                <TableZone key={t.id} table={t} count={getCount(t.id)} dark={dark} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p style={{ fontSize: 11, color: dark ? "#f7f7f7" : "#000000", textAlign: "center", marginTop: 10, flexShrink: 0 }}>
          © Made By JATIN · updates every 3 seconds
        </p>
      </div>
    </>
  );
}
