"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle } from "lucide-react";
import { BackgroundLogos } from "@/components/landing/BackgroundLogos";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen flex-col bg-black items-center justify-center">
         <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-brand"></div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-black text-white overflow-hidden">
      <BackgroundLogos />
      
      {/* Navbar Simple */}
      <header className="relative z-10 flex h-20 items-center justify-between px-6 md:px-12 border-b border-white/10">
        <div className="flex items-center gap-2">
           <Image 
             src="/logo.png" 
             alt="OneSub Logo" 
             width={32} 
             height={32} 
             className="h-8 w-8 rounded-lg"
           />
           <span className="text-xl font-bold tracking-tight">OneSub</span>
        </div>
        <Link 
          href="/login"  className="text-sm font-medium text-zinc-400 hover:text-brand transition-colors"
        >
          Connexion
        </Link>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center py-20">
        <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-zinc-400 mb-8 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-brand mr-2 animate-pulse"></span>
          Gérez vos dépenses intelligemment
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl mb-6 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent">
          Prenez le contrôle de <br className="hidden md:block" />
          vos abonnements.
        </h1>
        
        <p className="max-w-xl text-lg text-zinc-400 mb-10 leading-relaxed">
          Arrêtez de payer pour ce que vous n'utilisez pas. Suivez, analysez et optimisez vos dépenses récurrentes en un seul endroit. Simple, sécurisé, efficace.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link href="/login">
            <button className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-brand px-8 font-medium text-black transition-all duration-300 hover:w-56 hover:bg-orange-500 hover:shadow-[0_0_40px_8px_rgba(255,159,10,0.3)]">
              <span className="mr-2">Démarrer</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
        </div>

        {/* Features preview (Optional, helps visual filling) */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl w-full">
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
             <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center mb-4 text-brand">
                 <CheckCircle className="h-5 w-5" />
             </div>
             <h3 className="font-semibold text-xl mb-2">Centralisation</h3>
             <p className="text-zinc-500 leading-relaxed">Retrouvez Netflix, Spotify, et tous vos services au même endroit.</p>
            </div>
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
             <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center mb-4 text-brand">
                 <CheckCircle className="h-5 w-5" />
             </div>
             <h3 className="font-semibold text-xl mb-2">Alertes Intelligentes</h3>
             <p className="text-zinc-500 leading-relaxed">Recevez une notification avant chaque prélèvement important.</p>
            </div>
             <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5 backdrop-blur-sm">
             <div className="h-10 w-10 rounded-full bg-brand/10 flex items-center justify-center mb-4 text-brand">
                 <CheckCircle className="h-5 w-5" />
             </div>
             <h3 className="font-semibold text-xl mb-2">Économies</h3>
             <p className="text-zinc-500 leading-relaxed">Identifiez les abonnements oubliés et économisez chaque mois.</p>
            </div>
        </div>

      </main>
    </div>
  );
}
