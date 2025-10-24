'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface StoreDashboardLayoutProps {
  children: ReactNode;
  storeName: string;
  storeUrl: string;
}

export function StoreDashboardLayout({ children, storeName, storeUrl }: StoreDashboardLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: `/store-dashboard/${storeUrl}`,
      label: 'Dashboard',
      icon: '📊',
      exactMatch: true
    },
    {
      href: `/store-dashboard/${storeUrl}/products`,
      label: 'Products',
      icon: '📦'
    },
    {
      href: `/store-dashboard/${storeUrl}/users`,
      label: 'End Users',
      icon: '👥'
    },
    {
      href: `/store-dashboard/${storeUrl}/settings`,
      label: 'Store Settings',
      icon: '⚙️'
    },
  ];

  const isActive = (href: string, exactMatch?: boolean) => {
    if (exactMatch) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🏪</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{storeName}</h1>
                <p className="text-sm text-gray-500">Store Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href={`/store/${storeUrl}`}
                target="_blank"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                View Store
              </Link>
              <Link
                href="/api/auth/signout"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const active = isActive(item.href, item.exactMatch);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        active
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
