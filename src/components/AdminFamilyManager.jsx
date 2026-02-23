import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import {
  Plus,
  Copy,
  Check,
  Users2,
  Sparkles,
  Trash2,
  Loader2,
} from "lucide-react";
import { useFamily } from "../hooks/useFamily";

export function AdminFamilyManager({ houseId, onRefresh }) {
  const { addFamilyToHouse } = useFamily();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [families, setFamilies] = useState([]); // Lista de famílias existentes
  const [createdFamily, setCreatedFamily] = useState(null);
  const [copied, setCopied] = useState(false);

  // 1. Busca as famílias ao carregar ou quando houseId mudar
  useEffect(() => {
    if (houseId) fetchFamilies();
  }, [houseId]);

  async function fetchFamilies() {
    setFetching(true);
    const { data, error } = await supabase
      .from("families")
      .select("*")
      .eq("house_id", houseId)
      .order("name");

    if (!error) setFamilies(data);
    setFetching(false);
  }

  const handleCreate = async () => {
    if (name.trim().length < 3) return;
    setLoading(true);
    try {
      const family = await addFamilyToHouse(houseId, name);
      setCreatedFamily(family);
      setName("");
      fetchFamilies(); // Atualiza a lista local
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (familyId, familyName) => {
    const confirmed = window.confirm(
      `Admin: Tem certeza que deseja deletar a "${familyName}"? Isso removerá o vínculo de todos os membros desta família.`,
    );

    if (confirmed) {
      const { error } = await supabase
        .from("families")
        .delete()
        .eq("id", familyId);

      if (error) {
        alert("Erro ao deletar: " + error.message);
      } else {
        fetchFamilies(); // Atualiza a lista
        if (onRefresh) onRefresh();
      }
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* SEÇÃO: CRIAR NOVA FAMÍLIA */}
      <div className="bg-white rounded-2xl p-6 border-2 border-purple-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 uppercase text-sm tracking-tight">
              Criar Nova Família
            </h3>
            <p className="text-slate-500 text-xs">
              Adicione uma nova unidade à sua casa.
            </p>
          </div>
        </div>

        {!createdFamily ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Ex: Família Matheus"
              className="flex-1 bg-slate-50 border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              disabled={loading || name.length < 3}
              onClick={handleCreate}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Plus size={18} />
              )}
              Criar
            </button>
          </div>
        ) : (
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full shadow-sm text-purple-600">
                <Users2 size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-purple-400 uppercase leading-none">
                  Sucesso
                </p>
                <p className="text-sm font-bold text-slate-700">
                  {createdFamily.name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="bg-white border border-purple-200 px-4 py-2 rounded-lg font-mono font-black text-purple-700 flex-1 text-center">
                {createdFamily.invite_code}
              </div>
              <button
                onClick={() => copyCode(createdFamily.invite_code)}
                className={`p-3 rounded-lg transition-all ${copied ? "bg-green-500 text-white" : "bg-purple-100 text-purple-600 hover:bg-purple-200"}`}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
              <button
                onClick={() => setCreatedFamily(null)}
                className="text-xs text-slate-400 font-bold px-2"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SEÇÃO: LISTAR EXISTENTES */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
            Famílias Ativas na Casa
          </h3>
        </div>

        {fetching ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            Carregando famílias...
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {families.map((f) => (
              <div
                key={f.id}
                className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-2 rounded-full text-slate-500">
                    <Users2 size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-700">{f.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                        #{f.invite_code}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyCode(f.invite_code)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Copiar Código"
                  >
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(f.id, f.name)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Deletar Família"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {families.length === 0 && (
              <div className="p-10 text-center text-slate-400 text-sm italic">
                Nenhuma família adicional criada.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
