// Install instructions overlay for adding the app to the home screen

function detectPlatform() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/.test(ua);
  return { isIOS, isAndroid, isMobile: isIOS || isAndroid };
}

function InstallButton({ onOpen }) {
  return (
    <button onClick={onOpen} style={{
      position: 'fixed', left: 16, bottom: 16, zIndex: 90,
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '11px 16px 11px 14px',
      background: 'rgba(43,38,32,0.92)', color: '#f3ede2',
      border: 0, borderRadius: 99, cursor: 'pointer',
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
      boxShadow: '0 6px 22px rgba(43,38,32,0.28)',
      backdropFilter: 'blur(12px)',
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12"/>
        <path d="M7 10l5 5 5-5"/>
        <path d="M5 21h14"/>
      </svg>
      Inštalovať
    </button>
  );
}

function InstallSheet({ onClose }) {
  const { isIOS, isAndroid } = detectPlatform();
  const [canPrompt, setCanPrompt] = React.useState(!!window.__deferredPrompt);

  React.useEffect(() => {
    const onReady = () => setCanPrompt(true);
    const onInstalled = () => { setCanPrompt(false); onClose(); };
    window.addEventListener('installprompt:ready', onReady);
    window.addEventListener('installprompt:installed', onInstalled);
    return () => {
      window.removeEventListener('installprompt:ready', onReady);
      window.removeEventListener('installprompt:installed', onInstalled);
    };
  }, []);

  const triggerPrompt = async () => {
    const p = window.__deferredPrompt;
    if (!p) return;
    p.prompt();
    await p.userChoice;
    window.__deferredPrompt = null;
    setCanPrompt(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(20,17,14,0.6)',
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
        padding: '12px 24px 32px',
        animation: 'slideUp 0.3s ease forwards',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{
          width: 40, height: 4, borderRadius: 4,
          background: 'rgba(43,38,32,0.18)',
          margin: '0 auto 16px',
        }}/>

        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: PALETTE.inkMute }}>
          Pridať na plochu
        </div>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif", fontSize: 30, lineHeight: 1.05,
          color: PALETTE.ink, marginTop: 6, letterSpacing: '-0.01em',
        }}>
          Maj svoj plán<br/>
          <em style={{ fontStyle: 'italic', color: PALETTE.sageDeep }}>vždy po ruke</em>
        </div>
        <div style={{ fontSize: 14, color: PALETTE.inkSoft, marginTop: 10, lineHeight: 1.5 }}>
          Nainštaluj appku do telefónu — bude sa otvárať z ikonky na ploche ako klasická aplikácia, bez prehliadača a aj <em>offline</em>.
        </div>

        {canPrompt && (
          <button onClick={triggerPrompt} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', marginTop: 20, padding: '14px 20px',
            background: PALETTE.sageDeep, color: PALETTE.cream,
            border: 0, borderRadius: 99,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
            cursor: 'pointer',
          }}>Nainštalovať jedným klikom</button>
        )}

        {/* iOS instructions */}
        <Section title="Na iPhone (Safari)" active={isIOS}>
          <Step n="1" body={<>Otvor túto stránku v <strong>Safari</strong> (nie v Chrome).</>}/>
          <Step n="2" body={
            <>Klepni na ikonu <ShareGlyph/> dole v lište prehliadača.</>
          }/>
          <Step n="3" body={<>V menu vyber <strong>„Pridať na plochu"</strong> (Add to Home Screen) a potvrď <em>Pridať</em>.</>}/>
          <Step n="4" body={<>Appka sa otvára z ikonky <LeafIcon/> bez Safari liští — vyzerá ako natívna.</>}/>
        </Section>

        <Section title="Na Androide (Chrome)" active={isAndroid}>
          <Step n="1" body={<>Klepni na <strong>tri bodky ⋮</strong> v pravom hornom rohu.</>}/>
          <Step n="2" body={<>Vyber <strong>„Inštalovať aplikáciu"</strong> (Install app) alebo <strong>„Pridať na plochu"</strong>.</>}/>
          <Step n="3" body={<>Potvrď <em>Inštalovať</em>. Ikona pristane medzi tvojimi aplikáciami.</>}/>
        </Section>

        <Section title="Na počítači" active={!isIOS && !isAndroid}>
          <Step n="1" body={<>V Chrome / Edge klikni na ikonu <strong>⊕</strong> v adresnej lište.</>}/>
          <Step n="2" body={<>Alebo Menu → <strong>Inštalovať Histamín…</strong></>}/>
        </Section>

        <div style={{
          marginTop: 18, padding: '12px 14px',
          background: 'rgba(138,154,126,0.14)', borderRadius: 14,
          fontSize: 12, color: PALETTE.sageDeep, lineHeight: 1.5,
        }}>
          <strong style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 14, fontWeight: 500 }}>Pozn.</strong>{' '}
          Aby si appku používala dlhodobo, odporúčam si ju nahrať na stabilný hosting (Vercel, Netlify, GitHub Pages — zdarma) a inštalovať z vlastnej URL.
        </div>

        <button onClick={onClose} style={{
          width: '100%', marginTop: 16, padding: '12px 0',
          background: 'transparent', color: PALETTE.inkSoft,
          border: `1px solid ${PALETTE.line}`, borderRadius: 99,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
          cursor: 'pointer',
        }}>Zavrieť</button>
      </div>
    </div>
  );
}

function Section({ title, children, active }) {
  return (
    <div style={{
      marginTop: 20, padding: '14px 16px 6px',
      background: active ? PALETTE.paper : 'transparent',
      border: `1px solid ${active ? PALETTE.line : 'transparent'}`,
      borderRadius: 18,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        color: active ? PALETTE.sageDeep : PALETTE.inkMute,
        marginBottom: 10,
      }}>
        {active && <span style={{ width: 6, height: 6, borderRadius: 99, background: PALETTE.sageDeep }}/>}
        {title}{active && ' · pre teba'}
      </div>
      {children}
    </div>
  );
}

function Step({ n, body }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '8px 0' }}>
      <div style={{
        flexShrink: 0, width: 24, height: 24, borderRadius: '50%',
        background: PALETTE.sageTint, color: PALETTE.sageDeep,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Cormorant Garamond', serif", fontSize: 14,
      }}>{n}</div>
      <div style={{ fontSize: 13.5, color: PALETTE.ink, lineHeight: 1.5, paddingTop: 2 }}>{body}</div>
    </div>
  );
}

function ShareGlyph() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 22, height: 22, borderRadius: 5,
      background: '#007aff', color: '#fff',
      verticalAlign: -6, margin: '0 2px',
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v13"/>
        <path d="M7 8l5-5 5 5"/>
        <path d="M5 14v6h14v-6"/>
      </svg>
    </span>
  );
}

function LeafIcon() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 22, height: 22, borderRadius: 6,
      background: 'linear-gradient(135deg, #5f6f55, #8a9a7e)',
      color: '#f3ede2',
      verticalAlign: -6, margin: '0 2px',
    }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/>
        <path d="M5 19l8-8"/>
      </svg>
    </span>
  );
}

Object.assign(window, { InstallButton, InstallSheet, detectPlatform });
