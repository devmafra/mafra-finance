import React, { useState } from "react";
import { X, Plus, Calendar } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useMembers } from "../hooks/useMembers";

export function AddExpenseModal({ isOpen, onClose, onRefresh }) {
  const members = useMembers();
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("recorrente");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const handleSave = async () => {
    const totalValue = parseFloat(value);
    if (!description || !totalValue || selectedMembers.length === 0) {
      alert("Preencha todos os campos e selecione pelo menos uma pessoa!");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Criar a despesa
      const { data: expense, error: expError } = await supabase
        .from("expenses")
        .insert([
          {
            description,
            total_value: totalValue,
            due_date: date,
            billing_month: date.substring(0, 7) + "-01",
            type: type, // Usando o estado dinâmico
          },
        ])
        .select()
        .single();

      if (expError) throw expError;

      // 2. Criar os splits
      const share = (100 / selectedMembers.length).toFixed(2);
      const splits = selectedMembers.map((memberId) => ({
        expense_id: expense.id,
        profile_id: memberId,
        share_percentage: share,
      }));

      const { error: splitError } = await supabase
        .from("expense_splits")
        .insert(splits);

      if (splitError) throw splitError;

      // Sucesso: Limpar campos e fechar
      setDescription("");
      setValue("");
      setSelectedMembers([]);
      onRefresh();
      onClose();
    } catch (error) {
      alert("Erro ao salvar: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Nova Despesa</h2>
            <p className="text-xs text-slate-500">
              Cadastre uma conta para rateio
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Seletor de Tipo */}
          <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
            {["recorrente", "avulsa"].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                  type === t
                    ? "bg-white text-green-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Descrição (ex: Aluguel, Luz...)"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <span className="absolute left-3 top-4 text-slate-400 text-sm">
                  R$
                </span>
                <input
                  type="number"
                  placeholder="0,00"
                  className="w-full p-3 pl-9 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </div>
              <input
                type="date"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none text-slate-600"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-400 mb-3 block uppercase tracking-widest">
              Participantes do Rateio
            </label>
            <div className="grid grid-cols-2 gap-2">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggleMember(m.id)}
                  className={`p-2.5 text-xs font-bold rounded-xl border transition-all ${
                    selectedMembers.includes(m.id)
                      ? "bg-green-600 text-white border-green-600 shadow-lg shadow-green-100"
                      : "bg-white text-slate-500 border-slate-200 hover:border-green-300"
                  }`}
                >
                  {m.full_name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t flex gap-3">
          <button
            disabled={isSaving}
            onClick={handleSave}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-100 flex items-center justify-center gap-2 active:scale-95"
          >
            {isSaving ? (
              "Salvando..."
            ) : (
              <>
                <Plus size={20} /> Salvar Despesa
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
