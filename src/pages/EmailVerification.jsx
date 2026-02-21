import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, Loader2, RefreshCw, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { sendEmailVerification, reload, signOut } from 'firebase/auth';
import Logo from '../components/Logo';

const RESEND_COOLDOWN = 60; // seconds

const EmailVerification = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [verified, setVerified] = useState(false);
    const [checking, setChecking] = useState(false);
    const [backLoading, setBackLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendSuccess, setResendSuccess] = useState(false);

    const pollRef = useRef(null);
    const cooldownRef = useRef(null);

    // Redirect if not logged in
    useEffect(() => {
        if (!user) navigate('/login');
    }, [user, navigate]);

    // Auto-redirect after verified
    useEffect(() => {
        if (verified) {
            const timer = setTimeout(() => navigate('/onboarding'), 2000);
            return () => clearTimeout(timer);
        }
    }, [verified, navigate]);

    // Poll every 3 s to check if user verified their email
    useEffect(() => {
        if (!user || verified) return;
        pollRef.current = setInterval(async () => {
            try {
                await reload(auth.currentUser);
                if (auth.currentUser?.emailVerified) {
                    clearInterval(pollRef.current);
                    setVerified(true);
                }
            } catch {
                // silent — network blip
            }
        }, 3000);
        return () => clearInterval(pollRef.current);
    }, [user, verified]);

    // Countdown timer for resend button
    useEffect(() => {
        if (resendCooldown <= 0) return;
        cooldownRef.current = setInterval(() => {
            setResendCooldown(prev => {
                if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(cooldownRef.current);
    }, [resendCooldown]);

    const handleCheckNow = async () => {
        setChecking(true);
        setError('');
        try {
            await reload(auth.currentUser);
            if (auth.currentUser?.emailVerified) {
                setVerified(true);
            } else {
                setError("Email not verified yet. Please click the link in your inbox, then try again.");
            }
        } catch (e) {
            setError("Couldn't check status. Please try again.");
        } finally {
            setChecking(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        setError('');
        setResendSuccess(false);
        try {
            await sendEmailVerification(auth.currentUser);
            setResendCooldown(RESEND_COOLDOWN);
            setResendSuccess(true);
            setTimeout(() => setResendSuccess(false), 4000);
        } catch (e) {
            if (e.code === 'auth/too-many-requests') {
                setError('Too many requests. Please wait a minute before resending.');
                setResendCooldown(RESEND_COOLDOWN);
            } else {
                setError('Failed to resend. Please try again later.');
            }
        } finally {
            setResendLoading(false);
        }
    };

    // Sign out then go back to login so the user can change their email / start over
    const handleBack = async () => {
        setBackLoading(true);
        try {
            await signOut(auth);
        } catch { /* ignore */ }
        navigate('/login');
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f0f4ff 0%, #fafbff 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2rem'
        }}>
            {/* Header */}
            <header style={{ width: '100%', maxWidth: '1200px', marginBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Logo size={26} />
                <button
                    onClick={handleBack}
                    disabled={backLoading}
                    style={{ background: 'transparent', border: 'none', cursor: backLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontWeight: 600, fontSize: '0.9rem', opacity: backLoading ? 0.6 : 1 }}
                >
                    {backLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowLeft size={16} />}
                    {backLoading ? 'Signing out...' : 'Back to login'}
                </button>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    width: '100%',
                    maxWidth: '520px',
                    background: 'white',
                    borderRadius: '32px',
                    border: '1px solid #e2e8f0',
                    padding: '3.5rem 3rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0 20px 60px rgba(30,58,138,0.07)',
                    textAlign: 'center'
                }}
            >
                <AnimatePresence mode="wait">

                    {/* ── Verified State ── */}
                    {verified ? (
                        <motion.div
                            key="verified"
                            initial={{ scale: 0.7, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
                        >
                            <div style={{
                                width: '88px', height: '88px',
                                background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Check size={44} color="#16a34a" strokeWidth={3} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>Email Verified! 🎉</h2>
                                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                    Welcome to MentorMatch! Setting up your profile now...
                                </p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontSize: '0.875rem', fontWeight: 600 }}>
                                <Loader2 size={16} className="animate-spin" /> Redirecting to onboarding...
                            </div>
                        </motion.div>
                    ) : (

                        /* ── Waiting State ── */
                        <motion.div key="waiting" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

                            {/* Animated envelope */}
                            <div style={{ position: 'relative', marginBottom: '2rem' }}>
                                <motion.div
                                    animate={{ y: [0, -8, 0] }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                                    style={{
                                        width: '96px', height: '96px',
                                        background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                                        borderRadius: '28px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 8px 24px rgba(37,99,235,0.12)'
                                    }}
                                >
                                    <Mail size={48} color="#2563eb" strokeWidth={1.5} />
                                </motion.div>
                                {/* Pulse ring */}
                                <motion.div
                                    animate={{ scale: [1, 1.3], opacity: [0.4, 0] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
                                    style={{
                                        position: 'absolute', inset: '-8px',
                                        borderRadius: '36px',
                                        border: '2px solid #2563eb',
                                        pointerEvents: 'none'
                                    }}
                                />
                            </div>

                            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                                Check your inbox
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '0.5rem' }}>
                                We've sent a verification link to
                            </p>
                            <p style={{ fontWeight: 800, color: '#1e3a8a', fontSize: '1rem', marginBottom: '2rem', wordBreak: 'break-all' }}>
                                {user?.email}
                            </p>

                            {/* Instructions */}
                            <div style={{
                                background: '#f8fafc', border: '1px solid #e2e8f0',
                                borderRadius: '16px', padding: '1.25rem 1.5rem',
                                marginBottom: '2rem', width: '100%', textAlign: 'left'
                            }}>
                                {[
                                    { n: '1', text: 'Open the email from MentorMatch' },
                                    { n: '2', text: 'Click the "Verify your email" link' },
                                    { n: '3', text: 'Come back here — we\'ll detect it automatically' }
                                ].map(({ n, text }) => (
                                    <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: n === '3' ? 0 : '0.75rem' }}>
                                        <div style={{
                                            width: '24px', height: '24px', flexShrink: 0,
                                            background: '#1e3a8a', color: 'white',
                                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.75rem', fontWeight: 800
                                        }}>{n}</div>
                                        <span style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>{text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Auto-polling indicator */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                                <motion.div
                                    animate={{ opacity: [1, 0.3, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }} />
                                </motion.div>
                                Checking automatically every few seconds...
                            </div>

                            {/* Error */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        key="error"
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                                            background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px',
                                            padding: '1rem 1.25rem', marginBottom: '1rem',
                                            color: '#dc2626', fontSize: '0.875rem', fontWeight: 600, textAlign: 'left'
                                        }}
                                    >
                                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Resend success */}
                            <AnimatePresence>
                                {resendSuccess && (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        style={{
                                            width: '100%', display: 'flex', alignItems: 'center', gap: '0.6rem',
                                            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px',
                                            padding: '1rem 1.25rem', marginBottom: '1rem',
                                            color: '#15803d', fontSize: '0.875rem', fontWeight: 600
                                        }}
                                    >
                                        <Check size={16} /> Email resent! Check your inbox.
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Primary CTA */}
                            <button
                                onClick={handleCheckNow}
                                disabled={checking}
                                style={{
                                    width: '100%', padding: '1rem',
                                    background: '#1e3a8a', color: 'white',
                                    border: 'none', borderRadius: '14px',
                                    fontSize: '1rem', fontWeight: 800, cursor: checking ? 'not-allowed' : 'pointer',
                                    opacity: checking ? 0.75 : 1,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    marginBottom: '1rem',
                                    boxShadow: '0 4px 14px rgba(30,58,138,0.25)',
                                    transition: '0.2s'
                                }}
                            >
                                {checking
                                    ? <><Loader2 size={18} className="animate-spin" /> Checking...</>
                                    : <><ShieldCheck size={18} /> I've Verified My Email</>
                                }
                            </button>

                            {/* Resend */}
                            <button
                                onClick={handleResend}
                                disabled={resendLoading || resendCooldown > 0}
                                style={{
                                    width: '100%', padding: '0.9rem',
                                    background: 'transparent', color: resendCooldown > 0 ? '#94a3b8' : '#2563eb',
                                    border: `1.5px solid ${resendCooldown > 0 ? '#e2e8f0' : '#bfdbfe'}`,
                                    borderRadius: '14px',
                                    fontSize: '0.95rem', fontWeight: 700,
                                    cursor: resendCooldown > 0 || resendLoading ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    transition: '0.2s'
                                }}
                            >
                                {resendLoading
                                    ? <><Loader2 size={16} className="animate-spin" /> Sending...</>
                                    : resendCooldown > 0
                                        ? <><RefreshCw size={16} /> Resend in {resendCooldown}s</>
                                        : <><RefreshCw size={16} /> Resend verification email</>
                                }
                            </button>

                            <p style={{ marginTop: '1.5rem', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.6 }}>
                                Can't find it? Check your spam or junk folder. The link expires in 24 hours.
                            </p>

                            {/* Use different account / go back */}
                            <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9', width: '100%' }}>
                                <button
                                    onClick={handleBack}
                                    disabled={backLoading}
                                    style={{
                                        background: 'transparent', border: 'none',
                                        color: '#64748b', fontWeight: 600, fontSize: '0.85rem',
                                        cursor: backLoading ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        gap: '0.4rem', width: '100%'
                                    }}
                                >
                                    {backLoading
                                        ? <><Loader2 size={14} className="animate-spin" /> Signing out...</>
                                        : <><ArrowLeft size={14} /> Use a different email address</>}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default EmailVerification;
