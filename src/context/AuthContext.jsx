import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ref, get, child, update, onValue } from 'firebase/database';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let profileUnsubscribe = null;

        const authUnsubscribe = onAuthStateChanged(auth, async (authUser) => {
            console.log("Auth State Changed: ", authUser?.email);
            setUser(authUser);

            // Clear previous profile listener if any
            if (profileUnsubscribe) {
                profileUnsubscribe();
                profileUnsubscribe = null;
            }

            if (authUser) {
                setLoading(true);
                const profileRef = ref(db, `users/${authUser.uid}`);

                profileUnsubscribe = onValue(profileRef, async (snapshot) => {
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        console.log("Profile updated/found:", data.name);

                        // SELF-HEALING: Repair profile if missing key fields (without causing loop)
                        if (!data.email || !data.id) {
                            console.log("🛠️ Repairing profile fields...");
                            const updates = {};
                            if (!data.email) updates.email = authUser.email;
                            if (!data.id) updates.id = authUser.uid;
                            await update(profileRef, updates);
                            // No need to setProfile here, onValue will trigger again
                        } else {
                            setProfile(data);
                            setLoading(false);
                        }
                    } else {
                        console.log("No profile record found for:", authUser.email);
                        setProfile(null);
                        setLoading(false);
                    }
                }, (error) => {
                    console.error("Profile listener error:", error);
                    setLoading(false);
                });
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => {
            authUnsubscribe();
            if (profileUnsubscribe) profileUnsubscribe();
        };
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
            // States will be cleared by onAuthStateChanged listener
        } catch (error) {
            console.error("Logout error:", error);
            throw error;
        }
    };

    const value = {
        user,
        profile,
        loading,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
