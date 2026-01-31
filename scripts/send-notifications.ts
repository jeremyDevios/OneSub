import * as admin from 'firebase-admin';
import { differenceInDays, startOfDay, addDays, isSameDay } from 'date-fns';

// Initialize Firebase Admin
// Requires GOOGLE_APPLICATION_CREDENTIALS environment variable or explicit service account
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });
}

const db = admin.firestore();
const messaging = admin.messaging();

async function sendNotifications() {
    console.log("Starting notification check...");
    
    // Target date: Tomorrow
    const tomorrow = addDays(startOfDay(new Date()), 1);
    console.log(`Checking for subscriptions due on: ${tomorrow.toISOString()}`);

    try {
        // 1. Get users with notifications enabled
        const usersSnapshot = await db.collection('users').where('notificationsEnabled', '==', true).get();
        
        if (usersSnapshot.empty) {
            console.log("No users with notifications enabled.");
            return;
        }

        let notificationCount = 0;

        // 2. For each user, check subscriptions
        for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();
            const fcmToken = userData.fcmToken;

            if (!fcmToken) continue;

            // Get subscriptions for this user
            const subsSnapshot = await db.collection('subscriptions')
                                         .where('userId', '==', userDoc.id)
                                         .where('status', '==', 'active') // Assuming status field exists
                                         .get();

            if (subsSnapshot.empty) continue;

            for (const subDoc of subsSnapshot.docs) {
                const sub = subDoc.data();
                const nextPaymentDate = sub.nextPaymentDate.toDate(); // Timestamp to Date

                // Logic: Is payment tomorrow?
                // Note: This logic assumes 'nextPaymentDate' is accurate.
                // For 'monthly' etc, we rely on the nextPaymentDate field being updated. 
                // If your app updates it *after* payment, this works.
                
                if (isSameDay(nextPaymentDate, tomorrow)) {
                    console.log(`Sending notification to user ${userDoc.id} for ${sub.name}`);
                    
                    const message = {
                        notification: {
                            title: `Paiement demain : ${sub.name}`,
                            body: `Montant : ${sub.price} ${sub.currency || 'EUR'}. Prélèvement prévu le ${nextPaymentDate.toLocaleDateString('fr-FR')}.`
                        },
                        token: fcmToken
                    };

                    try {
                        await messaging.send(message);
                        notificationCount++;
                    } catch (e) {
                        console.error(`Failed to send to user ${userDoc.id}`, e);
                        // Optional: If error is "invalid-registration-token", remove token from DB.
                    }
                }
            }
        }

        console.log(`Sent ${notificationCount} notifications.`);

    } catch (error) {
        console.error("Error in notification script:", error);
    }
}

sendNotifications();
