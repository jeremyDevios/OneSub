"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Subscription, Currency } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { useCurrency } from "@/contexts/CurrencyContext";
import { getNextPaymentDate } from "@/lib/dateUtils";
import { Calendar as CalendarIcon, CreditCard, TrendingUp, AlertCircle, Plus, Edit2, Trash2, HelpCircle, LogOut } from "lucide-react"; // Updated imports
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Select } from "@/components/ui/Select";
import { getBrandIcon } from "@/components/icons/BrandIcons"; // Updated Import
import * as LucideIcons from "lucide-react"; // Added Import
import { deleteDoc, doc } from "firebase/firestore"; // Added Import
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { EditSubscriptionDialog } from "@/components/features/EditSubscriptionDialog"; 
import { CategoryTiles } from "@/components/dashboard/CategoryTiles";
import { CalendarView } from "@/components/dashboard/CalendarView";
import { generateCategoryColorMap } from "@/lib/categoryColorUtils";

// Note: Assuming these components don't exist yet, I will create basic implementations inline or handle without Dialog if UI components are missing, 
// BUT based on context user likely has shadcn/ui. I will assume I need to handle edit/delete logic.

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { convert: convertCurrency, format: formatCurrency } = useCurrency();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [preferredCurrency, setPreferredCurrency] = useState<Currency>("EUR"); // TODO: Load from user profile
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'price' | 'category'>('date');
  
  // Edit State
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const categoryColors = generateCategoryColorMap(subscriptions, preferredCurrency, convertCurrency);
  
  // Tooltip State for Chart
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // --- Handlers ---
  const handleDelete = async (subId: string) => {
      if(confirm("Êtes-vous sûr de vouloir supprimer cet abonnement ?")) {
          try {
             await deleteDoc(doc(db, "subscriptions", subId));
          } catch(e) {
              console.error("Error deleting", e);
          }
      }
  }

  const handleEdit = (subId: string) => {
      const sub = subscriptions.find(s => s.id === subId);
      if (sub) {
          setEditingSub(sub);
          setIsEditDialogOpen(true);
      }
  }

  useEffect(() => {
    if (!user) return;

    // 1. Listen for Subscriptions
    const q = query(collection(db, "subscriptions"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs = snapshot.docs.map((doc) => {
          const data = doc.data();
          // Calculate REAL next payment date based on frequency if saved date is past
          let nextDate = data.nextPaymentDate.toDate();
          nextDate = getNextPaymentDate(nextDate, data.frequency);

          return {
            id: doc.id,
            ...data,
            nextPaymentDate: nextDate
          } as Subscription
      });
      setSubscriptions(subs);
      setLoading(false);
    });

    // 2. TODO: Fetch preferred currency from user profile in a real app, keeping it simple for now
    // In a real app we'd fetch the user doc here.

    return () => unsubscribe();
  }, [user]);


  // --- KPIs Calculation ---
  const totalMonthlyCost = subscriptions.reduce((total, sub) => {
    let monthlyPrice = sub.price;
    if (sub.frequency === 'yearly') monthlyPrice = sub.price / 12;
    if (sub.frequency === 'bimonthly') monthlyPrice = sub.price / 2;
    if (sub.frequency === 'weekly') monthlyPrice = sub.price * 4;
    
    return total + convertCurrency(monthlyPrice, sub.currency, preferredCurrency);
  }, 0);

  // --- Analysis Logic ---
  const findCheaperAlternatives = (sub: Subscription) => {
      // Mock logic: randomly suggest cheaper alternatives for high value items
      if (sub.category === 'Entertainment' && sub.price > 15) return "Envisagez une offre groupée ?";
      if (sub.price > 50) return "Coût élevé détecté. Vérifiez votre usage ?";
      return null;
  }

  // --- Sorting ---
  const sortedSubs = [...subscriptions].sort((a, b) => {
      switch (sortBy) {
        case 'date':
           return (a.nextPaymentDate as Date).getTime() - (b.nextPaymentDate as Date).getTime();
        case 'price':
           return b.price - a.price;
        case 'name':
           return a.name.localeCompare(b.name);
        case 'category':
           return a.category.localeCompare(b.category);
        default:
           return 0;
      }
  });

  // --- Chart Data ---
  const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6"];
  let pieCumulative = 0;
  const pieData = Object.entries(subscriptions.reduce((acc, sub) => {
      acc[sub.category] = (acc[sub.category] || 0) + 1;
      return acc;
  }, {} as Record<string, number>))
  .sort(([,a], [,b]) => b - a)
  .map(([name, value], index) => {
      const total = subscriptions.length || 1;
      const percent = value / total;
      const C = 2 * Math.PI * 40; // r=40
      const strokeDasharray = `${percent * C} ${C}`;
      const strokeDashoffset = -pieCumulative * C;
      pieCumulative += percent;
      return { name, value, color: CHART_COLORS[index % CHART_COLORS.length], strokeDasharray, strokeDashoffset };
  });

  // Helper for icons
  const getIconComponent = (sub: Subscription) => {
      if (sub.icon) {
          const Brand = getBrandIcon(sub.icon);
          if (Brand) return Brand;
          const Lucide = (LucideIcons as any)[sub.icon];
          if (Lucide) return Lucide;
      }
      return HelpCircle;
  };



  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  if (loading) { // Skeleton-ish loading
      return (
          <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
              <div className="h-32 bg-zinc-800 rounded-xl"></div>
              <div className="h-64 bg-zinc-800 rounded-xl"></div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8 pb-32 relative">
      <div className="absolute top-4 right-4 z-50">
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-zinc-400 hover:text-white" title="Se déconnecter">
            <LogOut className="h-5 w-5" />
        </Button>
      </div>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Removed */}

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-card text-white border-border shadow-xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-zinc-400 font-medium text-sm uppercase tracking-wider">Coût Mensuel Total</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-brand">{formatCurrency(totalMonthlyCost, preferredCurrency)}</div>
                </CardContent>
                <CardFooter className="text-zinc-500 text-sm">
                    Est. {formatCurrency(totalMonthlyCost * 12, preferredCurrency)} / an
                </CardFooter>
            </Card>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-zinc-400 font-medium text-sm uppercase tracking-wider">Prochain Paiement</CardTitle>
                </CardHeader>
                <CardContent>
                     <div className="text-2xl font-bold text-white truncate">
                        {sortedSubs.length > 0 ? sortedSubs[0].name : "Aucun"}
                     </div>
                </CardContent>
                <CardFooter className="text-zinc-400 text-sm flex items-center">
                    {sortedSubs.length > 0 && (
                        <>
                            <CalendarIcon className="mr-2 h-3 w-3 text-brand" />
                            {format(sortedSubs[0].nextPaymentDate as Date, 'd MMM', { locale: fr })} • {formatCurrency(sortedSubs[0].price, sortedSubs[0].currency)}
                        </>
                    )}
                </CardFooter>
            </Card>
            
            <Card className="relative overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-zinc-400 font-medium text-sm uppercase tracking-wider">Répartition</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                     <CategoryTiles subscriptions={subscriptions} preferredCurrency={preferredCurrency} />
                </CardContent>
            </Card>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-4 border-b border-border pb-2">
             <button 
                onClick={() => setViewMode('calendar')}
                className={`text-sm font-medium pb-2 -mb-2.5 border-b-2 transition-colors ${viewMode === 'calendar' ? 'border-brand text-brand' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
             >
                Calendrier
             </button>
             <button 
                onClick={() => setViewMode('list')}
                className={`text-sm font-medium pb-2 -mb-2.5 border-b-2 transition-colors ${viewMode === 'list' ? 'border-brand text-brand' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
             >
                Liste
             </button>
        </div>


        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Subscription List/Calendar */}
            <div className="lg:col-span-2 space-y-4">
                {viewMode === 'list' ? (
                     <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-900 text-zinc-400">
                                <tr>
                                    <th className="px-6 py-4 font-medium cursor-pointer hover:text-white" onClick={() => setSortBy('name')}>
                                        Abonnement
                                    </th>
                                    <th className="px-6 py-4 font-medium cursor-pointer hover:text-white" onClick={() => setSortBy('price')}>
                                        Coût
                                    </th>
                                    <th className="px-6 py-4 font-medium cursor-pointer hover:text-white" onClick={() => setSortBy('date')}>
                                        Prochaine Échéance
                                    </th>
                                    <th className="px-6 py-4 font-medium hidden sm:table-cell cursor-pointer hover:text-white" onClick={() => setSortBy('category')}>
                                        Catégorie
                                    </th>
                                    <th className="px-2 sm:px-6 py-4 font-medium text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {sortedSubs.map((sub) => {
                                    const daysLeft = differenceInDays(sub.nextPaymentDate as Date, new Date());
                                    const isUrgent = daysLeft <= 3 && daysLeft >= 0;
                                    const Icon = getIconComponent(sub);

                                    const freqLabels: Record<string, string> = {
                                        weekly: 'Hebdo', monthly: 'Mensuel', bimonthly: 'Bimensuel', yearly: 'Annuel'
                                    };
                                    const freqSuffix: Record<string, string> = {
                                        weekly: 'sem', monthly: 'mois', bimonthly: '2 mois', yearly: 'an'
                                    };
                                    
                                    const categoryColor = categoryColors[sub.category] || '#71717a'; // zinc-500 default

                                    return (
                                    <tr key={sub.id} className="group hover:bg-zinc-800/50 transition-colors cursor-pointer" onClick={() => sub.id && handleEdit(sub.id)}>
                                        <td className="px-6 py-4 font-medium text-white group-hover:text-brand flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0" style={{ backgroundColor: sub.color || '#333' }}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            {sub.name}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-300">
                                            {formatCurrency(sub.price, sub.currency)} <span className="text-xs text-zinc-500">/ {freqSuffix[sub.frequency] || sub.frequency}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className={isUrgent ? 'text-brand font-medium' : 'text-zinc-400'}>
                                                    {format(sub.nextPaymentDate as Date, 'd MMM yyyy', { locale: fr })}
                                                </span>
                                                <span className="text-xs text-zinc-600">
                                                    {freqLabels[sub.frequency] || sub.frequency}
                                                </span>
                                            </div>
                                        </td>
                                         <td className="px-6 py-4 hidden sm:table-cell">
                                            <span 
                                                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                                                style={{ 
                                                    backgroundColor: `${categoryColor}25`, 
                                                    color: categoryColor,
                                                    border: `1px solid ${categoryColor}40`
                                                }}
                                            >
                                                {sub.category}
                                            </span>
                                        </td>
                                         <td className="px-2 sm:px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-1 sm:gap-2">
                                                {/* Edit Button - could trigger modal */}
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Éditer" onClick={() => sub.id && handleEdit(sub.id)}> 
                                                    <Edit2 className="h-4 w-4 text-zinc-400 hover:text-white" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Supprimer" onClick={() => sub.id && handleDelete(sub.id)}>
                                                    <Trash2 className="h-4 w-4 text-red-500 hover:text-red-400" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )})}

                                {sortedSubs.length === 0 && (
                                     <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                            Aucun abonnement trouvé. <Link href="/onboarding" className="text-brand underline">Ajoutez-en un</Link>
                                        </td>
                                     </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <CalendarView subscriptions={subscriptions} />
                    </div>
                )}
            </div>

            {/* Right Col: Contract Analysis & Recommendations */}
            <div className="space-y-6">
                 <h3 className="text-lg font-semibold text-white px-1">Analyses & Suggestions</h3>
                 {subscriptions.map((sub) => {
                     const tip = findCheaperAlternatives(sub);
                     if (!tip) return null;

                     return (
                        <Card key={sub.id + '-insight'} className="border-l-4 border-l-yellow-400">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2 text-yellow-600 font-medium text-sm">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>Opportunité d'Économie</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-white font-medium">{sub.name}</p>
                                <p className="text-sm text-zinc-300 mt-1">{tip}</p>
                            </CardContent>
                            <CardFooter>
                                <Button variant="ghost" size="sm" className="w-full text-brand">Revoir le Contrat</Button>
                            </CardFooter>
                        </Card>
                     )
                 })}

                  <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-emerald-400" />
                                <span>Tendance des Dépenses</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-zinc-300">
                            Vos dépenses projetées sont stables ce mois-ci. Bravo !
                        </CardContent>
                  </Card>
            </div>
        </div>
      </div>
      
      <EditSubscriptionDialog 
        subscription={editingSub} 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
      />

       {/* Floating Action Button */}
       <Link href="/onboarding?mode=add" className="fixed bottom-6 right-6 z-50">
            <Button className="rounded-full w-14 h-14 p-0 shadow-xl bg-brand hover:bg-orange-600 border-none transition-transform hover:scale-110 flex items-center justify-center">
                <Plus className="w-8 h-8 text-white" />
            </Button>
       </Link>
    </div>
  );
}
