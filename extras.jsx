// Extras: histamine bucket, shopping list, time-aware greeting, persistence
// Uses globals: PALETTE, Icons, MEALS, WEEK_MEALS, TODAY_INDEX, SUPPLEMENTS
// Exports to window: useDayState, HistamineBucket, ShoppingSheet, greetingFor

const display = "'Cormorant Garamond', 'Cormorant', Georgia, serif";
const mono = "'JetBrains Mono', ui-monospace, monospace";

// ─────────────────────────────────────────────────────────────
// Persistent day state — what user ate / took today
// ─────────────────────────────────────────────────────────────
function useDayState() {
  const todayKey = new Date().toISOString().slice(0, 10);

  const [eaten, setEaten] = React.useState(() => {
    try {
      const raw = localStorage.getItem('histamin.eaten.' + todayKey);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  const [taken, setTaken] = React.useState(() => {
    try {
      const raw = localStorage.getItem('histamin.taken.' + todayKey);
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });

  React.useEffect(() => {
    try { localStorage.setItem('histamin.eaten.' + todayKey, JSON.stringify(eaten)); } catch {}
  }, [eaten, todayKey]);
  React.useEffect(() => {
    try { localStorage.setItem('histamin.taken.' + todayKey, JSON.stringify(taken)); } catch {}
  }, [taken, todayKey]);

  const toggleMeal = (id) => setEaten(e => ({ ...e, [id]: !e[id] }));
  const toggleSup = (key) => setTaken(t => ({ ...t, [key]: !t[key] }));

  return { eaten, toggleMeal, taken, toggleSup };
}

// ─────────────────────────────────────────────────────────────
// Histamine bucket — daily load visualization
// ─────────────────────────────────────────────────────────────
function computeLoad(eaten, taken, meals) {
  // Each meal contributes proportional load. Snacks: 8%, raňajky/večera: 18%, obed: 22%
  const weights = { 'Raňajky': 18, 'Snack': 8, 'Obed': 22, 'Večera': 18 };
  let load = 0;
  meals.forEach(m => {
    if (eaten[m.id]) load += weights[m.type] || 12;
  });
  // DAO drains 10 per dose, vit C/B6/Q each drain 4
  Object.entries(taken).forEach(([key, v]) => {
    if (!v) return;
    if (key.startsWith('dao-')) load -= 10;
    else load -= 4;
  });
  return Math.max(0, Math.min(100, load));
}

function HistamineBucket({ load, totalEaten, totalMeals, takenCount, takenTotal, greeting }) {
  // Animated fill
  const [animLoad, setAnimLoad] = React.useState(load);
  React.useEffect(() => {
    const start = animLoad;
    const t0 = performance.now();
    let raf;
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / 600);
      const e = 1 - Math.pow(1 - k, 3);
      setAnimLoad(start + (load - start) * e);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [load]);

  const fillPct = animLoad; // 0..100
  const remaining = Math.round(100 - load);

  // Tone: green → amber → coral as bucket fills
  const tone = load < 45 ? 'safe' : load < 75 ? 'caution' : 'high';
  const fillColor = tone === 'safe' ? '#8a9a7e' : tone === 'caution' ? '#c7a98b' : '#b8745a';
  const fillTop = tone === 'safe' ? '#a8b89a' : tone === 'caution' ? '#dabd9d' : '#cf8a6f';

  // SVG vessel: an apothecary flask shape, 140x180
  // Inner area where liquid fills: y ∈ [40, 168]
  const innerTop = 38, innerBottom = 168, innerH = innerBottom - innerTop;
  const liquidY = innerBottom - (fillPct / 100) * innerH;

  return (
    <div style={{
      margin: '8px 20px 20px',
      padding: '20px 22px 22px',
      background: 'linear-gradient(135deg, #efe9d8 0%, #e8e3d2 100%)',
      borderRadius: 26,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', right: -40, top: -40, width: 160, height: 160, borderRadius: '50%', background: 'rgba(138,154,126,0.13)' }}/>
      <div style={{ position: 'absolute', right: 60, bottom: -50, width: 90, height: 90, borderRadius: '50%', background: 'rgba(199,169,139,0.18)' }}/>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 18 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: mono, fontSize: 10, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: PALETTE.sageDeep,
          }}>{greeting}</div>

          <div style={{
            fontFamily: display, fontSize: 26, lineHeight: 1.05,
            color: PALETTE.ink, marginTop: 8, letterSpacing: '-0.01em',
            fontWeight: 400,
          }}>
            Histamínový<br/><em style={{ fontStyle: 'italic', color: fillColor, transition: 'color 0.4s' }}>kalich</em>
          </div>

          <div style={{ fontSize: 12.5, color: PALETTE.inkSoft, marginTop: 10, lineHeight: 1.45, maxWidth: 200 }}>
            {tone === 'safe' && <>Telo má {remaining}% kapacity. <em>Pokojný deň.</em></>}
            {tone === 'caution' && <>Buď opatrná, kalich je z polovice. <em>{remaining}% kapacity.</em></>}
            {tone === 'high' && <>Kalich blízko prahu. <em>Doplň DAO, viac vody.</em></>}
          </div>

          <div style={{ display: 'flex', gap: 14, marginTop: 16 }}>
            <MiniStat icon="🍽" label="jedlá" value={`${totalEaten}/${totalMeals}`}/>
            <MiniStat icon="◐" label="doplnky" value={`${takenCount}/${takenTotal}`}/>
          </div>
        </div>

        {/* Bucket SVG */}
        <div style={{ flexShrink: 0, position: 'relative', width: 110, height: 150 }}>
          <svg width="110" height="150" viewBox="0 0 140 180">
            <defs>
              <clipPath id="vessel-clip">
                <path d="M48,38 L48,28 Q48,24 52,24 L88,24 Q92,24 92,28 L92,38 Q108,52 108,90 L108,150 Q108,170 88,170 L52,170 Q32,170 32,150 L32,90 Q32,52 48,38 Z"/>
              </clipPath>
              <linearGradient id="liquid-grad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={fillTop} stopOpacity="0.95"/>
                <stop offset="100%" stopColor={fillColor} stopOpacity="1"/>
              </linearGradient>
            </defs>

            {/* vessel outline */}
            <path d="M48,38 L48,28 Q48,24 52,24 L88,24 Q92,24 92,28 L92,38 Q108,52 108,90 L108,150 Q108,170 88,170 L52,170 Q32,170 32,150 L32,90 Q32,52 48,38 Z"
              fill="rgba(250,246,238,0.55)" stroke={PALETTE.ink} strokeWidth="1.2" strokeOpacity="0.42"/>

            {/* liquid (clipped) */}
            <g clipPath="url(#vessel-clip)">
              <rect x="0" y={liquidY} width="140" height="200" fill="url(#liquid-grad)"
                style={{ transition: 'fill 0.5s' }}/>
              {/* surface wave */}
              <path d={`M0,${liquidY} Q35,${liquidY - 3} 70,${liquidY} T140,${liquidY} L140,${liquidY + 10} L0,${liquidY + 10} Z`}
                fill={fillTop} opacity="0.5"/>
              {/* tiny bubbles */}
              {fillPct > 15 && <>
                <circle cx="55" cy={liquidY + 30} r="2" fill="#fff" opacity="0.35"/>
                <circle cx="80" cy={liquidY + 50} r="1.5" fill="#fff" opacity="0.3"/>
                <circle cx="68" cy={liquidY + 70} r="2.5" fill="#fff" opacity="0.25"/>
              </>}
            </g>

            {/* threshold marks */}
            {[25, 50, 75].map(p => {
              const y = innerBottom - (p / 100) * innerH;
              return <line key={p} x1="98" x2="106" y1={y} y2={y} stroke={PALETTE.ink} strokeOpacity="0.25" strokeWidth="1"/>;
            })}
            <text x="111" y={innerBottom - (75 / 100) * innerH + 3.5}
              fontFamily={mono} fontSize="7" fill={PALETTE.inkMute} letterSpacing="0.1em">75</text>
          </svg>

          {/* big load number */}
          <div style={{
            position: 'absolute', left: 0, right: 0, top: '50%',
            transform: 'translateY(-50%)',
            textAlign: 'center', pointerEvents: 'none',
          }}>
            <div style={{
              fontFamily: display, fontSize: 32, color: PALETTE.ink,
              lineHeight: 1, textShadow: '0 1px 2px rgba(250,246,238,0.8)',
            }}>{Math.round(load)}<span style={{ fontSize: 14, color: PALETTE.inkSoft }}>%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div>
      <div style={{
        fontFamily: mono, fontSize: 9, letterSpacing: '0.16em',
        textTransform: 'uppercase', color: PALETTE.inkMute,
      }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginTop: 4 }}>
        <span style={{ fontFamily: display, fontSize: 18, color: PALETTE.ink }}>{value}</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Time-aware greeting
// ─────────────────────────────────────────────────────────────
function greetingFor(date = new Date()) {
  const h = date.getHours();
  if (h >= 5 && h < 10) return 'Dobré ráno';
  if (h >= 10 && h < 12) return 'Pekné dopoludnie';
  if (h >= 12 && h < 17) return 'Dobrý deň';
  if (h >= 17 && h < 22) return 'Dobrý večer';
  return 'Pekná noc';
}

function nextMealFor(meals, date = new Date()) {
  const now = date.getHours() * 60 + date.getMinutes();
  for (const m of meals) {
    const [h, mm] = m.time.split(':').map(Number);
    if (h * 60 + mm > now) return m;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// Shopping list — auto-aggregated from week meals
// ─────────────────────────────────────────────────────────────
function buildShoppingList(weekMeals) {
  // Categorize and aggregate
  const categories = [
    { name: 'Mäso & vajcia', match: /kurac|morčac|teľac|jahňac|vajc/i },
    { name: 'Mliečne', match: /tvaroh|syr|maslo|mlieko|smotan|mozzar|bryndz/i },
    { name: 'Obilniny & cestoviny', match: /ryž|vlock|quino|pohánk|polent|amarant|krupic|chleb|múk/i },
    { name: 'Zelenina', match: /cuket|mrkv|brokol|karfiol|tekvic|cvikl|uhork|rukol|paprik|špargl|batát|zemiak|cesnak|cibul/i },
    { name: 'Ovocie', match: /jablk|hrušk|čučor|mango|granát|melón|marhuľ|broskyň|fig|bobu|ríbezľ|brusnic/i },
    { name: 'Tuky & ostatné', match: /olej|orech|mandle|seme|med|sirup|kokos|vanilk|kardamóm|škoric|byling|petržl|tymian|rozmarín|mätu|mät|koriand|pažítk|bazalk|zázvor|soľ/i },
  ];

  const items = {};
  weekMeals.forEach(d => d.meals.forEach(meal => {
    meal.ingredients.forEach(ing => {
      const key = ing.name.replace(/\s*\([^)]*\)\s*/g, '').trim().toLowerCase();
      if (!items[key]) items[key] = { name: ing.name, qtys: [], days: new Set() };
      items[key].qtys.push(ing.qty);
      items[key].days.add(d.day);
    });
  }));

  const grouped = categories.map(c => ({ name: c.name, items: [] }));
  const other = { name: 'Iné', items: [] };

  Object.entries(items).forEach(([key, it]) => {
    let placed = false;
    for (let i = 0; i < categories.length; i++) {
      if (categories[i].match.test(it.name) || categories[i].match.test(key)) {
        grouped[i].items.push({ ...it, count: it.qtys.length, days: it.days.size });
        placed = true;
        break;
      }
    }
    if (!placed) other.items.push({ ...it, count: it.qtys.length, days: it.days.size });
  });
  if (other.items.length) grouped.push(other);

  // Sort items by frequency
  grouped.forEach(g => g.items.sort((a, b) => b.count - a.count));
  return grouped.filter(g => g.items.length > 0);
}

function ShoppingSheet({ onClose }) {
  const groups = React.useMemo(() => buildShoppingList(WEEK_MEALS), []);
  const [checked, setChecked] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem('histamin.shopping') || '{}');
    } catch { return {}; }
  });
  React.useEffect(() => {
    try { localStorage.setItem('histamin.shopping', JSON.stringify(checked)); } catch {}
  }, [checked]);

  const toggle = (k) => setChecked(c => ({ ...c, [k]: !c[k] }));
  const reset = () => setChecked({});

  const total = groups.reduce((s, g) => s + g.items.length, 0);
  const done = Object.values(checked).filter(Boolean).length;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 110,
      background: 'rgba(20,17,14,0.55)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      animation: 'fadeIn 0.25s ease forwards',
    }} onClick={onClose}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 460,
        background: PALETTE.cream,
        borderRadius: '24px 24px 0 0',
        padding: '12px 0 0',
        animation: 'slideUp 0.32s ease forwards',
        maxHeight: '88vh', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 4,
          background: 'rgba(43,38,32,0.18)',
          margin: '0 auto 14px',
        }}/>

        <div style={{ padding: '0 24px 14px', borderBottom: `1px solid ${PALETTE.line}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{
                fontFamily: mono, fontSize: 10, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: PALETTE.inkMute,
              }}>Nákupný zoznam · týždeň</div>
              <div style={{
                fontFamily: display, fontSize: 28, lineHeight: 1.05,
                color: PALETTE.ink, marginTop: 6, letterSpacing: '-0.01em',
              }}>Čo si <em style={{ fontStyle: 'italic', color: PALETTE.sageDeep }}>doniesť</em></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: display, fontSize: 24, color: PALETTE.ink, lineHeight: 1 }}>
                {done}<span style={{ color: PALETTE.inkMute, fontSize: 14 }}>/{total}</span>
              </div>
              <button onClick={reset} style={{
                background: 'transparent', border: 0,
                color: PALETTE.inkMute, cursor: 'pointer',
                fontFamily: mono, fontSize: 9, letterSpacing: '0.14em',
                textTransform: 'uppercase', marginTop: 4, padding: 0,
              }}>Vynulovať</button>
            </div>
          </div>
          {/* progress bar */}
          <div style={{ marginTop: 12, height: 4, background: 'rgba(43,38,32,0.06)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              width: `${(done / Math.max(1, total)) * 100}%`,
              height: '100%', background: PALETTE.sageDeep,
              transition: 'width 0.4s',
            }}/>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 24px 28px' }}>
          {groups.map(g => (
            <div key={g.name} style={{ marginTop: 16 }}>
              <div style={{
                fontFamily: mono, fontSize: 9.5, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: PALETTE.sageDeep,
                marginBottom: 4,
              }}>{g.name}</div>
              {g.items.map((it, i) => {
                const key = g.name + '-' + it.name;
                const isChecked = !!checked[key];
                return (
                  <button key={i} onClick={() => toggle(key)} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    width: '100%', padding: '11px 0',
                    background: 'transparent', border: 0,
                    borderBottom: `1px dashed ${PALETTE.line}`,
                    cursor: 'pointer', textAlign: 'left',
                  }}>
                    <span style={{
                      flexShrink: 0, width: 22, height: 22, borderRadius: 7,
                      border: `1.5px solid ${isChecked ? PALETTE.sageDeep : PALETTE.line}`,
                      background: isChecked ? PALETTE.sageDeep : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.18s',
                    }}>{isChecked && Icons.check(13, PALETTE.cream)}</span>
                    <span style={{
                      flex: 1, fontSize: 14, color: PALETTE.ink,
                      textDecoration: isChecked ? 'line-through' : 'none',
                      opacity: isChecked ? 0.5 : 1,
                      transition: 'opacity 0.18s',
                    }}>{it.name}</span>
                    <span style={{
                      fontFamily: mono, fontSize: 10, color: PALETTE.inkMute,
                      letterSpacing: '0.06em',
                    }}>{it.days}× / {it.count}</span>
                  </button>
                );
              })}
            </div>
          ))}

          <div style={{
            marginTop: 24, padding: '12px 14px',
            background: 'rgba(138,154,126,0.14)', borderRadius: 14,
            fontSize: 12, color: PALETTE.sageDeep, lineHeight: 1.5,
          }}>
            <strong style={{ fontFamily: display, fontSize: 14, fontWeight: 500 }}>Pre čerstvosť:</strong>{' '}
            Mäso a tvaroh kupuj v deň prípravy. Zelenina a obilniny vydržia celý týždeň.
          </div>
        </div>

        <button onClick={onClose} style={{
          margin: '0 24px 22px', padding: '14px 0',
          background: PALETTE.ink, color: PALETTE.cream,
          border: 0, borderRadius: 99, cursor: 'pointer',
          fontFamily: mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>Hotovo</button>
      </div>
    </div>
  );
}

Object.assign(window, { useDayState, computeLoad, HistamineBucket, ShoppingSheet, greetingFor, nextMealFor });
