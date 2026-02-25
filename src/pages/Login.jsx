import React, { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getFriendlyErrorMessage } from '../utils/errorMessages';
import Logo from '../components/Logo';

const Login = () => {
    const { user, loading: authLoading } = useAuth();
    const [searchParams] = useSearchParams();
    const initialMode = searchParams.get('mode') === 'signup';

    const [isLogin, setIsLogin] = useState(!initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true);
            await signInWithPopup(auth, new GoogleAuthProvider());
            navigate('/dashboard');
        } catch (err) { setError(getFriendlyErrorMessage(err.code)); }
        finally { setLoading(false); }
    };

    const validatePassword = (pass) => {
        const errors = [];
        if (pass.length < 16) errors.push("at least 16 characters");
        if (!/[A-Z]/.test(pass)) errors.push("one uppercase letter");
        if (!/[a-z]/.test(pass)) errors.push("one lowercase letter");
        if (!/[0-9]/.test(pass)) errors.push("one number");
        if (!/[!@#$%^&*]/.test(pass)) errors.push("one special character (!@#$%^&*)");

        if (errors.length > 0) {
            return "Password must contain: " + errors.join(", ") + ".";
        }
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isLogin) {
            const passError = validatePassword(password);
            if (passError) {
                setError(passError);
                return;
            }
        }

        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                navigate('/dashboard');
            } else {
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                await sendEmailVerification(cred.user);
                navigate('/verify');
            }
        } catch (err) {
            console.error("Auth Error:", err.code, err.message);
            setError(getFriendlyErrorMessage(err.code));
        }
        finally { setLoading(false); }
    };

    if (authLoading) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'white', flexDirection: isMobile ? 'column' : 'row' }}>
            <div style={{ flex: '1', padding: isMobile ? '2rem 1.5rem' : '4rem 6rem', display: 'flex', flexDirection: 'column', maxWidth: isMobile ? '100%' : '700px' }}>
                <Link to="/" style={{ textDecoration: 'none', marginBottom: '2rem' }}><Logo size={24} /></Link>
                <h1 style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: 900, color: '#1e293b', marginBottom: '1rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    {isLogin ? 'Welcome Back' : 'Level Up Your Career'}
                </h1>
                <p style={{ color: '#64748b', marginBottom: '2.5rem', fontWeight: 500, fontSize: '0.95rem' }}>
                    {isLogin ? 'Sign in to continue your journey.' : 'Join the best mentors in Africa.'}
                </p>

                <div style={{ width: '100%', maxWidth: '400px' }}>
                    <button onClick={handleGoogleSignIn} style={{ width: '100%', padding: '0.8rem', background: '#1e3a8a', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer', marginBottom: '1.5rem' }}>Continue with Google</button>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.4rem' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    style={{ width: '100%', padding: '0.8rem', paddingRight: '2.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#64748b',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '4px'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.8rem', background: '#1e3a8a', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}>
                            {loading ? '...' : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '1rem' }}>{error}</p>}

                    <p style={{ marginTop: '2rem', fontSize: '0.9rem', textAlign: 'center', color: '#1e293b' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer' }}>{isLogin ? 'Sign Up' : 'Login'}</button>
                    </p>
                </div>
            </div>

            {!isMobile && (
                <div style={{ flex: '1', padding: '1.5rem' }}>
                    <div style={{ width: '100%', height: '100%', borderRadius: '24px', overflow: 'hidden' }}>
                        <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
