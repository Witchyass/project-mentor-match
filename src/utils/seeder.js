import { db } from '../lib/firebase';
import { ref, push, set } from 'firebase/database';
import { MOCK_USERS } from './mockData';

/**
 * Seeds the /users node in Realtime Database with a diverse set of mock users.
 * This is intended for development and testing of matching features.
 */
export const seedUsers = async () => {
    const usersRef = ref(db, 'users');
    let successCount = 0;
    let errorCount = 0;

    console.log(`Starting to seed ${MOCK_USERS.length} users...`);

    for (const userProfile of MOCK_USERS) {
        try {
            // Create a new unique ID for each mock user
            const newUserRef = push(usersRef);

            // Add a timestamp and profile image placeholder if missing
            const finalProfile = {
                ...userProfile,
                id: newUserRef.key,
                profileImage: userProfile.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.name}`,
                createdAt: new Date().toISOString(),
                onboarded: true
            };

            await set(newUserRef, finalProfile);
            successCount++;
        } catch (error) {
            console.error(`Failed to seed user ${userProfile.name}:`, error);
            errorCount++;
        }
    }

    console.log(`Seeding complete. Success: ${successCount}, Errors: ${errorCount}`);
    return { successCount, errorCount };
};
