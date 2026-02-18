import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import LoginButton from "@/components/LoginButton";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-[#060610] flex flex-col items-center justify-center px-4 relative overflow-hidden">

      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        <div className="glow-top absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[520px]" />
        <div className="glow-bottom-right absolute bottom-0 right-0 w-[600px] h-[500px]" />
        <div className="bg-grid absolute inset-0 opacity-[0.025]" />
      </div>
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full gap-8">

        <div className="flex flex-col items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-6xl font-black tracking-tight text-white">
              Smart<span className="text-indigo-400">Mark</span>
            </h1>
            <p className="text-[#6b6b90] text-sm leading-relaxed">
              Save links. Access anywhere. Synced in real-time.
            </p>
          </div>
        </div>
        <div className="w-full space-y-3">
          <LoginButton />
          <p className="text-[11px] text-[#32324a] tracking-wide">
            No account needed · Sign in with Google · Free forever
          </p>
        </div>
      </div>
    </main>
  );
}