export function LoadingState() {
  return (
    <div className="bg-gray-50 min-h-full flex items-center justify-center">
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gradient-from mx-auto mb-4"></div>
        <p className="text-gray-600">Loading practice zone...</p>
      </div>
    </div>
  );
}
