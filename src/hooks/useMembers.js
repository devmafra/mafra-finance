import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useMembers() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    async function getMembers() {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, family_id");
      if (data) setMembers(data);
    }
    getMembers();
  }, []);

  return members;
}
