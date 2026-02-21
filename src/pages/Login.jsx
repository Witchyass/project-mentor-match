import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from 'firebase/auth';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

    React.useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            setLoading(true);
            setError('');
            await signInWithPopup(auth, provider);
            // Google accounts are already verified — go straight to dashboard or onboarding
            navigate('/dashboard');
        } catch (err) {
            setError(friendlyError(err.code));
        } finally {
            setLoading(false);
        }
    };

    const friendlyError = (code) => {
        const map = {
            'auth/user-not-found': 'No account found with this email.',
            'auth/wrong-password': 'Incorrect password. Please try again.',
            'auth/invalid-credential': 'Incorrect email or password.',
            'auth/email-already-in-use': 'An account with this email already exists.',
            'auth/weak-password': 'Password must be at least 6 characters.',
            'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
            'auth/network-request-failed': 'Network error. Check your connection.',
        };
        return map[code] || 'Something went wrong. Please try again.';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                navigate('/dashboard');
            } else {
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                // Send real Firebase verification email
                await sendEmailVerification(cred.user);
                navigate('/verify');
            }
        } catch (err) {
            setError(friendlyError(err.code));
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return null;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'white' }}>
            {/* Left Section: Form */}
            <div style={{ flex: '1', padding: '4rem 6rem', display: 'flex', flexDirection: 'column', maxWidth: '700px' }}>
                <Link to="/" style={{ textDecoration: 'none', marginBottom: '2rem' }}>
                    <Logo size={28} />
                </Link>

                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '3rem', width: 'fit-content', padding: '0' }}
                >
                    <ArrowLeft size={24} color="#1e293b" />
                </button>

                <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#1e293b', marginBottom: '1.5rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    {isLogin ? 'Welcome Back to' : 'Level Up Your Career with'} <br /> MentorMatch
                </h1>

                <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '3rem', fontWeight: 500 }}>
                    {isLogin
                        ? 'Sign in to continue your mentorship journey and connect with your matches.'
                        : 'Join 500+ people who are shaping their career and get access to the Africa\'s best mentors.'}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '450px' }}>
                    <button
                        onClick={handleGoogleSignIn}
                        className="btn"
                        style={{
                            width: '100%',
                            justifyContent: 'center',
                            padding: '1rem',
                            background: '#1e3a8a',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: 700,
                            boxShadow: '0 4px 6px -1px rgba(30, 58, 138, 0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        Continue with google
                    </button>

                    <div style={{ position: 'relative', textAlign: 'center', margin: '2rem 0' }}>
                        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0' }} />
                        <span style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'white', padding: '0 1rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700 }}>OR</span>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>Email Address</label>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1.25rem',
                                    borderRadius: '12px',
                                    border: '1px solid #cbd5e1',
                                    fontSize: '1rem',
                                    outline: 'none'
                                }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#475569', marginBottom: '0.75rem' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '1rem 1.25rem',
                                        paddingRight: '3.5rem',
                                        borderRadius: '12px',
                                        border: '1px solid #cbd5e1',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#64748b',
                                        padding: '5px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn"
                            disabled={loading}
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                padding: '1rem',
                                background: '#1e3a8a',
                                color: 'white',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: 700,
                                boxShadow: '0 4px 6px -1px rgba(30, 58, 138, 0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In' : 'Create Account')}
                        </button>
                    </form>

                    {error && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '1rem' }}>{error}</p>}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b' }}>
                            {isLogin ? "Don't have an account?" : "Have an account?"}
                        </span>
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}
                        >
                            {isLogin ? "Sign Up" : "Login"}
                        </button>
                    </div>

                    {!isLogin && (
                        <p style={{ marginTop: '4rem', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.6, maxWidth: '400px' }}>
                            By signing up, you agree to the <span style={{ color: '#64748b', fontWeight: 600 }}>Terms of use</span>, <span style={{ color: '#64748b', fontWeight: 600 }}>Privacy Policy</span> and <span style={{ color: '#64748b', fontWeight: 600 }}>Community standards</span> of MentorMatch
                        </p>
                    )}
                </div>
            </div>

            {/* Right Section: Image */}
            <div style={{ flex: '1', padding: '1.5rem', display: 'flex' }}>
                <div style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '30px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                }}>
                    <img
                        src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&auto=format&fit=crop"
                        alt="Join MentorMatch"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;
