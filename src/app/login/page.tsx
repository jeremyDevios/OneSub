"use client";

import { useState, useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);


  const handleUserSetup = async (user: any) => {
      // Check if user profile exists, if not create it
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
          // If new user, create profile and redirect to onboarding
           await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              preferredCurrency: 'EUR', // Default
              createdAt: new Date()
          });
          router.push("/onboarding");
      } else {
          router.push("/dashboard");
      }
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleUserSetup(result.user);
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        if (isRegistering) {
            const result = await createUserWithEmailAndPassword(auth, email, password);
             await handleUserSetup(result.user);
        } else {
             // For login, we just check auth, but user doc should ideally exist.
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/dashboard");
        }
    } catch (error) {
        console.error("Auth error", error);
        alert("Échec de l'authentification. Veuillez vérifier vos identifiants.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-card p-8 border border-border rounded-xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
            {isRegistering ? "Créer un compte" : "Connexion à OneSub"}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Gérez vos abonnements efficacement.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleEmailAuth}>
          <div className="space-y-4">
            <div>
              <input
                type="email"
                required
                className="relative block w-full rounded-md border border-input bg-zinc-900 py-2.5 px-3 text-white placeholder:text-zinc-500 focus:z-10 focus:ring-2 focus:ring-brand focus:border-brand sm:text-sm sm:leading-6"
                placeholder="Adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="relative block w-full rounded-md border border-input bg-zinc-900 py-2.5 px-3 text-white placeholder:text-zinc-500 focus:z-10 focus:ring-2 focus:ring-brand focus:border-brand sm:text-sm sm:leading-6"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-brand px-3 py-2 text-sm font-semibold text-black hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-70"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRegistering ? "S'inscrire" : "Se connecter"}
            </button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-card px-2 text-zinc-500">Ou continuer avec</span>
          </div>
        </div>

        <div>
            <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent"
            >
             <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
        </div>

        <div className="text-center text-sm">
            <button 
                className="text-brand hover:text-orange-400 font-semibold"
                onClick={() => setIsRegistering(!isRegistering)}
            >
                {isRegistering ? "Déjà un compte ? Se connecter" : "Pas de compte ? S'inscrire"}
            </button>
        </div>

      </div>
    </div>
  );
}
