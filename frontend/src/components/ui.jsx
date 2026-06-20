export function Card({ children, className = '' }) {
  return (
    <div className={`bg-paper-card rounded-lg border border-ink-900/[0.08] shadow-card ${className}`}>
      {children}
    </div>
  )
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium tracking-[0.01em] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-signal focus-visible:outline-offset-2'
  const variants = {
    primary: 'bg-ink-900 text-paper hover:bg-ink-800 active:scale-[0.98] shadow-card',
    signal: 'bg-signal text-white hover:bg-signal-600 active:scale-[0.98] shadow-card',
    secondary: 'bg-paper-card text-ink-800 border border-ink-900/15 hover:border-ink-900/30 hover:bg-paper-dim',
    danger: 'bg-paper-card text-rust border border-rust/25 hover:bg-rust-50',
    ghost: 'text-ink-500 hover:bg-ink-900/[0.05] hover:text-ink-800',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-ink-900/[0.06] text-ink-600',
    green: 'bg-forest-50 text-forest-600',
    red: 'bg-rust-50 text-rust-600',
    amber: 'bg-signal-50 text-signal-700',
    blue: 'bg-ink-900/[0.06] text-ink-700',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium font-mono tracking-tight ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function SkuTag({ children }) {
  return (
    <span className="sku-tag inline-flex items-center rounded-sm bg-paper-dim px-2 py-0.5 text-xs text-ink-600">
      {children}
    </span>
  )
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</span>}
      <input
        className={`w-full rounded-md border bg-paper-card px-3 py-2 text-sm text-ink-800 placeholder:text-ink-400 transition-colors focus:outline-none focus:ring-2 focus:ring-signal/40 focus:border-signal ${
          error ? 'border-rust/40' : 'border-ink-900/15'
        } ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-rust">{error}</span>}
    </label>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</span>}
      <select
        className={`w-full rounded-md border bg-paper-card px-3 py-2 text-sm text-ink-800 transition-colors focus:outline-none focus:ring-2 focus:ring-signal/40 focus:border-signal ${
          error ? 'border-rust/40' : 'border-ink-900/15'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <span className="mt-1 block text-xs text-rust">{error}</span>}
    </label>
  )
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-ink-900/15 bg-paper-dim/40 px-6 py-16 text-center">
      <p className="font-display text-lg text-ink-800">{title}</p>
      {description && <p className="mt-1.5 text-sm text-ink-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Spinner({ className = '' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

export function Alert({ tone = 'red', children }) {
  const tones = {
    red: 'bg-rust-50 text-rust-600 border-rust/20',
    green: 'bg-forest-50 text-forest-600 border-forest/20',
    amber: 'bg-signal-50 text-signal-700 border-signal/25',
  }
  return (
    <div className={`rounded-md border px-4 py-3 text-sm animate-fade-up ${tones[tone]}`} role="alert">
      {children}
    </div>
  )
}

export function SectionEyebrow({ children }) {
  return (
    <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-ink-400">
      {children}
    </span>
  )
}