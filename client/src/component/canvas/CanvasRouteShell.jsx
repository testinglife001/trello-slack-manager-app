export default function CanvasRouteShell({ title, subtitle, children }) {
  return (
    <div className="h-full w-full flex flex-col bg-slate-50">
      <div className="h-12 shrink-0 border-b border-slate-200 bg-white px-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">{title}</h3>
          {subtitle ? <p className="text-[11px] text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}
