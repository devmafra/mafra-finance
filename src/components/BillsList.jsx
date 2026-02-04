import React from "react";

export function BillsList({ loading, data }) {
  return (
    <section className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-slate-50 font-semibold">
        Detalhamento das Contas
      </div>
      <div className="divide-y">
        {loading ? (
          <div className="p-8 text-center text-slate-500">
            Carregando cota...
          </div>
        ) : (
          data.map((item) => (
            <div
              key={`${item.expense_id}-${item.profile_id}`}
              className="p-4 flex justify-between items-center hover:bg-slate-50 transition"
            >
              <div>
                <p className="font-medium text-slate-800">{item.description}</p>
                <p className="text-xs text-slate-500">
                  {item.member_name} •{" "}
                  <span className="font-semibold text-slate-700">
                    {item.family_name}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">
                  R$ {item.share_amount.toFixed(2)}
                </p>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${item.is_paid ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                >
                  {item.is_paid ? "Pago" : "Pendente"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
