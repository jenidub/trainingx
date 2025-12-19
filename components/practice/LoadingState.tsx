export function LoadingState() {
  return (
    <div className="min-h-full py-12 flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-slate-500 text-lg font-bold">
          Loading practice zone...
        </div>
      </div>
    </div>
  );
}
