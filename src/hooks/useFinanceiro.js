import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useFinanceiro(mesCota) {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCota = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vw_member_shares") // Nossa View inteligente!
      .select("*")
      .eq("billing_month", mesCota);

    if (!error) setDados(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCota();
  }, [mesCota]);

  return { dados, loading, refresh: fetchCota };
}
