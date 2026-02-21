import { initializeApp, deleteApp, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db } from '../lib/firebase';
import { ref, set } from 'firebase/database';
import { MOCK_USERS } from './mockData';
import { firebaseConfig } from '../lib/firebase';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Seeds both Firebase Auth and Realtime Database with authentic mock accounts.
 * Uses a secondary Firebase app to avoid disrupting the current developer's session.
 */
export const seedAuthAccounts = async (onProgress) => {
    // 1. Initialize a secondary app for background account creation
    const secondaryAppName = "AccountSeederApp";
    let secondaryApp;

    try {
        secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    } catch (e) {
        secondaryApp = getApp(secondaryAppName);
    }

    const secondaryAuth = getAuth(secondaryApp);
    const results = { success: 0, errors: 0, details: [] };

    console.log(`Starting Auth seeding for ${MOCK_USERS.length} users...`);

    for (let i = 0; i < MOCK_USERS.length; i++) {
        const userProfile = MOCK_USERS[i];
        if (onProgress) onProgress(i + 1, MOCK_USERS.length, userProfile.name);

        let uid = null;
        let action = 'created';

        try {
            try {
                // A. Try to Create Auth Account
                const userCredential = await createUserWithEmailAndPassword(
                    secondaryAuth,
                    userProfile.email,
                    userProfile.password
                );
                uid = userCredential.user.uid;
            } catch (authError) {
                // If account exists, we try to sign in to get the UID so we can sync the DB profile
                if (authError.code === 'auth/email-already-in-use') {
                    console.log(`ℹ️ Account exists for ${userProfile.email}. Fetching UID via sign-in...`);
                    const userCredential = await signInWithEmailAndPassword(
                        secondaryAuth,
                        userProfile.email,
                        userProfile.password
                    );
                    uid = userCredential.user.uid;
                    action = 'updated';
                } else {
                    throw authError;
                }
            }

            // B. Create/Update Database Profile linked to Auth UID
            if (uid) {
                const userRef = ref(db, 'users/' + uid);
                const finalProfile = {
                    ...userProfile,
                    id: uid,
                    profileImage: userProfile.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userProfile.name)}`,
                    createdAt: userProfile.createdAt || new Date().toISOString(),
                    onboarded: true
                };

                // Remove sensitive fields from RDB
                delete finalProfile.password;

                await set(userRef, finalProfile);

                // C. Sign out immediately
                await signOut(secondaryAuth);

                results.success++;
                results.details.push({ name: userProfile.name, status: 'success', action });
            }

            // D. Wait slightly to avoid Auth rate limits
            await delay(800);
        } catch (error) {
            console.error(`❌ Failed to process ${userProfile.name}:`, error.code, error.message);
            results.errors++;
            results.details.push({ name: userProfile.name, status: 'error', code: error.code, message: error.message });

            // If sign-out fails, it might be already signed out or error
            try { await signOut(secondaryAuth); } catch (err) { /* ignore */ }

            await delay(1000); // Wait longer on error
        }
    }

    // Cleanup secondary app
    await deleteApp(secondaryApp);

    console.log(`Auth seeding finished. Success: ${results.success}, Errors: ${results.errors}`);
    return results;
};
