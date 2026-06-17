export default function CalendarLoading() {
  return (
    <div className="p-6 lg:p-8 animate-pulse">
      <div className="h-7 bg-slate-200 rounded-xl w-32 mb-6" />
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-slate-100 rounded-xl w-8" />
          <div className="h-6 bg-slate-200 rounded-xl w-40" />
          <div className="h-8 bg-slate-100 rounded-xl w-8" />
        </div>
        <div className="grid grid-cols-7 gap-1">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-4 bg-slate-100 rounded mb-2" />
          ))}
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-xl border border-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
