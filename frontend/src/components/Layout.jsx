import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon, end: true },
  { to: '/products', label: 'Products', icon: ProductIcon },
  { to: '/customers', label: 'Customers', icon: CustomerIcon },
  { to: '/orders', label: 'Orders', icon: OrderIcon },
]

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-slate-200 bg-white md:flex">
          <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-600 text-white font-bold text-sm">
              IO
            </div>
            <span className="text-sm font-semibold text-slate-900">Inventory & Orders</span>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile top bar */}
        <header className="fixed inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white font-bold text-xs">
              IO
            </div>
            <span className="text-sm font-semibold text-slate-900">Inventory & Orders</span>
          </div>
        </header>
        <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-slate-200 bg-white md:hidden">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${
                  isActive ? 'text-brand-700' : 'text-slate-500'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 px-4 pb-20 pt-16 md:ml-60 md:px-8 md:pb-8 md:pt-8">
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