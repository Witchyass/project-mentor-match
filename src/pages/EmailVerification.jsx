import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Check, Loader2, RefreshCw, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/firebase';
import { sendEmailVerification, reload, signOut } from 'firebase/auth';
import Logo from '../components/Logo';

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
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (user.email?.toLowerCase().endsWith('@mentor.match')) setVerified(true);
    }, [user, navigate]);

    useEffect(() => {
        if (verified) {
            const timer = setTimeout(() => navigate('/onboarding'), 2000);
            return () => clearTimeout(timer);
        }
    }, [verified, navigate]);

    const handleCheckNow = async () => {
        setChecking(true);
        setError('');
        try {
            await reload(auth.currentUser);
            if (auth.currentUser?.emailVerified) setVerified(true);
            else setError("Email not verified yet.");
        } catch { setError("Couldn't check status."); }
        finally { setChecking(false); }
    };

    const handleResend = async () => {
        setResendLoading(true);
        setError('');
        try {
            await sendEmailVerification(auth.currentUser);
            setResendCooldown(60);
            setResendSuccess(true);
            setTimeout(() => setResendSuccess(false), 4000);
        } catch { setError('Failed to resend.'); }
        finally { setResendLoading(false); }
    };

    const handleBack = async () => {
        setBackLoading(true);
        try { await signOut(auth); } catch { }
        navigate('/login');
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: isMobile ? '1.5rem' : '3rem' }}>
            <header style={{ width: '100%', maxWidth: '800px', marginBottom: isMobile ? '2rem' : '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Logo size={24} />
                <button onClick={handleBack} style={{ background: 'transparent', border: 'none', color: '#64748b', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>Back to login</button>
            </header>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: '500px', background: 'white', borderRadius: '32px', border: '1px solid #e2e8f0', padding: isMobile ? '2rem' : '3.5rem', textAlign: 'center' }}>
                <AnimatePresence mode="wait">
                    {verified ? (
                        <motion.div key="v" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <Check size={64} color="#10b981" style={{ margin: '0 auto 1.5rem' }} />
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>Verified! 🎉</h2>
                            <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Welcome! Redirecting you now...</p>
                        </motion.div>
                    ) : (
                        <div style={{ width: '100%' }}>
                            <Mail size={56} color="#1e3a8a" style={{ margin: '0 auto 1.5rem' }} />
                            <h1 style={{ fontSize: isMobile ? '1.4rem' : '1.8rem', fontWeight: 900, marginBottom: '0.75rem' }}>Check your inbox</h1>
                            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>We sent a link to <b style={{ color: '#1e3a8a' }}>{user?.email}</b></p>

                            <button onClick={handleCheckNow} disabled={checking} style={{ width: '100%', padding: '0.9rem', background: '#1e3a8a', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer', marginBottom: '1rem' }}>
                                {checking ? 'Checking...' : "I've Verified My Email"}
                            </button>
                            <button onClick={handleResend} disabled={resendLoading || resendCooldown > 0} style={{ width: '100%', padding: '0.9rem', background: 'transparent', color: '#1e3a8a', borderRadius: '12px', border: '1.5px solid #bfdbfe', fontWeight: 700, cursor: 'pointer' }}>
                                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email'}
                            </button>
                        </div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default EmailVerification;
