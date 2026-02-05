import React from "react";
import { PieChart, TrendingUp } from "lucide-react";

export function FamilyShare({ data, totalGeral }) {
  // 1. Agrupar valores por família OU por membro individual (se for solo)
  const familyData = data.reduce((acc, item) => {
    // Se não tiver família ou for 'Solo', o 'id' do grupo é o profile_id (único)
    // Caso contrário, o 'id' do grupo é o próprio nome da família
    const isSolo = !item.family_name || item.family_name === "Solo";
    const groupKey = isSolo
      ? `individual-${item.profile_id}`
      : item.family_name;
    const displayName = isSolo ? item.full_name : item.family_name;

    if (!acc[groupKey]) {
      acc[groupKey] = {
        name: displayName,
        total: 0,
        count: 0,
        isSolo: isSolo,
      };
    }
    acc[groupKey].total += item.share_amount;
    acc[groupKey].count += 1;
    return acc;
  }, {});

  // 2. Transformar em Array e ordenar
  const sortedFamilies = Object.values(familyData)
    .map((stats) => ({
      name: stats.name,
      total: stats.total,
      count: stats.count,
      isSolo: stats.isSolo,
      percentage: totalGeral > 0 ? (stats.total / totalGeral) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  if (data.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-5 border-b bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChart className="text-emerald-600" size={20} />
          <h3 className="font-bold text-slate-700">Divisão de Gastos</h3>
        </div>
        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
          <TrendingUp size={12} />
          <span>Proporcional</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {sortedFamilies.map((family) => (
          <div key={family.name} className="space-y-2">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                  {family.name}
                  {family.isSolo && (
                    <span className="ml-2 text-[9px] text-slate-400 font-normal border border-slate-200 px-1 rounded">
                      SOLO
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {family.count}{" "}
                  {family.count > 1 ? "cotas registradas" : "cota registrada"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">
                  R${" "}
                  {family.total.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs font-black text-emerald-600">
                  {family.percentage.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Barra de Progresso - Cores diferentes para Solo vs Família (opcional) */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  family.isSolo ? "bg-blue-500" : "bg-emerald-500"
                }`}
                style={{ width: `${family.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-slate-50 text-center border-t">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          Baseado no Total de R${" "}
          {totalGeral.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>
    </section>
  );
}
