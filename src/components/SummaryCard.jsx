import React from "react";

export function SummaryCard({ title, value, icon, color, isCurrency = true }) {
  return (
    <div className={`${color} p-4 rounded-xl border border-white shadow-sm`}>
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-sm font-medium text-slate-600 uppercase tracking-wider">
          {title}
        </span>
      </div>
      <p className="text-2xl font-black text-slate-800">
        {isCurrency ? `R$ ${value.toFixed(2)}` : value}
      </p>
    </div>
  );
}
