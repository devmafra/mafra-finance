import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Users,
  FileText,
  Pencil,
  Trash2,
  Search,
  ArrowLeft,
  Home, // Adicionado para a aba de famílias
} from "lucide-react";
import { BillModal } from "../components/BillModal";
import { AdminFamilyManager } from "../components/AdminFamilyManager";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 1. MEMÓRIA DA ABA: Inicializa pegando do LocalStorage
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("admin_active_tab") || "expenses";
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [houseId, setHouseId] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState(null);

  // 2. SALVAR ABA: Sempre que mudar, grava no navegador
  useEffect(() => {
    localStorage.setItem("admin_active_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (user) fetchAdminHouse();
    if (activeTab !== "families") fetchData();
  }, [activeTab, user]);

  async function fetchAdminHouse() {
    const { data: profile } = await supabase
      .from("profiles")
      .select("house_id")
      .eq("user_id", user.id)
      .single();
    if (profile) setHouseId(profile.house_id);
  }

  async function fetchData() {
    setLoading(true);
    try {
      let query;
      if (activeTab === "users") {
        query = supabase.from("profiles").select("*").order("full_name");
      } else if (activeTab === "expenses") {
        query = supabase
          .from("expenses")
          .select(
            `
            *,
            owner:profiles!expenses_created_by_profiles_fkey ( full_name )
          `,
          )
          .order("due_date", { ascending: false });
      }

      if (query) {
        const { data: result, error } = await query;
        if (error) throw error;
        setData(result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const formatDateBR = (dateString) => {
    if (!dateString) return "-";
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const handleEditExpense = (expense) => {
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
            className="text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <ArrowLeft size={16} /> Voltar ao App
          </button>
        </div>

        {/* Controles e Tabs */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex bg-white p-1 rounded-xl shadow-sm overflow-x-auto w-full md:w-auto">
            <button
              onClick={() => setActiveTab("expenses")}
              className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === "expenses" ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <FileText size={16} /> Despesas Globais
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === "users" ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Users size={16} /> Usuários
            </button>
            {/* NOVA ABA: Famílias */}
            <button
              onClick={() => setActiveTab("families")}
              className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === "families" ? "bg-blue-600 text-white shadow" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Home size={16} /> Gerenciar Famílias
            </button>
          </div>

          {activeTab !== "families" && (
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
          )}
        </div>

        {/* Conteúdo Dinâmico conforme a Aba */}
        <div className="min-h-[400px]">
          {activeTab === "families" ? (
            <div
              key="tab-families" // Força o React a criar um elemento novo
              className="animate-in fade-in zoom-in-95 duration-300 outline-none"
            >
              {houseId && (
                <AdminFamilyManager houseId={houseId} onRefresh={fetchData} />
              )}
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-blue-700 text-sm">
                💡 <b>Dica:</b> Use esta aba para criar novas divisões na sua
                casa. Cada família criada gera um código único.
              </div>
            </div>
          ) : (
            <div
              key="tab-table" // Força o React a criar um elemento novo para a tabela
              className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300"
            >
              {loading ? (
                <div className="p-12 text-center text-slate-500">
                  Carregando dados...
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
                              <td className="p-4 font-bold">
                                {item.description}
                              </td>
                              <td className="p-4">
                                R$ {item.total_value?.toFixed(2)}
                              </td>
                              <td className="p-4">
                                {formatDateBR(item.due_date)}
                              </td>
                              <td className="p-4 text-xs">
                                {item.owner?.full_name || "Desconhecido"}
                              </td>
                              <td className="p-4 flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditExpense(item)}
                                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded"
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <BillModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBill(null);
        }}
        editingBill={editingBill}
        onRefresh={fetchData}
      />
    </div>
  );
}
