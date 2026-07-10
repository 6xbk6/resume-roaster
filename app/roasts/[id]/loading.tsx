export default function RoastLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" />
          <div className="absolute inset-1 rounded-full border-2 border-transparent border-b-pink-500/50 animate-spin" style={{ animationDuration: "2s" }} />
        </div>
        <p className="text-gray-400 text-sm">加载吐槽结果...</p>
      </div>
    </div>
  );
}