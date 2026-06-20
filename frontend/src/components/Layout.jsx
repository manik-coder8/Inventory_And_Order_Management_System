import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon, end: true },
  { to: '/products', label: 'Products', icon: ProductIcon },
  { to: '/customers', label: 'Customers', icon: CustomerIcon },
  { to: '/orders', label: 'Orders', icon: OrderIcon },
]

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="flex">
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-ink-900 md:flex">
          <div className="h-1 tape-edge" />
          <div className="flex h-20 items-center gap-3 px-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border-2 border-signal text-signal font-display font-semibold text-sm rotate-[-2deg]">
              IO
            </div>
            <div className="leading-tight">
              <p className="font-display text-base font-semibold text-paper">Ledger</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-400">Inventory &amp; Orders</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-4 py-2">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-paper/[0.08] text-paper' : 'text-ink-400 hover:bg-paper/[0.05] hover:text-paper'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full transition-colors ${isActive ? 'bg-signal' : 'bg-transparent'}`} />
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-paper/10 px-6 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-500">System status</p>
            <p className="mt-1.5 flex items-center gap-2 text-xs text-ink-400">
              <span className="h-1.5 w-1.5 rounded-full bg-forest" />
              Connected
            </p>
          </div>
        </aside>

        {/* Mobile top bar */}
        <header className="fixed inset-x-0 top-0 z-20 flex h-16 items-center justify-between bg-ink-900 px-4 md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm border-2 border-signal text-signal font-display font-semibold text-xs rotate-[-2deg]">
              IO
            </div>
            <span className="font-display text-sm font-semibold text-paper">Ledger</span>
          </div>
        </header>
        <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-ink-900/10 bg-ink-900 md:hidden">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium uppercase tracking-wide ${
                  isActive ? 'text-signal' : 'text-ink-400'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 px-4 pb-24 pt-20 md:ml-64 md:px-10 md:pb-10 md:pt-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

function DashboardIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM11 4a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM3 11a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H4a1 1 0 01-1-1v-5zM11 9a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V9z" />
    </svg>
  )
}
function ProductIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M10 2a1 1 0 01.894.553l1 2A1 1 0 0111 6H9a1 1 0 01-.894-1.447l1-2A1 1 0 0110 2zM4 7a1 1 0 011-1h10a1 1 0 011 1v9a2 2 0 01-2 2H6a2 2 0 01-2-2V7z" />
    </svg>
  )
}
function CustomerIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM3 17a7 7 0 1114 0H3z" />
    </svg>
  )
}
function OrderIcon(props) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M4 3a1 1 0 00-1 1v1a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H4zM3 8a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm5 2a1 1 0 000 2h4a1 1 0 100-2H8z" clipRule="evenodd" />
    </svg>
  )
}