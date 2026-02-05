import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { parseISO, isPast, isToday } from "date-fns";
import {
  User,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";

export function MembersList({ familyId, currentMonth }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (familyId) fetchMembers();
  }, [familyId, currentMonth]);

  async function fetchMembers() {
    try {
      // 1. Busca os membros da família
      const { data: profiles, error: pError } = await supabase
        .from("profiles")
        .select("*")
        .eq("family_id", familyId);

      if (pError) throw pError;

      // 2. Busca o status de pagamento de cada um no mês atual
      // Usamos a view que já tem o RLS configurado
      const { data: shares, error: sError } = await supabase
        .from("vw_member_shares")
        .select("profile_id, is_paid, due_date")
        .eq("billing_month", `${currentMonth.toISOString().slice(0, 7)}-01`);
      if (sError) throw sError;

      // 3. Cruza os dados: Membro + Status de Pendência
      const membersWithStatus = profiles.map((member) => {
        const memberShares = shares.filter((s) => s.profile_id === member.id);
        const hasBills = memberShares.length > 0;

        const hasOverdue = memberShares.some((s) => {
          const dueDate = parseISO(s.due_date);
          return !s.is_paid && isPast(dueDate) && !isToday(dueDate);
        });

        const hasPending = memberShares.some((s) => !s.is_paid);

        let status = "paid";
        if (!hasBills) status = "no_bills";
        else if (hasOverdue)
          status = "overdue"; // Atrasado (Vermelho)
        else if (hasPending) status = "pending"; // Pendente (Amarelo)

        return { ...member, status };
      });

      setMembers(membersWithStatus);
    } catch (err) {
      console.error("Erro ao carregar membros:", err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return <div className="h-20 animate-pulse bg-slate-100 rounded-xl" />;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
          <User size={18} className="text-green-600" />
          Membros da Família
        </h3>
        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-bold uppercase">
          {members.length} {members.length === 1 ? "Membro" : "Membros"}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm uppercase group-hover:border-green-200 transition-all">
                {member.full_name?.charAt(0)}
              </div>

              <div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-slate-700">
                    {member.full_name}
                  </span>
                  {member.role === "admin" && (
                    <ShieldCheck
                      size={12}
                      className="text-amber-500"
                      title="Administrador"
                    />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium">
                  {member.user_id ? "Conta Ativa" : "Aguardando Vínculo"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {member.status === "paid" && (
                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-[9px] font-black uppercase">
                  <CheckCircle2 size={12} /> Em dia
                </div>
              )}

              {/* STATUS PENDENTE (Ainda não venceu) */}
              {member.status === "pending" && (
                <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-lg text-[9px] font-black uppercase">
                  <Clock size={12} /> Aberta
                </div>
              )}

              {/* STATUS ATRASADO (Vencido) */}
              {member.status === "overdue" && (
                <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-lg text-[9px] font-black uppercase animate-pulse">
                  <AlertTriangle size={12} /> Atrasado
                </div>
              )}

              {member.status === "no_bills" && (
                <div className="flex items-center gap-1 text-slate-400 bg-slate-50 px-2 py-1 rounded-lg text-[9px] font-black uppercase">
                  <Clock size={12} /> Sem contas
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
