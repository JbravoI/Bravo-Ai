import Link from "next/link";

const FEATURES = [
  ["◌", "Regulatory monitoring", "Track FCA, PRA, HM Treasury and EU changes in one focused workspace."],
  ["✦", "AI-powered clarity", "Turn dense regulation into practical next steps, grounded in your tracked records."],
  ["⌁", "Always audit-ready", "Keep a clear, time-stamped trail of changes, questions and compliance activity."],
];

const STEPS = [
  ["01", "Monitor", "We continuously surface regulatory changes that are relevant to your organisation."],
  ["02", "Understand", "See the business impact, priority and deadline behind each update."],
  ["03", "Act with confidence", "Give compliance, risk and leadership a shared view of what needs attention."],
];

export default function LandingPage() {
  return (
    <main className="landing-page">
      <nav className="landing-nav" aria-label="Landing page">
        <Link href="/" className="landing-brand" aria-label="Bravo Ai home">
          <span className="landing-brand-mark">Ω</span>
          <span>Bravo<span> Ai</span></span>
        </Link>
        <div className="landing-nav-actions">
          <Link href="/login" className="landing-login">Sign in</Link>
          <Link href="/signup" className="landing-button landing-button-small">Get started</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <div className="landing-orb landing-orb-one" />
        <div className="landing-orb landing-orb-two" />
        <p className="landing-eyebrow"><span /> Regulatory intelligence for financial services</p>
        <h1>Turn regulatory<br />change into confident<br /><em>action.</em></h1>
        <p className="landing-lead">Bravo Ai brings monitoring, impact analysis and compliance readiness into one clear, auditable view.</p>
        <div className="landing-hero-actions">
          <Link href="/signup" className="landing-button">Start monitoring free <span>↗</span></Link>
          <a href="#how-it-works" className="landing-link">See how it works <span>↓</span></a>
        </div>
        <p className="landing-proof">Built for compliance, risk and legal teams</p>
      </section>

      <section className="landing-preview" aria-label="Bravo Ai dashboard preview">
        <div className="preview-topbar"><span className="preview-logo">Ω</span><span>Bravo Ai</span><span className="preview-search">⌕ Search regulatory intelligence</span><span className="preview-avatar">EJ</span></div>
        <div className="preview-body">
          <aside><small>MONITOR</small><b>▦ Overview</b><span>⚡ Alerts <i>7</i></span><span>✓ Compliance</span><small>ANALYSE</small><span>⌕ Search & Q&A</span><span>◈ Impact map</span></aside>
          <div className="preview-content">
            <div className="preview-heading"><div><small>GOOD MORNING, EWUJI</small><strong>Regulatory overview</strong></div><button>↻ Scan now</button></div>
            <div className="preview-stats"><div><small>REGULATIONS TRACKED</small><b>248</b><em>↑ 12 this week</em></div><div><small>HIGH PRIORITY</small><b>7</b><em className="red">● 3 new today</em></div><div><small>COMPLIANCE SCORE</small><b>84%</b><em>↑ 3% vs last month</em></div></div>
            <div className="preview-list"><div className="preview-list-title">Recent regulatory updates <span>View all →</span></div><div><i>⚖</i><b>FCA Consumer Duty annual review requirements</b><em>HIGH</em></div><div><i>🏛</i><b>PRA Basel 3.1 capital requirements</b><em>HIGH</em></div><div><i>🏦</i><b>Financial Services and Markets Act update</b><em className="amber">MEDIUM</em></div></div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-intro">
        <p className="landing-kicker">REGULATORY CHANGE, MADE CLEAR</p>
        <h2>Everything your team needs to <span>stay ahead.</span></h2>
        <p>From the first signal to the final decision, Bravo Ai gives you the context to move decisively.</p>
        <div className="landing-feature-grid">
          {FEATURES.map(([icon, title, text]) => <article key={title} className="landing-feature"><span className="feature-icon">{icon}</span><h3>{title}</h3><p>{text}</p><span className="feature-arrow">↗</span></article>)}
        </div>
      </section>

      <section id="how-it-works" className="landing-section landing-steps-section">
        <p className="landing-kicker">A CLEARER WAY TO STAY COMPLIANT</p>
        <h2>Three steps to <span>continuous clarity.</span></h2>
        <div className="landing-steps">
          {STEPS.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className="landing-security">
        <div><p className="landing-kicker">SECURITY YOU CAN STAND BEHIND</p><h2>Built for the responsibility <span>you carry.</span></h2><p>Your compliance data deserves more than a dashboard. Bravo Ai is designed with accountable, secure decision-making in mind.</p><Link href="/signup" className="landing-link">Explore Bravo Ai <span>↗</span></Link></div>
        <div className="security-card"><div><span>◈</span><b>Traceable by design</b><p>Every question, change and action has a clear place in your audit trail.</p></div><div><span>◌</span><b>Grounded intelligence</b><p>Answer questions against the regulations your organisation tracks.</p></div></div>
      </section>

      <section className="landing-cta"><div className="landing-cta-glow" /><p className="landing-kicker">READY WHEN YOU ARE</p><h2>Make every regulatory<br />change <span>manageable.</span></h2><p>Bring clarity to your compliance programme from today.</p><Link href="/signup" className="landing-button">Get started with Bravo Ai <span>↗</span></Link></section>

      <footer className="landing-footer"><Link href="/" className="landing-brand"><span className="landing-brand-mark">Ω</span><span>Bravo<span> Ai</span></span></Link><span>© 2026 Bravo Ai. Regulatory intelligence, made clear.</span><div><Link href="/login">Sign in</Link></div></footer>
    </main>
  );
}
