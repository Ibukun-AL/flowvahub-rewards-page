import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RewardsHub } from "@/components/rewards-hub"

export default async function RewardsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return <RewardsHub user={data.user} />
}
