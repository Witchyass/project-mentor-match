import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Shield, Lock, Trash2, Clock, Eye, Loader2,
    RefreshCcw, Check, AlertTriangle, EyeOff, KeyRound, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../lib/firebase';
import { ref, update, onValue, remove } from 'firebase/database';
import {
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser
} from 'firebase/auth';

// Reusable Toggle Switch
const Toggle = ({ checked, onChange, disabled }) => (
    <button
        disabled={disabled}
        onClick={onChange}
        style={{
            width: '48px', height: '26px',
            background: checked ? '#2563eb' : '#e2e8f0',
            borderRadius: '100px', border: 'none',
            position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer',
            transition: '0.3s', opacity: disabled ? 0.6 : 1, flexShrink: 0
        }}
    >
        <div style={{
            position: 'absolute', top: '4px',
            left: checked ? '26px' : '4px',
            width: '18px', height: '18px',
            background: 'white', borderRadius: '50%', transition: '0.3s'
        }} />
    </button>
);

// Reusable Section Card
const Card = ({ children, danger }) => (
    <section style={{
        background: 'white',
        borderRadius: '24px',
        padding: '2.5rem',
        border: `1px solid ${danger ? '#fecaca' : '#f1f5f9'}`,
        borderLeft: danger ? '4px solid #ef4444' : undefined
    }}>
        {children}
    </section>
);

const SectionTitle = ({ icon, children, danger }) => (
    <h2 style={{
        fontSize: '1.15rem', fontWeight: 800,
        color: danger ? '#ef4444' : '#1e293b',
        marginBottom: '1.75rem',
        display: 'flex', alignItems: 'center', gap: '0.6rem'
    }}>
        {icon}{children}
    </h2>
);

const Settings = () => {
    const { user } = useAuth();
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null); // { msg, type: 'success'|'error' }

    const [settings, setSettings] = useState({
        notifications: { reminders: true, alerts: true },
        privacy: { profileVisibility: true }
    });

    // Password form
    const [pw, setPw] = useState({ current: '', new: '', confirm: '' });
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
    const [pwLoading, setPwLoading] = useState(false);

    // Delete account
    const [deleteStep, setDeleteStep] = useState(0); // 0=idle, 1=confirm, 2=reauth
    const [deletePass, setDeletePass] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        if (!user) return;
        const settingsRef = ref(db, `users/${user.uid}/settings`);
        const unsubscribe = onValue(settingsRef, (snapshot) => {
            if (snapshot.exists()) {
                setSettings(prev => ({ ...prev, ...snapshot.val() }));
            }
            setLoading(false);
        }, (error) => {
            console.error("❌ Error fetching settings:", error);
            setLoading(false);
        });
        return unsubscribe;
    }, [user]);

    const saveSettings = async (newSettings) => {
        if (!user) return;
        setSaving(true);
        try {
            await update(ref(db, `users/${user.uid}`), {
                settings: newSettings,
                updatedAt: new Date().toISOString()
            });
        } catch (err) {
            showToast('Failed to save settings.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const toggleNotif = (key) => {
        const updated = { ...settings, notifications: { ...settings.notifications, [key]: !settings.notifications[key] } };
        setSettings(updated);
        saveSettings(updated);
    };

    const toggleVisibility = () => {
        const updated = { ...settings, privacy: { ...settings.privacy, profileVisibility: !settings.privacy.profileVisibility } };
        setSettings(updated);
        saveSettings(updated);
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        if (pw.new !== pw.confirm) return showToast('New passwords do not match.', 'error');
        if (pw.new.length < 8) return showToast('Password must be at least 8 characters.', 'error');
        setPwLoading(true);
        try {
            // Re-authenticate first
            const credential = EmailAuthProvider.credential(user.email, pw.current);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updatePassword(auth.currentUser, pw.new);
            setPw({ current: '', new: '', confirm: '' });
            showToast('Password updated successfully!');
        } catch (err) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                showToast('Current password is incorrect.', 'error');
            } else {
                showToast(err.message || 'Failed to update password.', 'error');
            }
        } finally {
            setPwLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteLoading(true);
        try {
            const credential = EmailAuthProvider.credential(user.email, deletePass);
            await reauthenticateWithCredential(auth.currentUser, credential);
            // Remove DB profile
            await remove(ref(db, `users/${user.uid}`));
            await deleteUser(auth.currentUser);
            // Auth state change will log them out automatically
        } catch (err) {
            setDeleteLoading(false);
            if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                showToast('Incorrect password. Account not deleted.', 'error');
            } else {
                showToast(err.message || 'Failed to delete account.', 'error');
            }
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}>
            <Loader2 className="animate-spin" size={40} color="#1e3a8a" />
        </div>
    );

    return (
        <div style={{ maxWidth: '760px', margin: '0' }}>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 900, color: '#1e293b', marginBottom: '2.5rem', letterSpacing: '-0.02em' }}>Settings</h1>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -16 }}
                        style={{
                            position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
                            background: toast.type === 'success' ? '#f0fdf4' : '#fef2f2',
                            border: `1px solid ${toast.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                            color: toast.type === 'success' ? '#15803d' : '#dc2626',
                            padding: '1rem 1.5rem', borderRadius: '16px',
                            fontWeight: 700, fontSize: '0.95rem',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
                        }}
                    >
                        {toast.type === 'success' ? <Check size={18} /> : <AlertTriangle size={18} />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* ── Notifications ── */}
                <Card>
                    <SectionTitle icon={<Bell size={18} />}>Notifications</SectionTitle>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {[
                            {
                                label: 'Session Reminders',
                                desc: 'Get reminded 30 minutes before your upcoming sessions.',
                                key: 'reminders',
                                icon: <Clock size={16} />
                            },
                            {
                                label: 'New Match Alerts',
                                desc: 'Notify me when I receive a new mentor/mentee match request.',
                                key: 'alerts',
                                icon: <Zap size={16} />
                            }
                        ].map((item, i, arr) => (
                            <div key={item.key} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                paddingBottom: i < arr.length - 1 ? '1.5rem' : 0,
                                borderBottom: i < arr.length - 1 ? '1px solid #f8fafc' : 'none'
                            }}>
                                <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                                    <div style={{ color: '#64748b', marginTop: '2px' }}>{item.icon}</div>
                                    <div>
                                        <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.2rem' }}>{item.label}</p>
                                        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.desc}</p>
                                    </div>
                                </div>
                                <Toggle
                                    checked={settings.notifications[item.key] ?? true}
                                    onChange={() => toggleNotif(item.key)}
                                    disabled={saving}
                                />
                            </div>
                        ))}
                    </div>
                </Card>

                {/* ── Privacy ── */}
                <Card>
                    <SectionTitle icon={<Eye size={18} />}>Privacy</SectionTitle>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                            <div style={{ color: '#64748b', marginTop: '2px' }}>
                                {settings.privacy?.profileVisibility ? <Eye size={16} /> : <EyeOff size={16} />}
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.2rem' }}>Profile Visibility</p>
                                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                    {settings.privacy?.profileVisibility
                                        ? 'Your profile is visible to potential matches.'
                                        : 'Your profile is hidden. Others cannot find you.'}
                                </p>
                            </div>
                        </div>
                        <Toggle
                            checked={settings.privacy?.profileVisibility ?? true}
                            onChange={toggleVisibility}
                            disabled={saving}
                        />
                    </div>
                </Card>

                {/* ── Update Password ── */}
                <Card>
                    <SectionTitle icon={<KeyRound size={18} />}>Update Password</SectionTitle>
                    <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {[
                            { label: 'Current Password', key: 'current' },
                            { label: 'New Password', key: 'new' },
                            { label: 'Confirm New Password', key: 'confirm' }
                        ].map(field => (
                            <div key={field.key}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.6rem' }}>{field.label}</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        required
                                        type={showPw[field.key] ? 'text' : 'password'}
                                        value={pw[field.key]}
                                        onChange={e => setPw(p => ({ ...p, [field.key]: e.target.value }))}
                                        placeholder="••••••••"
                                        style={{
                                            width: '100%', padding: '0.95rem 3rem 0.95rem 1.25rem',
                                            borderRadius: '12px', border: '1px solid #e2e8f0',
                                            background: '#f8fafc', fontSize: '1rem',
                                            outline: 'none', color: '#334155', boxSizing: 'border-box'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw(s => ({ ...s, [field.key]: !s[field.key] }))}
                                        style={{
                                            position: 'absolute', right: '12px', top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8'
                                        }}
                                    >
                                        {showPw[field.key] ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div>
                            <button
                                type="submit"
                                disabled={pwLoading}
                                className="btn btn-primary"
                                style={{ padding: '0.85rem 2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                                {pwLoading ? <><Loader2 size={16} className="animate-spin" /> Updating...</> : <><Lock size={16} /> Update Password</>}
                            </button>
                        </div>
                    </form>
                </Card>

                {/* ── Danger Zone ── */}
                <Card danger>
                    <SectionTitle icon={<AlertTriangle size={18} />} danger>Danger Zone</SectionTitle>
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem' }}>
                        Permanently delete your account and all associated data. This action <strong>cannot be undone</strong>.
                    </p>

                    <AnimatePresence mode="wait">
                        {deleteStep === 0 && (
                            <motion.div key="step0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <button
                                    onClick={() => setDeleteStep(1)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        border: '1.5px solid #fecaca', background: 'white', color: '#ef4444',
                                        padding: '0.85rem 1.5rem', borderRadius: '12px',
                                        fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem'
                                    }}
                                >
                                    <Trash2 size={16} /> Delete My Account
                                </button>
                            </motion.div>
                        )}

                        {deleteStep === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                style={{
                                    background: '#fef2f2', border: '1px solid #fecaca',
                                    borderRadius: '16px', padding: '1.5rem',
                                    display: 'flex', flexDirection: 'column', gap: '1rem'
                                }}>
                                <p style={{ fontWeight: 700, color: '#dc2626', margin: 0 }}>⚠️ Are you absolutely sure?</p>
                                <p style={{ fontSize: '0.875rem', color: '#7f1d1d', margin: 0 }}>
                                    Your profile, matches, sessions, and messages will be permanently erased.
                                </p>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        onClick={() => setDeleteStep(2)}
                                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        Yes, delete my account
                                    </button>
                                    <button
                                        onClick={() => setDeleteStep(0)}
                                        style={{ background: 'white', color: '#64748b', border: '1px solid #e2e8f0', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {deleteStep === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                style={{
                                    background: '#fef2f2', border: '1px solid #fecaca',
                                    borderRadius: '16px', padding: '1.5rem',
                                    display: 'flex', flexDirection: 'column', gap: '1rem'
                                }}>
                                <p style={{ fontWeight: 700, color: '#dc2626', margin: 0 }}>Enter your password to confirm deletion</p>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="password"
                                        value={deletePass}
                                        onChange={e => setDeletePass(e.target.value)}
                                        placeholder="Your password"
                                        style={{
                                            width: '100%', padding: '0.9rem 1.25rem',
                                            borderRadius: '10px', border: '1px solid #fecaca',
                                            background: 'white', fontSize: '1rem',
                                            outline: 'none', color: '#334155', boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button
                                        disabled={deleteLoading || !deletePass}
                                        onClick={handleDeleteAccount}
                                        style={{
                                            background: '#ef4444', color: 'white', border: 'none',
                                            padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 700,
                                            cursor: deleteLoading || !deletePass ? 'not-allowed' : 'pointer',
                                            opacity: deleteLoading || !deletePass ? 0.7 : 1,
                                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                                        }}
                                    >
                                        {deleteLoading ? <><Loader2 size={15} className="animate-spin" /> Deleting...</> : 'Permanently Delete'}
                                    </button>
                                    <button
                                        onClick={() => { setDeleteStep(0); setDeletePass(''); }}
                                        style={{ background: 'white', color: '#64748b', border: '1px solid #e2e8f0', padding: '0.75rem 1.5rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>


            </div>
        </div>
    );
};

export default Settings;
