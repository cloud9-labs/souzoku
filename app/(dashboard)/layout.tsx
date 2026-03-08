'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="font-bold text-gray-900 text-sm">
              相続書類管理
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/dashboard"
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  pathname === '/dashboard'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                案件一覧
              </Link>
              <Link
                href="/dashboard/cases/new"
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  pathname === '/dashboard/cases/new'
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                + 新規案件
              </Link>
            </nav>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-500 text-xs">
            ログアウト
          </Button>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
