import React from "react";
import { Users } from "lucide-react";

export function FamilyShare({ data, totalGeral }) {
  // Agrupa os totais por família
  const totaisPorFamilia = data.reduce((acc, item) => {
    const nomeFamilia = item.family_name || "Individual";
    if (!acc[nomeFamilia]) {
      acc[nomeFamilia] = 0;
    }
    acc[nomeFamilia] += item.share_amount;
    return acc;
  }, {});

  // Transforma o objeto em um array para facilitar o .map() no JSX
  const listaFamilias = Object.entries(totaisPorFamilia).map(
    ([nome, valor]) => ({
      nome,
      valor,
    }),
  );
  return (
    <section className="mt-8">
      <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Divisão por Família
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {listaFamilias.map((familia) => (
          <div
            key={familia.nome}
            className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-emerald-500"
          >
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {familia.nome}
            </p>
            <p className="text-xl font-black text-slate-800">
              R$ {familia.valor.toFixed(2)}
            </p>
            <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${(familia.valor / totalGeral) * 100 || 0}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {((familia.valor / totalGeral) * 100 || 0).toFixed(1)}% do total
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
