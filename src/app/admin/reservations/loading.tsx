export default function ReservationsLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-7 bg-slate-200 rounded-xl w-40 mb-2" />
          <div className="h-4 bg-slate-100 rounded-xl w-24" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 bg-slate-100 rounded-xl w-44" />
          <div className="h-10 bg-slate-100 rounded-xl w-28" />
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100">
          <div className="h-4 bg-slate-200 rounded w-36" />
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0">
            <div className="w-2 h-2 bg-slate-200 rounded-full shrink-0" />
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-32 mb-1" />
              <div className="h-3 bg-slate-100 rounded w-48" />
            </div>
            <div className="h-5 bg-slate-100 rounded-full w-20 shrink-0" />
            <div className="h-4 bg-slate-200 rounded w-16 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
