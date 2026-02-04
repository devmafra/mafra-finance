import React, { useState } from "react";
import { X, Plus, Calendar, Calculator } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useMembers } from "../hooks/useMembers";
import { useAddExpense } from "../hooks/useAddExpense";

export function AddExpenseModal({ isOpen, onClose, onRefresh }) {
  const members = useMembers();
  const { addExpense, isSaving } = useAddExpense();

  // Estados locais de controle do formulário
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("recorrente");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [installments, setInstallments] = useState(1);

  if (!isOpen) return null;

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id],
    );
  };

  const handleSave = () => {
    addExpense({
      description,
      value,
      date,
      type,
      installments,
      selectedMembers,
      onSuccess: () => {
        onRefresh();
        onClose();
        // Reset local
        setDescription("");
        setValue("");
        setInstallments("");
        setSelectedMembers([]);
      },
    });
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
            {["recorrente", "parcelada"].map((t) => (
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

            <div className="grid grid-cols-2 gap-4">
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
              {type === "parcelada" && (
                <div className="col-span-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-bold text-slate-400 mb-1 ml-1 block uppercase">
                    Número de Parcelas
                  </label>
                  <div className="relative">
                    <Calculator
                      className="absolute left-3 top-4 text-slate-400"
                      size={18}
                    />
                    <input
                      type="number"
                      placeholder="Ex: 12 (vezes)"
                      className="w-full p-3 pl-10 bg-green-50/50 border border-green-100 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-bold text-green-700"
                      value={installments}
                      onChange={(e) => setInstallments(e.target.value)}
                    />
                  </div>
                </div>
              )}
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
