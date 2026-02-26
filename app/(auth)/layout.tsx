export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">相続書類管理システム</h1>
          <p className="text-sm text-gray-500 mt-1">相続税申告の書類収集を、もれなく・確実に</p>
        </div>
        {children}
      </div>
    </div>
  )
}
