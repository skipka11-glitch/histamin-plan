// Minimal stroke icons + decorative food placeholders

const Icon = ({ d, size = 20, stroke = 'currentColor', fill = 'none', sw = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const Icons = {
  home: (s = 20, c = 'currentColor') => (
    <Icon size={s} stroke={c} d={<><path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/></>} />
  ),
  leaf: (s = 20, c = 'currentColor') => (
    <Icon size={s} stroke={c} d={<><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19l8-8"/></>} />
  ),
  pill: (s = 20, c = 'currentColor') => (
    <Icon size={s} stroke={c} d={<><rect x="2.5" y="9" width="19" height="6" rx="3"/><path d="M12 9v6"/></>} />
  ),
  heart: (s = 20, c = 'currentColor') => (
    <Icon size={s} stroke={c} d={<path d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"/>} />
  ),
  clock: (s = 16, c = 'currentColor') => (
    <Icon size={s} stroke={c} d={<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>} />
  ),
  chev: (s = 18, c = 'currentColor', dir = 'right') => (
    <Icon size={s} stroke={c} d={
      dir === 'right' ? <path d="M9 6l6 6-6 6"/> :
      dir === 'left' ? <path d="M15 6l-9 6 9 6"/> :
      dir === 'down' ? <path d="M6 9l6 6 6-6"/> :
      <path d="M6 15l6-6 6 6"/>
    } />
  ),
  check: (s = 16, c = 'currentColor') => (
    <Icon size={s} stroke={c} sw={2} d={<path d="M4 12l5 5L20 6"/>} />
  ),
  x: (s = 14, c = 'currentColor') => (
    <Icon size={s} stroke={c} sw={2} d={<><path d="M6 6l12 12"/><path d="M18 6l-12 12"/></>} />
  ),
  plus: (s = 18, c = 'currentColor') => (
    <Icon size={s} stroke={c} sw={2} d={<><path d="M12 5v14"/><path d="M5 12h14"/></>} />
  ),
  flame: (s = 16, c = 'currentColor') => (
    <Icon size={s} stroke={c} d={<path d="M12 3s4 4 4 8a4 4 0 11-8 0c0-1 .5-2 1-3 0 2 1 3 2 3 0-3-2-4-2-7 0 0 3 0 3-1z"/>} />
  ),
  water: (s = 16, c = 'currentColor') => (
    <Icon size={s} stroke={c} d={<path d="M12 3c0 0-6 7-6 11a6 6 0 0012 0c0-4-6-11-6-11z"/>} />
  ),
};

// Decorative meal "photo" — abstract painted shape using SVG. Wellness vibe.
function MealArt({ kind, size = 88 }) {
  const palettes = {
    oats:    { bg: '#efe7d4', a: '#c7a98b', b: '#5f6f55', c: '#8a9a7e' },
    pear:    { bg: '#e7ecd9', a: '#9aa888', b: '#c7a98b', c: '#5f6f55' },
    chicken: { bg: '#f3e6cf', a: '#b8745a', b: '#8a9a7e', c: '#6a5a3f' },
    rice:    { bg: '#ece4d0', a: '#c7a98b', b: '#8a9a7e', c: '#6a5a3f' },
    soup:    { bg: '#ead8b8', a: '#b8745a', b: '#5f6f55', c: '#8a4a36' },
  };
  const p = palettes[kind] || palettes.oats;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ borderRadius: '50%', display: 'block' }}>
      <circle cx="50" cy="50" r="50" fill={p.bg}/>
      {kind === 'oats' && <>
        <circle cx="50" cy="55" r="28" fill="#fff" opacity="0.5"/>
        <circle cx="42" cy="48" r="3.2" fill={p.b}/>
        <circle cx="55" cy="44" r="2.6" fill={p.b}/>
        <circle cx="60" cy="55" r="3" fill={p.b}/>
        <circle cx="48" cy="60" r="2.4" fill={p.b}/>
        <path d="M38 56 q4 -3 8 0" stroke={p.a} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        <path d="M52 60 q4 -3 8 0" stroke={p.a} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </>}
      {kind === 'pear' && <>
        <path d="M50 28 c-10 0 -14 12 -14 20 c0 14 8 24 14 24 c6 0 14 -10 14 -24 c0 -8 -4 -20 -14 -20z" fill={p.a}/>
        <path d="M50 28 c0 -4 -2 -8 -4 -10" stroke={p.c} strokeWidth="2" fill="none" strokeLinecap="round"/>
        <ellipse cx="44" cy="48" rx="3" ry="6" fill="#fff" opacity="0.25"/>
      </>}
      {kind === 'chicken' && <>
        <ellipse cx="50" cy="55" rx="32" ry="22" fill="#fff" opacity="0.6"/>
        <path d="M30 55 q10 -14 24 -10 q10 3 14 12 q-12 8 -24 6 q-10 -2 -14 -8z" fill={p.a}/>
        <circle cx="38" cy="62" r="3" fill={p.b}/>
        <circle cx="60" cy="50" r="2.5" fill={p.b}/>
        <path d="M44 50 q3 -3 6 0" stroke="#fff" strokeWidth="1.2" fill="none" opacity="0.7"/>
      </>}
      {kind === 'rice' && <>
        <rect x="22" y="40" width="56" height="30" rx="3" fill={p.a}/>
        <rect x="22" y="40" width="56" height="6" fill={p.c} opacity="0.25"/>
        <circle cx="38" cy="36" r="6" fill="#fff" opacity="0.6"/>
        <circle cx="50" cy="34" r="7" fill="#fff" opacity="0.7"/>
        <circle cx="62" cy="36" r="6" fill="#fff" opacity="0.6"/>
        <circle cx="44" cy="55" r="2" fill={p.b}/>
        <circle cx="55" cy="55" r="2" fill={p.b}/>
      </>}
      {kind === 'soup' && <>
        <circle cx="50" cy="55" r="28" fill={p.a}/>
        <circle cx="50" cy="55" r="22" fill={p.c} opacity="0.4"/>
        <path d="M38 50 q4 -4 8 0" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.7" strokeLinecap="round"/>
        <path d="M54 52 q4 -4 8 0" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.7" strokeLinecap="round"/>
        <ellipse cx="56" cy="48" rx="3" ry="2" fill={p.b}/>
      </>}
    </svg>
  );
}

Object.assign(window, { Icon, Icons, MealArt });
