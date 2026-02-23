import { logout } from '@/app/actions/auth'
import Link from 'next/link'
import { LayoutDashboard, LogOut, FileText } from 'lucide-react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <Link href="/" className="text-xl font-bold tracking-tight text-gray-900 border-b border-transparent hover:border-gray-900 transition-colors">
                        Tech Blog
                    </Link>
                    <p className="text-xs text-gray-500 mt-1">Admin Panel</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        href="/admin"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-amber-50 text-amber-900"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/posts/new"
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
                    >
                        <FileText className="h-4 w-4" />
                        New Post
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <form action={logout}>
                        <button
                            type="submit"
                            className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign out
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-8 overflow-auto">
                {children}
            </main>
        </div>
    )
}
