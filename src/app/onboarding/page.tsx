"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Currency, Frequency } from "@/types";
import { Check, Plus, Palette, Search, X } from "lucide-react";
import { SERVICES_DB, KnownService, CATEGORIES } from "@/data/services";
import * as LucideIcons from "lucide-react";
import { getBrandIcon } from "@/components/icons/BrandIcons";
import { COLORS, AVAILABLE_ICONS } from "@/data/constants";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAddMode = searchParams.get("mode") === "add";

  const [loading, setLoading] = useState(false);

  // New Subscription Form
  const [subName, setSubName] = useState("");
  const [subPrice, setSubPrice] = useState("");
  const [subCurrency, setSubCurrency] = useState<Currency>("EUR");
  const [subFrequency, setSubFrequency] = useState<Frequency>("monthly");
  const [subDate, setSubDate] = useState("");
  const [subCategory, setSubCategory] = useState("Divertissement");
  
  // Customization
  const [subColor, setSubColor] = useState("#FF9F0A");
  const [subIcon, setSubIcon] = useState("Tv");
  
  // Auto-complete state
  const [suggestions, setSuggestions] = useState<KnownService[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [subscriptionCount, setSubscriptionCount] = useState(0);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSubName(value);

      if (value.length > 1) {
          const matches = Object.values(SERVICES_DB).filter(s => 
              s.name.toLowerCase().includes(value.toLowerCase())
          );
          setSuggestions(matches);
          setShowSuggestions(true);
      } else {
          setShowSuggestions(false);
      }
  };

  const selectService = (service: KnownService) => {
      setSubName(service.name);
      setSubCategory(service.category);
      setSubColor(service.color);
      if (service.icon) setSubIcon(service.icon);
      setShowSuggestions(false);
  };

  const saveSubscription = async (addAnother: boolean = false) => {
    if (!user) return;
    setLoading(true);
    try {
        if (subName && subPrice && subDate) {
            await addDoc(collection(db, "subscriptions"), {
                userId: user.uid,
                name: subName,
                price: parseFloat(subPrice),
                currency: subCurrency,
                frequency: subFrequency,
                nextPaymentDate: Timestamp.fromDate(new Date(subDate)),
                category: subCategory,
                status: 'active',
                createdAt: Timestamp.now(),
                color: subColor,
                icon: subIcon
            });
        }
      
      if (addAnother) {
        setSubName("");
        setSubPrice("");
        setSubDate("");
        setSubColor("#FF9F0A");
        setSubscriptionCount(prev => prev + 1);
        // Keep currency/category as they might be similar
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error saving subscription:", error);
      setLoading(false);
    }
  };

  if (!user) return null; // Or loading state

  // Dynamic Icon Component Helper
  const getIconComponent = (iconName: string) => {
      const Brand = getBrandIcon(iconName);
      if (Brand) return Brand;
      return (LucideIcons as any)[iconName] || LucideIcons.HelpCircle;
  }
  
  const SelectedIcon = getIconComponent(subIcon);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl shadow-black/50 border-border bg-card text-white overflow-visible">
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-white">
                   {(isAddMode || subscriptionCount > 0) ? "Ajoutez votre abonnement" : "Ajoutez votre premier abonnement"}
                </CardTitle>
                <div className="flex items-center gap-3">
                     {subIcon && (
                        <div className="h-12 w-12 rounded-xl flex items-center justify-center shadow-lg transition-colors border border-white/5" style={{ backgroundColor: subColor }}>
                            <SelectedIcon className="h-6 w-6 text-white" />
                        </div>
                    )}
                    {(isAddMode || subscriptionCount > 0) && (
                        <button 
                            onClick={() => router.push('/dashboard')}
                            className="text-zinc-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                            title="Fermer"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    )}
                </div>
            </div>
            <p className="text-zinc-400 mt-2">Suivez l'une de vos dépenses récurrentes.</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="relative z-50">
                <label className="block text-sm font-medium text-zinc-300 mb-1">Nom du service</label>
                <div className="relative">
                    <Input 
                        placeholder="ex: Netflix, Spotify" 
                        value={subName}
                        onChange={handleNameChange}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        onFocus={() => subName.length > 1 && setShowSuggestions(true)}
                        className="pl-10"
                    />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                </div>
                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg max-h-60 overflow-auto z-50">
                        {suggestions.map((s) => (
                            <button
                                key={s.name}
                                className="w-full text-left px-4 py-2 hover:bg-zinc-800 flex items-center gap-3 transition-colors"
                                onClick={() => selectService(s)}
                            >
                                <div className="w-6 h-6 rounded-full flex items-center justify-center p-1" style={{ backgroundColor: s.color }}>
                                     {/* Simple preview dot */}
                                </div>
                                <span>{s.name}</span>
                            </button>
                        ))}
                    </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Prix & Devise</label>
                    <div className="flex gap-2">
                        <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00"
                            className="flex-1"
                            value={subPrice}
                            onChange={(e) => setSubPrice(e.target.value)}
                        />
                         <Select
                            value={subCurrency}
                            onChange={(e) => setSubCurrency(e.target.value as Currency)}
                            className="w-20 min-w-[5rem]"
                        >
                            <option value="EUR">€</option>
                            <option value="USD">$</option>
                            <option value="JPY">¥</option>
                            <option value="CHF">Fr</option>
                        </Select>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Fréquence</label>
                     <Select
                        value={subFrequency}
                        onChange={(e) => setSubFrequency(e.target.value as Frequency)}
                    >
                        <option value="weekly">Hebdomadaire</option>
                        <option value="monthly">Mensuel</option>
                        <option value="bimonthly">Bimensuel</option>
                        <option value="yearly">Annuel</option>
                    </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1">Prochain paiement</label>
                    <Input 
                        type="date" 
                        value={subDate}
                        onChange={(e) => setSubDate(e.target.value)}
                    />
                </div>
                <div>
                     <label className="block text-sm font-medium text-zinc-300 mb-1">Catégorie</label>
                     <Select
                        value={subCategory}
                        onChange={(e) => setSubCategory(e.target.value)}
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </Select>
                </div>
              </div>

              {/* Customization Section */}
              <div className="border-t border-zinc-800 pt-4 mt-2">
                  <label className="block text-sm font-medium text-zinc-300 mb-3">Personnalisation</label>
                  <div className="flex flex-wrap gap-4 items-start">
                      
                      {/* Color Picker */}
                      <div className="space-y-2">
                          <span className="text-xs text-zinc-500 block">Couleur</span>
                          <div className="flex flex-wrap gap-2 max-w-[200px]">
                            {COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSubColor(color)}
                                    className={`w-6 h-6 rounded-full border border-black/20 ${subColor === color ? 'ring-2 ring-white scale-110' : 'hover:scale-110'} transition-all`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                          </div>
                      </div>

                      {/* Icon Picker */}
                      <div className="space-y-2 flex-1">
                          <span className="text-xs text-zinc-500 block">Icône</span>
                          <div className="grid grid-cols-6 gap-2">
                             {/* Show current Brand icon if selected but not in standard list */}
                             {getBrandIcon(subIcon) && (
                                 <button
                                    type="button"
                                    onClick={() => {}} // Keep selected
                                    className="p-2 rounded-md flex items-center justify-center bg-zinc-700 text-white ring-1 ring-zinc-500"
                                    title="Logo Officiel"
                                 >
                                     <SelectedIcon className="w-4 h-4" />
                                 </button>
                             )}

                             {AVAILABLE_ICONS.map(iconName => {
                                 const IconComp = (LucideIcons as any)[iconName];
                                 return (
                                     <button
                                        key={iconName}
                                        type="button"
                                        onClick={() => setSubIcon(iconName)}
                                        className={`p-2 rounded-md flex items-center justify-center transition-all ${subIcon === iconName ? 'bg-zinc-700 text-white ring-1 ring-zinc-500' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                                     >
                                         <IconComp className="w-4 h-4" />
                                     </button>
                                 )
                             })}
                          </div>
                      </div>
                  </div>
              </div>

            </div>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-zinc-800 p-6 bg-zinc-900/30 rounded-b-xl gap-3">
             <Button variant="outline" className="flex-1" onClick={() => saveSubscription(true)} isLoading={loading}>
                <Plus className="mr-2 h-4 w-4" /> Ajouter un autre
            </Button>
            <Button className="flex-1" onClick={() => saveSubscription(false)} isLoading={loading}>
                Terminer <Check className="ml-2 h-4 w-4" />
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
