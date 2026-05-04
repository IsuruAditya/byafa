import { Outlet, NavLink } from 'react-router-dom'

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
]

export function AdminLayout() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-white px-4 py-6">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
          Admin
        </p>
        <nav className="space-y-1" aria-label="Admin navigation">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                ].join(' ')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Page content */}
      <main className="flex-1 px-8 py-6">
        <Outlet />
      </main>
    </div>
  )
}
