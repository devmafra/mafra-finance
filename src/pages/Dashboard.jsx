import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";
import { format, addMonths, subMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Wallet, Users, CheckCircle2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { SummaryCard } from "../components/SummaryCard.jsx";
import { FamilyShare } from "../components/FamilyShare.jsx";
import { BillsList } from "../components/BillsList.jsx";
import { MembersList } from "../components/MembersList.jsx";
import { BillModal } from "../components/BillModal.jsx";
import { Header } from "../components/Header.jsx";
import { OnboardingBanner } from "../components/OnboardingBanner.jsx";

export function Dashboard() {
  const { user } = useAuth();
  const [myProfile, setMyProfile] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1)); // Fev 2026 (mesmo do seed)
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBill, setEditingBill] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (user) {
      fetchMyProfile();
      fetchMonthlyData();
    }
  }, [currentMonth, user]);

  // Busca os dados do meu perfil na tabela profiles
  async function fetchMyProfile() {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select(
        `
      *,
      families (
        name,
        join_code
      )
    `,
      ) // Isso faz um "Join" automático no Supabase
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile) {
      setMyProfile({
        ...profile,
        family_name: profile.families?.name || "Solo",
        join_code: profile.families?.join_code || null, // <--- Pegando o código aqui
      });
    }
  }

  async function fetchMonthlyData() {
    setLoading(true);
    const monthStr = format(currentMonth, "yyyy-MM-01");

    const { data: shares, error } = await supabase
      .from("vw_member_shares")
      .select("*")
      .eq("billing_month", monthStr);

    if (error) console.error(error);
    else setData(shares);
    setLoading(false);
  }

  // --- CÁLCULOS DINÂMICOS ---

  // 1. Total Geral da Casa (Soma tudo que veio da View)
  const totalGeral = data.reduce((acc, item) => acc + item.share_amount, 0);

  // 2. Minha Cota Individual (Usa o ID real do Auth)
  const meuTotal = data
    .filter((d) => d.user_id === user?.id)
    .reduce((acc, item) => acc + item.share_amount, 0);

  // 3. Cota da Minha Família (Usa o family_id do meu perfil)
  const totalFamilia = data
    .filter(
      (d) =>
        d.family_id === myProfile?.family_id && myProfile?.family_id !== null,
    )
    .reduce((acc, item) => acc + item.share_amount, 0);

  // Bill Modal
  const handleEditBill = (bill) => {
    setEditingBill(bill);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingBill(null);
    setIsModalOpen(false);
  };

  const handleRefreshAll = () => {
    // 1. Atualiza a lista de contas
    fetchMonthlyData();
    // 2. Incrementa o gatilho para os membros
    setRefreshTrigger((prev) => prev + 1);
  };
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Header
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        onAddBill={() => setIsModalOpen(true)}
        myProfile={myProfile}
        onRefresh={fetchMyProfile}
      />

      <main className="max-w-4xl mx-auto space-y-6">
        {/* Banner de Onboarding (Só aparece se o perfil estiver carregado e sem família) */}
        {!loading && !myProfile?.family_id && (
          <OnboardingBanner
            userId={user?.id}
            onRefresh={fetchMyProfile} // Atualiza o perfil após criar/entrar
          />
        )}
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard
            title="Minha Cota"
            value={meuTotal}
            loading={loading}
            icon={<CheckCircle2 className="text-emerald-600" size={20} />}
            color="bg-green-50"
          />

          <SummaryCard
            title="Cota Familiar"
            value={totalFamilia}
            loading={loading}
            icon={<Users className="text-purple-600" size={20} />}
            color="bg-green-50"
          />

          <SummaryCard
            title="Total da Casa"
            value={totalGeral}
            loading={loading}
            icon={<Wallet className="text-blue-600" size={20} />}
            color="bg-green-50"
          />
        </div>

        <BillModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          editingBill={editingBill}
          onRefresh={fetchMonthlyData}
          myUserId={myProfile?.user_id}
        />
        <BillsList
          data={data}
          loading={loading}
          onRefresh={handleRefreshAll}
          myUserId={myProfile?.user_id}
          onEdit={handleEditBill}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* Coluna da Esquerda: Gráficos e Membros (2/3 da tela no desktop) */}
          <div className="md:col-span-2 space-y-6">
            <FamilyShare data={data} totalGeral={totalGeral} />

            {/* Nova Lista de Membros */}
            {myProfile?.family_id && (
              <MembersList
                familyId={myProfile.family_id}
                currentMonth={currentMonth}
                refreshTrigger={refreshTrigger}
              />
            )}
          </div>

          {/* Coluna da Direita: Histórico de Atividades ou Atalhos (1/3) */}
          <div className="space-y-6">
            {/* Aqui você pode colocar filtros extras ou um mini calendário futuramente */}
          </div>
        </div>
      </main>
    </div>
  );
}
