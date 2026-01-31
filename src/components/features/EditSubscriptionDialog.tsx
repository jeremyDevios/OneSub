"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/Dialog";
import { Subscription, Currency, Frequency } from "@/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { CATEGORIES } from "@/data/services";
import { COLORS, AVAILABLE_ICONS } from "@/data/constants";
import * as LucideIcons from "lucide-react";
import { getBrandIcon } from "@/components/icons/BrandIcons";

interface EditSubscriptionDialogProps {
  subscription: Subscription | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (id: string) => void;
}

export function EditSubscriptionDialog({ subscription, open, onOpenChange, onDelete }: EditSubscriptionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Subscription>>({});

  useEffect(() => {
    if (subscription) {
      setFormData({
        name: subscription.name,
        price: subscription.price,
        currency: subscription.currency,
        frequency: subscription.frequency,
        nextPaymentDate: subscription.nextPaymentDate,
        category: subscription.category,
        color: subscription.color,
        icon: subscription.icon,
        comments: subscription.comments || ''
      });
    }
  }, [subscription]);

  const handleSave = async () => {
    if (!subscription || !formData.name || !formData.price || !formData.nextPaymentDate) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, "subscriptions", subscription.id), {
        ...formData,
        price: Number(formData.price),
        nextPaymentDate: new Date(formData.nextPaymentDate as any) 
      });
      onOpenChange(false);
    } catch (e) {
      console.error("Update failed", e);
    } finally {
      setLoading(false);
    }
  };
  
  // Format Date for Input
  const dateValue = formData.nextPaymentDate 
    ? (formData.nextPaymentDate instanceof Date 
        ? formData.nextPaymentDate.toISOString().split('T')[0] 
        : typeof formData.nextPaymentDate === 'string' ? formData.nextPaymentDate : '') 
    : '';

  // Icon Helper for Preview
  const BrandIcon = formData.icon ? getBrandIcon(formData.icon) : null;
  const LucideIcon = formData.icon ? (LucideIcons as any)[formData.icon] : null;
  const SelectedIcon = BrandIcon || LucideIcon || LucideIcons.HelpCircle;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-900 text-white border-zinc-800 max-h-[90vh] overflow-y-auto">
        <div className="grid gap-4 py-4">
           <h2 className="text-xl font-bold flex items-center gap-3">
              <div 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${formData.color?.toLowerCase() === '#ffffff' ? 'text-black' : 'text-white'}`}
                  style={{ backgroundColor: formData.color || '#333' }}
              >
                 <SelectedIcon className="h-5 w-5" />
              </div>
              Éditer {subscription?.name}
           </h2>
           
           {/* Name & Category */}
           <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Nom</label>
                    <Input 
                        value={formData.name || ''} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Catégorie</label>
                    <Select
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </Select>
                </div>
           </div>

           {/* Price & Currency & Frequency */}
           <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-1">
                 <label className="text-sm font-medium text-zinc-400">Prix</label>
                 <Input 
                    type="number"
                    inputMode="decimal"
                    value={formData.price || ''} 
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                 />
              </div>
              <div className="space-y-2 col-span-1">
                 <label className="text-sm font-medium text-zinc-400">Devise</label>
                 <Select 
                    value={formData.currency} 
                    onChange={e => setFormData({...formData, currency: e.target.value as Currency})}
                 >
                     <option value="EUR">€ (EUR)</option>
                     <option value="USD">$ (USD)</option>
                     <option value="JPY">¥ (JPY)</option>
                     <option value="CHF">Fr (CHF)</option>
                 </Select>
              </div>
               <div className="space-y-2 col-span-1">
                 <label className="text-sm font-medium text-zinc-400">Fréquence</label>
                 <Select 
                    value={formData.frequency} 
                    onChange={e => setFormData({...formData, frequency: e.target.value as Frequency})}
                 >
                     <option value="monthly">Mensuel</option>
                     <option value="bimonthly">Bimensuel</option>
                     <option value="yearly">Annuel</option>
                     <option value="weekly">Hebdomadaire</option>
                 </Select>
              </div>
           </div>
           
           <div className="space-y-2">
                 <label className="text-sm font-medium text-zinc-400">Prochaine date</label>
                 <Input 
                    type="date"
                    value={dateValue}
                    onChange={e => setFormData({...formData, nextPaymentDate: new Date(e.target.value)})}
                 />
           </div>

           <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-400">Commentaires</label>
                <Textarea 
                    value={formData.comments || ''}
                    onChange={e => setFormData({...formData, comments: e.target.value})}
                    placeholder="Notes..."
                />
           </div>

           {/* Customization Section */}
           <div className="border-t border-zinc-800 pt-4 mt-2">
              <label className="block text-sm font-medium text-zinc-300 mb-3">Apparence</label>
              
              {/* Colors */}
              <div className="mb-4">
                  <span className="text-xs text-zinc-500 block mb-2">Couleur</span>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(color => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => setFormData({...formData, color})}
                            className={`w-6 h-6 rounded-full border border-black/20 ${formData.color === color ? 'ring-2 ring-white scale-110' : 'hover:scale-110'} transition-all`}
                            style={{ backgroundColor: color }}
                        />
                    ))}
                  </div>
              </div>

              {/* Icons */}
              <div>
                  <span className="text-xs text-zinc-500 block mb-2">Icône</span>
                  <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto p-1">
                        {/* Current/Brand Icon if set */}
                        {formData.icon && getBrandIcon(formData.icon) && (
                             <button
                                type="button"
                                onClick={() => {}} 
                                className="p-1.5 rounded-md flex items-center justify-center bg-zinc-700 text-white ring-1 ring-zinc-500"
                                title="Logo Officiel"
                             >
                                 <SelectedIcon className="w-4 h-4" />
                             </button>
                        )}
                        
                        {AVAILABLE_ICONS.map(iconName => {
                            const IconComp = (LucideIcons as any)[iconName];
                            const isSelected = formData.icon === iconName;
                            return (
                                <button
                                key={iconName}
                                type="button"
                                onClick={() => setFormData({...formData, icon: iconName})}
                                className={`p-1.5 rounded-md flex items-center justify-center transition-all ${isSelected ? 'bg-zinc-700 text-white ring-1 ring-zinc-500' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                                >
                                    <IconComp className="w-4 h-4" />
                                </button>
                            )
                        })}
                  </div>
              </div>
           </div>

           <div className="flex justify-between gap-3 mt-4">
              {onDelete && subscription?.id && (
                  <Button 
                    variant="ghost" 
                    className="text-red-500 hover:text-white hover:bg-red-600"
                    onClick={() => onDelete(subscription.id!)}
                  >
                    Supprimer
                  </Button>
              )}
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>Annuler</Button>
                <Button onClick={handleSave} isLoading={loading}>Enregistrer</Button>
              </div>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
