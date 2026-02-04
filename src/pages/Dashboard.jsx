import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase.js";
import { format, addMonths, subMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Wallet, Users, CheckCircle2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { SummaryCard } from "../components/SummaryCard.jsx";
import { FamilyShare } from "../components/FamilyShare.jsx";
import { BillsList } from "../components/BillsList.jsx";
import { AddExpenseModal } from "../components/AddExpenseModal.jsx";
import { Header } from "../components/Header.jsx";

export function Dashboard() {
  const { user } = useAuth();
  const [myProfile, setMyProfile] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 1, 1)); // Fev 2026 (mesmo do seed)
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        name
      )
    `,
      ) // Isso faz um "Join" automático no Supabase
      .eq("user_id", user.id)
      .single();

    if (!error && profile) {
      // Ajustamos o objeto para o Header entender 'family_name'
      const profileWithFamily = {
        ...profile,
        family_name: profile.families?.name || "Membro Solo",
      };
      setMyProfile(profileWithFamily);
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

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <Header
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        myProfile={myProfile}
        onAddBill={() => setIsModalOpen(true)}
      />

      <main className="max-w-4xl mx-auto space-y-6">
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

        <AddExpenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRefresh={fetchMonthlyData}
        />
        <BillsList
          data={data}
          loading={loading}
          onRefresh={fetchMonthlyData}
          myUserId={myProfile?.user_id}
        />
        <FamilyShare data={data} totalGeral={totalGeral} />
      </main>
    </div>
  );
}
