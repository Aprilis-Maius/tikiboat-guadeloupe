export default function AdminDashboardLoading() {
  return (
    <div className="p-7 lg:p-9 max-w-6xl animate-pulse">
      <div className="mb-8">
        <div className="h-7 bg-slate-200 rounded-xl w-36 mb-2" />
        <div className="h-4 bg-slate-100 rounded-xl w-56" />
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="w-10 h-10 bg-slate-100 rounded-xl mb-4" />
            <div className="h-8 bg-slate-100 rounded-lg w-14 mb-2" />
            <div className="h-3 bg-slate-100 rounded-lg w-28" />
          </div>
        ))}
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="h-4 bg-slate-100 rounded-lg w-48" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 px-6 py-4 border-b border-slate-100 last:border-0">
            <div className="h-4 bg-slate-100 rounded w-16 shrink-0" />
            <div className="h-4 bg-slate-100 rounded flex-1" />
            <div className="h-4 bg-slate-100 rounded w-24 shrink-0" />
            <div className="h-4 bg-slate-100 rounded w-16 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
