// Screen components for the histamine meal plan app
// Uses globals: IOSDevice, IOSStatusBar, Icons, MealArt, TODAY_MEALS, SUPPLEMENTS, SYMPTOMS, FOODS

const PALETTE = {
  cream: '#f3ede2',
  creamDeep: '#e8dfd0',
  paper: '#faf6ee',
  ink: '#2b2620',
  inkSoft: '#5b544a',
  inkMute: '#8a8175',
  sage: '#8a9a7e',
  sageDeep: '#5f6f55',
  sageTint: '#d9dfce',
  wood: '#c7a98b',
  terra: '#b8745a',
  line: '#d9d1c0',
};

const display = "'Cormorant Garamond', 'Cormorant', Georgia, serif";
const mono = "'JetBrains Mono', ui-monospace, monospace";

// ─────────────────────────────────────────────────────────────
// Shared bits
// ─────────────────────────────────────────────────────────────
function Eyebrow({ children, color = PALETTE.inkMute, style }) {
  return <div style={{
    fontFamily: mono, fontSize: 10, letterSpacing: '0.18em',
    textTransform: 'uppercase', color, ...style,
  }}>{children}</div>;
}

function ScoreDot({ score }) {
  const map = { low: PALETTE.sage, mid: PALETTE.wood, high: PALETTE.terra };
  return <span style={{
    display: 'inline-block', width: 6, height: 6, borderRadius: 99,
    background: map[score] || PALETTE.sage,
  }}/>;
}

function ScreenHeader({ greeting, date, tab, setTab, view, setView }) {
  return (
    <div style={{
      padding: '4px 24px 16px',
      background: PALETTE.cream,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <Eyebrow>Histamín · plán</Eyebrow>
          <div style={{
            fontFamily: display, fontWeight: 400,
            fontSize: 32, lineHeight: 1.05, color: PALETTE.ink,
            marginTop: 8, letterSpacing: '-0.01em',
          }}>{greeting}</div>
          <div style={{
            fontSize: 13, color: PALETTE.inkSoft, marginTop: 6,
          }}>{date}</div>
        </div>
        <ViewToggle view={view} setView={setView} />
      </div>
    </div>
  );
}

function ViewToggle({ view, setView }) {
  return (
    <div style={{
      display: 'inline-flex', padding: 3,
      background: 'rgba(43,38,32,0.06)',
      borderRadius: 99, marginTop: 18,
    }}>
      {['den', 'týždeň'].map(v => {
        const active = view === v;
        return (
          <button key={v} onClick={() => setView(v)} style={{
            border: 0, background: active ? PALETTE.paper : 'transparent',
            color: active ? PALETTE.ink : PALETTE.inkMute,
            fontFamily: mono, fontSize: 10, letterSpacing: '0.16em',
            textTransform: 'uppercase', padding: '7px 12px',
            borderRadius: 99, cursor: 'pointer',
            boxShadow: active ? '0 1px 2px rgba(43,38,32,0.06)' : 'none',
            transition: 'all 0.2s',
          }}>{v}</button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME — Today's plan
// ─────────────────────────────────────────────────────────────
function HomeScreen({ onOpenMeal, view, setView, eaten, toggleMeal, taken, toggleSup, onOpenShopping }) {
  const greeting = greetingFor();
  const nextMeal = nextMealFor(TODAY_MEALS);

  return (
    <div style={{ background: PALETTE.cream, minHeight: '100%' }}>
      <ScreenHeader
        greeting={<>{greeting},<br/><em style={{ fontStyle: 'italic', color: PALETTE.sageDeep }}>Lea</em></>}
        date={`Streda · 27. máj${nextMeal ? ` · nasleduje ${nextMeal.type.toLowerCase()} o ${nextMeal.time}` : ''}`}
        view={view} setView={setView}
      />

      {view === 'den'
        ? <DayPlan onOpenMeal={onOpenMeal} eaten={eaten} toggleMeal={toggleMeal} taken={taken} greeting={greeting}/>
        : <WeekPlan onOpenMeal={onOpenMeal} onOpenShopping={onOpenShopping}/>}
    </div>
  );
}

function DayBanner() {
  return (
    <div style={{
      margin: '8px 20px 20px',
      padding: '18px 20px',
      background: 'linear-gradient(135deg, #e3e8d6 0%, #efe7d4 100%)',
      borderRadius: 22,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', right: -20, top: -20, width: 110, height: 110, borderRadius: '50%', background: 'rgba(138,154,126,0.18)' }}/>
      <div style={{ position: 'absolute', right: 30, bottom: -30, width: 70, height: 70, borderRadius: '50%', background: 'rgba(199,169,139,0.22)' }}/>
      <div style={{ position: 'relative' }}>
        <Eyebrow color={PALETTE.sageDeep}>Dnešný plán</Eyebrow>
        <div style={{
          fontFamily: display, fontSize: 22, lineHeight: 1.15,
          color: PALETTE.ink, marginTop: 8, maxWidth: 240,
          fontWeight: 400, letterSpacing: '-0.005em',
        }}>
          Päť jemných jedál, žiadne kvasené ani zrejúce.
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
          <Stat label="histamín" value="nízky" dot="low"/>
          <Stat label="kalórie" value="≈ 1 720"/>
          <Stat label="voda" value="2,2 L"/>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, dot }) {
  return (
    <div>
      <Eyebrow color={PALETTE.inkMute}>{label}</Eyebrow>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        {dot && <ScoreDot score={dot}/>}
        <span style={{ fontFamily: display, fontSize: 18, color: PALETTE.ink }}>{value}</span>
      </div>
    </div>
  );
}

function DayPlan({ onOpenMeal, eaten, toggleMeal, taken, greeting }) {
  const totalEaten = TODAY_MEALS.filter(m => eaten[m.id]).length;
  const totalMeals = TODAY_MEALS.length;
  const allSupKeys = SUPPLEMENTS.flatMap(s => s.times.map(t => `${s.id}-${t}`));
  const takenCount = allSupKeys.filter(k => taken[k]).length;
  const load = computeLoad(eaten, taken, TODAY_MEALS);

  return (
    <>
      <HistamineBucket
        load={load}
        totalEaten={totalEaten} totalMeals={totalMeals}
        takenCount={takenCount} takenTotal={allSupKeys.length}
        greeting={greeting}
      />
      <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {TODAY_MEALS.map((m, i) => (
          <MealCard key={m.id} meal={m} idx={i}
            onClick={() => onOpenMeal(m.id)}
            eaten={!!eaten[m.id]}
            onToggleEaten={() => toggleMeal(m.id)}
            last={i === TODAY_MEALS.length - 1}/>
        ))}
      </div>
    </>
  );
}

function MealCard({ meal, idx, onClick, eaten, onToggleEaten }) {
  const hasToggle = typeof onToggleEaten === 'function';
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', gap: 14,
      padding: 14, background: PALETTE.paper,
      borderRadius: 22,
      boxShadow: '0 1px 0 rgba(43,38,32,0.04)',
      opacity: eaten ? 0.7 : 1,
      transition: 'opacity 0.25s',
      width: '100%', position: 'relative',
    }}>
      <button onClick={onClick} style={{
        position: 'absolute', inset: 0,
        background: 'transparent', border: 0, cursor: 'pointer',
        padding: 0, borderRadius: 22,
      }} aria-label={meal.title}/>
      <div style={{ position: 'relative', flexShrink: 0, pointerEvents: 'none' }}>
        <MealArt kind={meal.img} size={72}/>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Eyebrow color={PALETTE.sageDeep}>{meal.type}</Eyebrow>
          <span style={{ fontFamily: mono, fontSize: 10, color: PALETTE.inkMute }}>· {meal.time}</span>
        </div>
        <div style={{
          fontFamily: display, fontSize: 19, fontWeight: 400,
          color: PALETTE.ink, lineHeight: 1.15, letterSpacing: '-0.005em',
          textDecoration: eaten ? 'line-through' : 'none',
          textDecorationColor: 'rgba(43,38,32,0.35)',
        }}>{meal.title}</div>
        <div style={{ fontSize: 12, color: PALETTE.inkSoft, marginTop: 4 }}>{meal.sub}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
          <Pill icon={Icons.clock(11)} label={`${meal.minutes} min`}/>
          <Pill icon={<ScoreDot score={meal.score}/>} label="nízky histamín" tone="sage"/>
        </div>
      </div>
      {hasToggle ? (
        <button onClick={e => { e.stopPropagation(); onToggleEaten(); }} style={{
          position: 'relative', zIndex: 2,
          alignSelf: 'center', flexShrink: 0,
          width: 36, height: 36, borderRadius: '50%',
          border: `1.5px solid ${eaten ? PALETTE.sageDeep : PALETTE.line}`,
          background: eaten ? PALETTE.sageDeep : 'rgba(250,246,238,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.22s',
        }} aria-label={eaten ? 'Označiť ako nezjedené' : 'Označiť ako zjedené'}>
          {eaten ? Icons.check(16, PALETTE.cream) : Icons.check(15, 'rgba(43,38,32,0.25)')}
        </button>
      ) : (
        <div style={{ alignSelf: 'center', color: PALETTE.inkMute, pointerEvents: 'none' }}>
          {Icons.chev(16, PALETTE.inkMute)}
        </div>
      )}
    </div>
  );
}

function Pill({ icon, label, tone }) {
  const bg = tone === 'sage' ? 'rgba(138,154,126,0.14)' : 'rgba(43,38,32,0.05)';
  const c = tone === 'sage' ? PALETTE.sageDeep : PALETTE.inkSoft;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 9px', borderRadius: 99,
      background: bg, color: c,
      fontFamily: mono, fontSize: 10, letterSpacing: '0.06em',
    }}>{icon}{label}</span>
  );
}

function WeekPlan({ onOpenMeal, onOpenShopping }) {
  const focusIdx = TODAY_INDEX;
  const [selected, setSelected] = React.useState(focusIdx);
  const day = WEEK_MEALS[selected];

  return (
    <>
      <div style={{ padding: '8px 20px 0' }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
          {WEEK_MEALS.map((d, i) => {
            const active = i === selected;
            const isToday = i === focusIdx;
            return (
              <button key={d.day} onClick={() => setSelected(i)} style={{
                flex: 1, padding: '10px 0 12px',
                textAlign: 'center', border: 0, cursor: 'pointer',
                background: active ? PALETTE.sageDeep : PALETTE.paper,
                color: active ? PALETTE.paper : PALETTE.inkSoft,
                borderRadius: 14, position: 'relative',
                transition: 'all 0.18s',
              }}>
                <div style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.12em', opacity: 0.7 }}>{d.day}</div>
                <div style={{ fontFamily: display, fontSize: 18, marginTop: 2 }}>{d.date}</div>
                {isToday && !active && (
                  <span style={{
                    position: 'absolute', top: 6, right: 6,
                    width: 5, height: 5, borderRadius: 99, background: PALETTE.sageDeep,
                  }}/>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '22px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <Eyebrow color={PALETTE.sageDeep}>{day.label} · {day.date}. máj</Eyebrow>
            <div style={{
              fontFamily: display, fontSize: 22, color: PALETTE.ink,
              marginTop: 4, letterSpacing: '-0.005em',
            }}>5 jedál · nízky histamín</div>
          </div>
          {selected === focusIdx && (
            <span style={{
              fontFamily: mono, fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: 99,
              background: PALETTE.sageDeep, color: PALETTE.cream,
            }}>dnes</span>
          )}
        </div>

        <button onClick={onOpenShopping} style={{
          width: '100%', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px',
          background: PALETTE.ink, color: PALETTE.cream,
          border: 0, borderRadius: 16,
          cursor: 'pointer', textAlign: 'left',
        }}>
          <span style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(243,237,226,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 7h14l-1.5 11a2 2 0 01-2 1.7H8.5a2 2 0 01-2-1.7L5 7z"/>
              <path d="M9 7V5a3 3 0 016 0v2"/>
            </svg>
          </span>
          <span style={{ flex: 1 }}>
            <span style={{
              fontFamily: mono, fontSize: 9, letterSpacing: '0.16em',
              textTransform: 'uppercase', opacity: 0.7, display: 'block',
            }}>Týždenný nákup</span>
            <span style={{ fontFamily: display, fontSize: 17, marginTop: 2, display: 'block' }}>
              Vygenerovať zoznam potravín
            </span>
          </span>
          {Icons.chev(16, PALETTE.cream)}
        </button>
      </div>

      <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {day.meals.map((m, i) => (
          <MealCard key={m.id + i} meal={m} idx={i} onClick={() => onOpenMeal(m.id)}/>
        ))}
      </div>

      <div style={{ padding: '8px 20px 32px' }}>
        <Eyebrow style={{ marginBottom: 12 }}>Prehľad celého týždňa</Eyebrow>
        {WEEK_MEALS.map((d, i) => (
          <button key={d.day} onClick={() => setSelected(i)} style={{
            width: '100%', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 14px', marginBottom: 6,
            background: i === selected ? PALETTE.paper : 'transparent',
            border: `1px solid ${i === selected ? PALETTE.line : 'transparent'}`,
            borderRadius: 14, cursor: 'pointer',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: i === selected ? PALETTE.sageDeep : 'rgba(43,38,32,0.05)',
              color: i === selected ? PALETTE.cream : PALETTE.inkSoft,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ fontFamily: mono, fontSize: 8, letterSpacing: '0.1em', opacity: 0.7 }}>{d.day}</span>
              <span style={{ fontFamily: display, fontSize: 14, lineHeight: 1 }}>{d.date}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: PALETTE.inkMute, fontFamily: mono, letterSpacing: '0.06em' }}>
                {d.meals[0].title.split(' s ')[0]} · {d.meals[2].title.split(' ').slice(0,2).join(' ')} · {d.meals[4].title.split(' ').slice(0,2).join(' ')}
              </div>
            </div>
            <span style={{ color: PALETTE.inkMute }}>{Icons.chev(14, PALETTE.inkMute)}</span>
          </button>
        ))}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// RECIPE DETAIL
// ─────────────────────────────────────────────────────────────
function RecipeScreen({ meal, onBack }) {
  const [tab, setTab] = React.useState('postup');
  return (
    <div style={{ background: PALETTE.cream, minHeight: '100%' }}>
      <div style={{
        background: 'linear-gradient(180deg, #e8efdb 0%, #efe7d4 100%)',
        padding: '8px 20px 24px',
        borderRadius: '0 0 28px 28px',
      }}>
        <button onClick={onBack} style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          background: 'rgba(250,246,238,0.7)',
          border: 'none', borderRadius: 99, padding: '8px 14px 8px 10px',
          fontFamily: mono, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: PALETTE.ink, cursor: 'pointer',
        }}>{Icons.chev(14, PALETTE.ink, 'left')} späť</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 18 }}>
          <MealArt kind={meal.img} size={110}/>
          <div style={{ flex: 1 }}>
            <Eyebrow color={PALETTE.sageDeep}>{meal.type} · {meal.time}</Eyebrow>
            <div style={{
              fontFamily: display, fontSize: 26, lineHeight: 1.1,
              color: PALETTE.ink, marginTop: 6, letterSpacing: '-0.01em',
            }}>{meal.title}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              <Pill icon={Icons.clock(11)} label={`${meal.minutes} min`}/>
              <Pill icon={<ScoreDot score="low"/>} label="DAO friendly" tone="sage"/>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, padding: '18px 20px 0' }}>
        {[['postup','Postup'],['suroviny','Suroviny'],['preco','Prečo']].map(([k, l]) => {
          const active = tab === k;
          return (
            <button key={k} onClick={() => setTab(k)} style={{
              padding: '8px 14px', borderRadius: 99,
              border: `1px solid ${active ? PALETTE.ink : PALETTE.line}`,
              background: active ? PALETTE.ink : 'transparent',
              color: active ? PALETTE.cream : PALETTE.inkSoft,
              fontFamily: mono, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
              cursor: 'pointer',
            }}>{l}</button>
          );
        })}
      </div>

      <div style={{ padding: '20px 24px 32px' }}>
        {tab === 'suroviny' && (
          <div>
            <Eyebrow>Suroviny · 1 porcia</Eyebrow>
            <ul style={{ listStyle: 'none', padding: 0, margin: '14px 0 0' }}>
              {meal.ingredients.map((it, i) => (
                <li key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '12px 0', borderBottom: `1px dashed ${PALETTE.line}`,
                }}>
                  <span style={{ color: PALETTE.ink, fontSize: 15 }}>{it.name}</span>
                  <span style={{ color: PALETTE.inkSoft, fontFamily: mono, fontSize: 12 }}>{it.qty}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {tab === 'postup' && (
          <ol style={{ padding: 0, margin: 0, counterReset: 'step', listStyle: 'none' }}>
            {meal.steps.map((s, i) => (
              <li key={i} style={{
                display: 'flex', gap: 14, padding: '0 0 18px',
              }}>
                <div style={{
                  flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
                  background: PALETTE.sageTint, color: PALETTE.sageDeep,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: display, fontSize: 16,
                }}>{i + 1}</div>
                <div style={{ flex: 1, color: PALETTE.ink, fontSize: 14.5, lineHeight: 1.55, paddingTop: 4 }}>{s}</div>
              </li>
            ))}
          </ol>
        )}
        {tab === 'preco' && (
          <div style={{
            padding: 18, background: PALETTE.paper, borderRadius: 18,
            border: `1px solid ${PALETTE.line}`,
          }}>
            <Eyebrow color={PALETTE.terra}>Poznámka pre histamínikov</Eyebrow>
            <div style={{
              fontFamily: display, fontSize: 17, fontStyle: 'italic',
              color: PALETTE.ink, marginTop: 10, lineHeight: 1.45,
            }}>{meal.note}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FOODS — SIGHI tolerance library + principles
// ─────────────────────────────────────────────────────────────
function ScoreChip({ score }) {
  const s = SIGHI_SCALE[score] || SIGHI_SCALE[0];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 18, height: 18, borderRadius: 6,
      background: s.color, color: PALETTE.cream,
      fontFamily: mono, fontSize: 10, fontWeight: 500, flexShrink: 0,
    }}>{score}</span>
  );
}

function FoodItem({ it }) {
  const s = SIGHI_SCALE[it.score] || SIGHI_SCALE[0];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 12px',
      background: PALETTE.paper,
      border: `1px solid ${PALETTE.line}`,
      borderLeft: `3px solid ${s.color}`,
      borderRadius: 12,
    }}>
      <ScoreChip score={it.score}/>
      <span style={{ flex: 1, fontSize: 13.5, color: PALETTE.ink, lineHeight: 1.3 }}>{it.name}</span>
      {it.marks && it.marks.length > 0 && (
        <span style={{ display: 'flex', gap: 4 }}>
          {it.marks.map(m => (
            <span key={m} title={MARKERS[m] ? MARKERS[m].label : m} style={{
              fontFamily: mono, fontSize: 9, fontWeight: 500,
              padding: '2px 5px', borderRadius: 5,
              background: 'rgba(43,38,32,0.06)', color: PALETTE.inkSoft,
              letterSpacing: '0.04em',
            }}>{m}</span>
          ))}
        </span>
      )}
    </div>
  );
}

function ToleranceLegend() {
  return (
    <div style={{
      padding: '14px 16px', background: PALETTE.paper,
      border: `1px solid ${PALETTE.line}`, borderRadius: 16, marginTop: 4,
    }}>
      <Eyebrow>Stupnica znášanlivosti · SIGHI</Eyebrow>
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SIGHI_SCALE.map(s => (
          <div key={s.score} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <ScoreChip score={s.score}/>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, color: PALETTE.ink, fontWeight: 500 }}>{s.label}</span>
              <span style={{ fontSize: 12, color: PALETTE.inkMute }}> — {s.desc}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: PALETTE.line, margin: '14px 0' }}/>
      <Eyebrow>Dôvod nekompatibility</Eyebrow>
      <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {Object.entries(MARKERS).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', gap: 9, alignItems: 'baseline' }}>
            <span style={{
              fontFamily: mono, fontSize: 9, fontWeight: 500,
              padding: '2px 5px', borderRadius: 5, minWidth: 22, textAlign: 'center',
              background: 'rgba(43,38,32,0.06)', color: PALETTE.inkSoft,
            }}>{k}</span>
            <span style={{ flex: 1, fontSize: 12, color: PALETTE.inkSoft, lineHeight: 1.4 }}>
              <strong style={{ color: PALETTE.ink, fontWeight: 500 }}>{v.label}</strong> — {v.desc}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrincipleIcon({ kind, color }) {
  const paths = {
    fresh:   <><path d="M12 3v18"/><path d="M12 8c0-3 3-5 6-5 0 3-3 5-6 5z"/><path d="M12 11c0-3-3-5-6-5 0 3 3 5 6 5z"/></>,
    store:   <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 11h14"/><path d="M9 6v2"/><path d="M9 14v3"/></>,
    can:     <><ellipse cx="12" cy="6" rx="7" ry="2.5"/><path d="M5 6v12c0 1.4 3 2.5 7 2.5s7-1.1 7-2.5V6"/></>,
    ferment: <><path d="M9 3h6"/><path d="M9 3v4l-3 11a2 2 0 002 2.5h8a2 2 0 002-2.5L15 7V3"/><path d="M7 13h10"/></>,
    home:    <><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></>,
    alcohol: <><path d="M8 22h8"/><path d="M12 15v7"/><path d="M5 3h14l-2 8a5 5 0 01-10 0z"/></>,
    identify:<><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>,
  };
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[kind] || paths.home}
    </svg>
  );
}

function PrinciplesView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Principles */}
      {PRINCIPLES.map((p, i) => (
        <div key={i} style={{
          display: 'flex', gap: 14, padding: '14px 16px',
          background: PALETTE.paper, borderRadius: 16,
          border: `1px solid ${PALETTE.line}`,
        }}>
          <div style={{
            flexShrink: 0, width: 38, height: 38, borderRadius: 11,
            background: PALETTE.sageTint,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <PrincipleIcon kind={p.icon} color={PALETTE.sageDeep}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: display, fontSize: 17, color: PALETTE.ink, lineHeight: 1.15, letterSpacing: '-0.005em' }}>{p.title}</div>
            <div style={{ fontSize: 12.5, color: PALETTE.inkSoft, marginTop: 4, lineHeight: 1.5 }}>{p.body}</div>
          </div>
        </div>
      ))}

      {/* DAO card */}
      <div style={{
        padding: '18px', borderRadius: 18,
        background: 'linear-gradient(135deg, #e3e8d6 0%, #efe7d4 100%)',
        marginTop: 4,
      }}>
        <Eyebrow color={PALETTE.sageDeep}>Doplnok · {DAO_INFO.product}</Eyebrow>
        <div style={{ fontFamily: display, fontSize: 20, color: PALETTE.ink, marginTop: 6, lineHeight: 1.15 }}>
          Keď diéta nestačí
        </div>
        <div style={{ fontSize: 12.5, color: PALETTE.inkSoft, marginTop: 8, lineHeight: 1.5 }}>
          Enzým {DAO_INFO.enzyme} nahrádza nedostatočnú tvorbu DAO a pomáha rozkladať histamín prijatý v strave.
        </div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[
            ['Dávka', DAO_INFO.dose],
            ['Maximum', DAO_INFO.max],
            ['Užitie', DAO_INFO.drink],
            ['Aktivita', DAO_INFO.activity],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
              <span style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: PALETTE.sageDeep, minWidth: 58 }}>{k}</span>
              <span style={{ flex: 1, fontSize: 13, color: PALETTE.ink }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trigger meds */}
      <div style={{
        padding: '16px', borderRadius: 18,
        background: PALETTE.paper, border: `1px solid ${PALETTE.line}`,
      }}>
        <Eyebrow color={PALETTE.terra}>Lieky, ktoré môžu zhoršiť príznaky</Eyebrow>
        <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TRIGGER_MEDS.map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <span style={{ flexShrink: 0, width: 5, height: 5, marginTop: 6, borderRadius: 99, background: PALETTE.terra }}/>
              <span style={{ flex: 1, fontSize: 12.5, color: PALETTE.inkSoft, lineHeight: 1.45 }}>{m}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: PALETTE.inkMute, marginTop: 12, lineHeight: 1.5, fontStyle: 'italic' }}>
          Nikdy nevysadzuj lieky bez konzultácie s lekárom. Tieto informácie nenahrádzajú lekársku starostlivosť.
        </div>
      </div>
    </div>
  );
}

function FoodsScreen() {
  const [mode, setMode] = React.useState('allowed');
  const isFoodMode = mode === 'allowed' || mode === 'avoid';
  const list = isFoodMode ? FOODS[mode] : null;

  return (
    <div style={{ background: PALETTE.cream, minHeight: '100%' }}>
      <div style={{ padding: '4px 24px 4px' }}>
        <Eyebrow>Knižnica · SIGHI</Eyebrow>
        <div style={{
          fontFamily: display, fontSize: 32, lineHeight: 1.05,
          color: PALETTE.ink, marginTop: 8, letterSpacing: '-0.01em',
        }}>Čo môžem,<br/><em style={{ fontStyle: 'italic', color: PALETTE.sageDeep }}>čo nie</em></div>
      </div>

      <div style={{ padding: '20px 20px 8px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          background: PALETTE.paper, padding: 4, borderRadius: 99, gap: 2,
        }}>
          {[['allowed','Povolené', PALETTE.sageDeep],['avoid','Vyhnúť', PALETTE.terra],['rules','Zásady', PALETTE.ink]].map(([k, l, c]) => {
            const active = mode === k;
            return (
              <button key={k} onClick={() => setMode(k)} style={{
                padding: '11px 0', border: 0, borderRadius: 99,
                background: active ? c : 'transparent',
                color: active ? PALETTE.cream : PALETTE.inkMute,
                fontFamily: mono, fontSize: 10, letterSpacing: '0.12em',
                textTransform: 'uppercase', cursor: 'pointer',
                transition: 'all 0.2s',
              }}>{l}</button>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '12px 20px 32px' }}>
        {isFoodMode ? (
          <>
            <ToleranceLegend/>
            {list.map((group, i) => (
              <div key={i} style={{ marginTop: 18 }}>
                <Eyebrow color={mode === 'allowed' ? PALETTE.sageDeep : PALETTE.terra}>{group.cat}</Eyebrow>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
                  {group.items.map((it, j) => <FoodItem key={j} it={it}/>)}
                </div>
              </div>
            ))}
            <div style={{
              marginTop: 20, padding: '12px 14px',
              background: 'rgba(138,154,126,0.12)', borderRadius: 14,
              fontSize: 11.5, color: PALETTE.sageDeep, lineHeight: 1.5,
            }}>
              Skóre platí pre čisté potraviny bez aditív. V prvých 4–6 týždňoch sa drž prísne, potom opatrne testuj individuálnu toleranciu.
            </div>
          </>
        ) : (
          <PrinciplesView/>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SUPPLEMENTS
// ─────────────────────────────────────────────────────────────
function PillsScreen({ taken: takenProp, toggleSup }) {
  const taken = takenProp || {};
  const toggle = (id) => toggleSup && toggleSup(id);
  const allTimes = SUPPLEMENTS.flatMap(s => s.times.map(t => ({ time: t, sup: s })));
  allTimes.sort((a, b) => a.time.localeCompare(b.time));
  const takenCount = Object.values(taken).filter(Boolean).length;

  return (
    <div style={{ background: PALETTE.cream, minHeight: '100%' }}>
      <div style={{ padding: '4px 24px' }}>
        <Eyebrow>Doplnky</Eyebrow>
        <div style={{
          fontFamily: display, fontSize: 32, lineHeight: 1.05,
          color: PALETTE.ink, marginTop: 8, letterSpacing: '-0.01em',
        }}>Tvoj denný<br/><em style={{ fontStyle: 'italic', color: PALETTE.sageDeep }}>rituál</em></div>
      </div>

      <div style={{ margin: '20px 20px 0', padding: 18, background: PALETTE.paper, borderRadius: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <Eyebrow>Dnes</Eyebrow>
            <div style={{ fontFamily: display, fontSize: 36, color: PALETTE.ink, marginTop: 4, lineHeight: 1 }}>
              {takenCount}<span style={{ color: PALETTE.inkMute, fontSize: 22 }}> / {allTimes.length}</span>
            </div>
            <div style={{ fontSize: 12, color: PALETTE.inkSoft, marginTop: 4 }}>dávok užitých</div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {allTimes.map((d, i) => {
              const key = `${d.sup.id}-${d.time}`;
              return (
                <span key={i} style={{
                  width: 14, height: 28, borderRadius: 7,
                  background: taken[key] ? d.sup.color : 'rgba(43,38,32,0.08)',
                  transition: 'background 0.2s',
                }}/>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 20px 32px' }}>
        <Eyebrow style={{ marginBottom: 12 }}>Harmonogram</Eyebrow>
        {allTimes.map((d, i) => {
          const key = `${d.sup.id}-${d.time}`;
          const isTaken = !!taken[key];
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', background: PALETTE.paper,
              borderRadius: 18, marginBottom: 8,
              opacity: isTaken ? 0.55 : 1,
              transition: 'opacity 0.2s',
            }}>
              <div style={{ fontFamily: mono, fontSize: 11, color: PALETTE.inkSoft, width: 36 }}>{d.time}</div>
              <div style={{ width: 8, height: 8, borderRadius: 99, background: d.sup.color, flexShrink: 0 }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: display, fontSize: 18, color: PALETTE.ink, textDecoration: isTaken ? 'line-through' : 'none' }}>{d.sup.name}</div>
                <div style={{ fontSize: 11.5, color: PALETTE.inkMute, marginTop: 2 }}>{d.sup.dose} · {d.sup.when}</div>
              </div>
              <button onClick={() => toggle(key)} style={{
                width: 32, height: 32, borderRadius: '50%',
                border: `1.5px solid ${isTaken ? d.sup.color : PALETTE.line}`,
                background: isTaken ? d.sup.color : 'transparent',
                color: PALETTE.cream, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{isTaken && Icons.check(14, PALETTE.cream)}</button>
            </div>
          );
        })}

        <div style={{
          marginTop: 18, padding: '14px 16px',
          background: 'rgba(138,154,126,0.12)', borderRadius: 16,
          fontSize: 12.5, lineHeight: 1.5, color: PALETTE.sageDeep,
        }}>
          <strong style={{ fontFamily: display, fontSize: 14, fontWeight: 500 }}>Tip:</strong>{' '}
          <strong style={{ fontFamily: display, fontSize: 14, fontWeight: 500 }}>Tip:</strong>{' '}
          DAO (HITIMUN) ber 1 kapsulu 15 min pred jedlom s histamínom, max. 3 kapsuly denne. Pôsobí lokálne v čreve a rozkladá histamín zo stravy. Vitamín C nasadzuj pomaly.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SYMPTOMS
// ─────────────────────────────────────────────────────────────
function FeelScreen() {
  const [feel, setFeel] = React.useState({});
  const set = (id, v) => setFeel(f => ({ ...f, [id]: v }));
  const overall = Math.round(Object.values(feel).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(feel).length) * 33);

  return (
    <div style={{ background: PALETTE.cream, minHeight: '100%' }}>
      <div style={{ padding: '4px 24px' }}>
        <Eyebrow>Sympt­óm denník</Eyebrow>
        <div style={{
          fontFamily: display, fontSize: 32, lineHeight: 1.05,
          color: PALETTE.ink, marginTop: 8, letterSpacing: '-0.01em',
        }}>Ako sa<br/><em style={{ fontStyle: 'italic', color: PALETTE.sageDeep }}>cítiš dnes?</em></div>
      </div>

      <div style={{
        margin: '22px 20px 8px',
        padding: 20, borderRadius: 22,
        background: `linear-gradient(135deg, ${PALETTE.sageTint} 0%, #f0e7d4 100%)`,
        display: 'flex', alignItems: 'center', gap: 18,
      }}>
        <svg width="68" height="68" viewBox="0 0 68 68">
          <circle cx="34" cy="34" r="28" fill="none" stroke="rgba(43,38,32,0.08)" strokeWidth="6"/>
          <circle cx="34" cy="34" r="28" fill="none" stroke={PALETTE.sageDeep} strokeWidth="6"
            strokeDasharray={`${(100 - overall) * 1.76} 200`} strokeDashoffset="0"
            transform="rotate(-90 34 34)" strokeLinecap="round"/>
          <text x="34" y="40" textAnchor="middle" fontFamily={display} fontSize="20" fill={PALETTE.ink}>{100 - overall}</text>
        </svg>
        <div>
          <Eyebrow color={PALETTE.sageDeep}>Pohoda · skóre</Eyebrow>
          <div style={{ fontFamily: display, fontSize: 22, color: PALETTE.ink, marginTop: 4, lineHeight: 1.1 }}>
            {overall < 20 ? 'Pokojný deň' : overall < 50 ? 'Mierne symptómy' : 'Buď opatrná'}
          </div>
          <div style={{ fontSize: 12, color: PALETTE.inkSoft, marginTop: 4 }}>Aktualizované pred chvíľou</div>
        </div>
      </div>

      <div style={{ padding: '14px 20px 32px' }}>
        {SYMPTOMS.map(s => {
          const v = feel[s.id] || 0;
          return (
            <div key={s.id} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', background: PALETTE.paper,
              borderRadius: 16, marginBottom: 8,
            }}>
              <div style={{ flex: 1, fontSize: 14.5, color: PALETTE.ink }}>{s.label}</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2, 3].map(level => {
                  const active = v === level;
                  const labels = ['nič', '·', '··', '···'];
                  const cols = ['rgba(43,38,32,0.05)', '#dde2cf', '#c7a98b', '#b8745a'];
                  return (
                    <button key={level} onClick={() => set(s.id, level)} style={{
                      minWidth: 32, height: 32, borderRadius: 9,
                      border: 0,
                      background: active ? cols[level] : 'rgba(43,38,32,0.04)',
                      color: active && level > 1 ? PALETTE.cream : PALETTE.inkSoft,
                      fontFamily: mono, fontSize: 11,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}>{labels[level]}</button>
                  );
                })}
              </div>
            </div>
          );
        })}

        <button style={{
          width: '100%', padding: '14px 0', marginTop: 16,
          background: PALETTE.ink, color: PALETTE.cream,
          border: 0, borderRadius: 99,
          fontFamily: mono, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
          cursor: 'pointer',
        }}>Uložiť do denníka</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BOTTOM NAV
// ─────────────────────────────────────────────────────────────
function BottomNav({ tab, setTab }) {
  const items = [
    { id: 'home', label: 'Dnes', icon: Icons.home },
    { id: 'foods', label: 'Potraviny', icon: Icons.leaf },
    { id: 'pills', label: 'Doplnky', icon: Icons.pill },
    { id: 'feel', label: 'Pocit', icon: Icons.heart },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      padding: '10px 14px 28px',
      background: 'linear-gradient(180deg, rgba(243,237,226,0) 0%, rgba(243,237,226,0.96) 30%)',
      pointerEvents: 'none',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-around',
        background: 'rgba(43,38,32,0.95)',
        borderRadius: 28, padding: '10px 6px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 28px rgba(43,38,32,0.18)',
        pointerEvents: 'auto',
      }}>
        {items.map(it => {
          const active = tab === it.id;
          return (
            <button key={it.id} onClick={() => setTab(it.id)} style={{
              flex: 1, border: 0, background: 'transparent',
              padding: '8px 4px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              color: active ? PALETTE.cream : 'rgba(243,237,226,0.45)',
              cursor: 'pointer',
              transition: 'color 0.2s',
            }}>
              {it.icon(20, 'currentColor')}
              <span style={{
                fontFamily: mono, fontSize: 8.5, letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { HomeScreen, RecipeScreen, FoodsScreen, PillsScreen, FeelScreen, BottomNav, PALETTE });
