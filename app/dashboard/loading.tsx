export default function DashboardLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
        </div>
        <p className="text-gray-400 text-sm">加载历史记录...</p>
      </div>
    </div>
  );
}