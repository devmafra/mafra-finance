import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Users,
  FileText,
  Pencil,
  Trash2,
  Search,
  ArrowLeft,
} from "lucide-react";
import { BillModal } from "../components/BillModal"; // Reutilizando seu modal
import { useNavigate } from "react-router-dom";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("expenses"); // 'users' ou 'expenses'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Controle de Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  async function fetchData() {
    setLoading(true);
    try {
      let query;

      if (activeTab === "users") {
        // Busca todos os perfis
        query = supabase.from("profiles").select("*").order("full_name");
      } else {
        // Busca todas as despesas (e quem criou)
        query = supabase
          .from("expenses")
          .select(
            `
    *,
    owner:profiles!expenses_created_by_profiles_fkey (
      full_name
    )
  `,
          )
          .order("due_date", { ascending: false });
      }

      const { data: result, error } = await query;
      if (error) throw error;
      setData(result);
    } catch (err) {
      alert("Erro ao carregar dados: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const formatDateBR = (dateString) => {
    if (!dateString) return "-";
    // Quebra a string "2026-02-10" em partes
    const [year, month, day] = dateString.split("-");
    // Remonta na ordem brasileira
    return `${day}/${month}/${year}`;
  };

  // Abre o modal de edição
  const handleEditExpense = (expense) => {
    // Mapeamento caso necessário, mas agora sua estrutura está limpa
    setEditingBill(expense);
    setIsModalOpen(true);
  };

  const handleDeleteExpense = async (id) => {
    if (
      !window.confirm(
        "Admin: Tem certeza que quer deletar essa conta do banco?",
      )
    )
      return;
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (!error) fetchData();
    else alert(error.message);
  };

  // Filtro simples no front-end
  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
    if (activeTab === "users") {
      return (
        item.full_name?.toLowerCase().includes(term) ||
        item.role?.toLowerCase().includes(term)
      );
    } else {
      return (
        item.description?.toLowerCase().includes(term) ||
        item.owner?.full_name?.toLowerCase().includes(term)
      );
    }
  });

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Admin */}
        <div className="flex items-center justify-between bg-slate-900 text-white p-6 rounded-2xl shadow-lg">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              🛡️ Painel Administrativo
            </h1>
            <p className="text-slate-400 text-sm">Controle total do sistema</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Voltar ao App
          </button>
        </div>

        {/* Controles e Tabs */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex bg-white p-1 rounded-xl shadow-sm">
            <button
              onClick={() => setActiveTab("expenses")}
              className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === "expenses"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <FileText size={16} /> Despesas Globais
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                activeTab === "users"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Users size={16} /> Usuários
            </button>
          </div>

          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-3 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder={`Buscar em ${activeTab === "users" ? "usuários" : "despesas"}...`}
              className="w-full pl-10 p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabelas */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">
              Carregando dados do servidor...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold">
                    {activeTab === "users" ? (
                      <>
                        <th className="p-4">Nome</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Family ID</th>
                        <th className="p-4">User ID</th>
                      </>
                    ) : (
                      <>
                        <th className="p-4">Descrição</th>
                        <th className="p-4">Valor</th>
                        <th className="p-4">Vencimento</th>
                        <th className="p-4">Criado por</th>
                        <th className="p-4 text-right">Ações</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      {activeTab === "users" ? (
                        <>
                          <td className="p-4 font-semibold">
                            {item.full_name}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-500"}`}
                            >
                              {item.role}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-xs text-slate-400">
                            {item.family_id || "-"}
                          </td>
                          <td className="p-4 font-mono text-xs text-slate-400">
                            {item.user_id}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-4 font-bold">{item.description}</td>
                          <td className="p-4">
                            R$ {item.total_value?.toFixed(2)}
                          </td>
                          <td className="p-4">{formatDateBR(item.due_date)}</td>
                          <td className="p-4 text-xs">
                            {item.owner?.full_name || "Desconhecido"}
                          </td>
                          <td className="p-4 flex justify-end gap-2">
                            <button
                              onClick={() => handleEditExpense(item)}
                              className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                              title="Editar como Admin"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(item.id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length === 0 && (
                <div className="p-8 text-center text-slate-400 italic">
                  Nenhum registro encontrado.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edição conectado */}
      <BillModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBill(null);
        }}
        editingBill={editingBill}
        onRefresh={fetchData} // Atualiza a tabela do admin
      />
    </div>
  );
}
