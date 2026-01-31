"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { useAuth } from "@/contexts/AuthContext";
import { db, messaging } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getToken } from "firebase/messaging";
import { Bell, ShieldAlert } from "lucide-react";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (user && open) {
        checkSettings();
    }
  }, [user, open]);

  const checkSettings = async () => {
      if (!user) return;
      try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
              const data = userDoc.data();
              setNotificationsEnabled(!!data.notificationsEnabled);
          }
      } catch (err) {
          console.error("Failed to load settings", err);
      }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
      setLoading(true);
      setStatusMessage("");
      
      if (!user) return;

      try {
          if (enabled) {
              const permission = await Notification.requestPermission();
              if (permission === "granted") {
                  if (!messaging) {
                      setStatusMessage("Les notifications ne sont pas supportées par ce navigateur.");
                      setLoading(false);
                      return;
                  }

                  // VAPID key should be in environment variables
                  const envVapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
                  if (!envVapidKey) {
                      setStatusMessage("Clé VAPID manquante dans la configuration.");
                      console.error("Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY in .env.local");
                      setLoading(false);
                      return;
                  }

                  // Sanitization
                  const vapidKey = envVapidKey.replace(/["']/g, "").trim();

                  const token = await getToken(messaging, { 
                      vapidKey: vapidKey 
                  });

                  if (token) {
                      await setDoc(doc(db, "users", user.uid), {
                          notificationsEnabled: true,
                          fcmToken: token,
                          updatedAt: new Date()
                      }, { merge: true });
                      setNotificationsEnabled(true);
                  } else {
                      setStatusMessage("Impossible d'obtenir le jeton de notification.");
                  }
              } else {
                  setStatusMessage("Permission de notification refusée.");
                  setNotificationsEnabled(false);
              }
          } else {
              // Disable
              await updateDoc(doc(db, "users", user.uid), {
                  notificationsEnabled: false
              });
              setNotificationsEnabled(false);
          }
      } catch (error) {
          console.error("Error updating notifications", error);
          setStatusMessage("Une erreur est survenue.");
          setNotificationsEnabled(false);
      } finally {
          setLoading(false);
      }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-brand" />
                Paramètres
            </DialogTitle>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <label className="text-base font-medium text-white">Notifications</label>
                    <p className="text-sm text-zinc-400">
                        Recevoir une alerte la veille d'un paiement.
                    </p>
                </div>
                <Switch 
                    checked={notificationsEnabled}
                    onCheckedChange={handleToggleNotifications}
                    disabled={loading}
                />
            </div>
            
            {statusMessage && (
                <div className="bg-red-500/10 text-red-400 p-3 rounded-md text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    {statusMessage}
                </div>
            )}

            <div className="text-xs text-zinc-500 pt-4 border-t border-zinc-800">
                <p>Les notifications sont envoyées tous les jours à 19h si une échéance est prévue le lendemain.</p>
            </div>
        </div>

        <div className="flex justify-end">
             <Button variant="ghost" onClick={() => onOpenChange(false)}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
