import React from "react";

export function SummaryCard({
  title,
  value = 0,
  icon,
  color,
  isCurrency = true,
  loading = false,
}) {
  return (
    <div
      className={`${color} p-5 rounded-2xl border border-white/50 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 duration-300`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-white/50 rounded-lg shadow-sm">{icon}</div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">
          {title}
        </span>
      </div>

      {loading ? (
        /* Skeleton Loading */
        <div className="space-y-2 animate-pulse">
          <div className="h-8 w-32 bg-slate-200/50 rounded-lg"></div>
        </div>
      ) : (
        <div className="flex items-baseline gap-1">
          {isCurrency && (
            <span className="text-sm font-bold text-slate-400">R$</span>
          )}
          <p className="text-3xl font-black text-slate-800 tracking-tight">
            {isCurrency
              ? value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
              : value}
          </p>
        </div>
      )}
    </div>
  );
}
