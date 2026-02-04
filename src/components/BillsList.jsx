import React from "react";
import { Trash2, CheckCircle, Circle } from "lucide-react";
import { supabase } from "../lib/supabase";

export function BillsList({ loading, data, onRefresh }) {
  // Função para Deletar a Despesa (afeta todos os envolvidos)
  async function handleDelete(expenseId, description) {
    const confirmed = window.confirm(
      `Deseja realmente excluir a conta "${description}"? Isso apagará o registro para todos os participantes.`,
    );

    if (confirmed) {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);

      if (error) {
        alert("Erro ao deletar: " + error.message);
      } else {
        onRefresh(); // Atualiza o Dashboard
      }
    }
  }

  // Função para Alternar Status de Pagamento (individual)
  async function togglePayment(expenseId, profileId, currentStatus) {
    const { error } = await supabase
      .from("expense_splits")
      .update({
        is_paid: !currentStatus,
        paid_at: !currentStatus ? new Date().toISOString() : null,
      })
      .eq("expense_id", expenseId)
      .eq("profile_id", profileId);

    if (error) {
      alert("Erro ao atualizar status: " + error.message);
    } else {
      onRefresh(); // Atualiza o Dashboard
    }
  }

  return (
    <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-100">
      <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
        <span className="font-semibold text-slate-700">
          Detalhamento das Contas
        </span>
        <span className="text-xs text-slate-400 font-medium bg-white px-2 py-1 rounded-md border">
          {data.length} registros
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-green-600 mb-4"></div>
            <p className="text-slate-500 text-sm animate-pulse">
              Sincronizando com o banco...
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-slate-400 italic text-sm">
            Nenhuma conta cadastrada para este mês.
          </div>
        ) : (
          data.map((item) => (
            <div
              key={`${item.expense_id}-${item.profile_id}`}
              className="p-4 flex justify-between items-center hover:bg-slate-50/50 transition-colors group"
            >
              {/* Lado Esquerdo: Info da Conta */}
              <div className="flex gap-4 items-center">
                <button
                  onClick={() =>
                    togglePayment(
                      item.expense_id,
                      item.profile_id,
                      item.is_paid,
                    )
                  }
                  className={`transition-colors ${item.is_paid ? "text-green-500" : "text-slate-300 hover:text-amber-500"}`}
                >
                  {item.is_paid ? (
                    <CheckCircle size={24} />
                  ) : (
                    <Circle size={24} />
                  )}
                </button>

                <div>
                  <p
                    className={`font-semibold text-sm ${item.is_paid ? "text-slate-400 line-through" : "text-slate-800"}`}
                  >
                    {item.description}
                  </p>
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <span className="font-bold text-slate-600 uppercase">
                      {item.member_name}
                    </span>
                    <span>•</span>
                    <span className="text-slate-400">{item.family_name}</span>
                  </p>
                </div>
              </div>

              {/* Lado Direito: Valor e Ações */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p
                    className={`font-bold text-sm ${item.is_paid ? "text-slate-400" : "text-slate-900"}`}
                  >
                    R$ {item.share_amount.toFixed(2)}
                  </p>
                  <p
                    className={`text-[9px] font-black uppercase tracking-tighter ${item.is_paid ? "text-green-600" : "text-amber-600"}`}
                  >
                    {item.is_paid ? "Confirmado" : "Aguardando"}
                  </p>
                </div>

                {/* Botão de Delete (visível apenas ao passar o mouse ou se for admin) */}
                <button
                  onClick={() =>
                    handleDelete(item.expense_id, item.description)
                  }
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title="Excluir conta"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
