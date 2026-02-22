import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Target, Zap, Calendar, TrendingUp, Star, Users,
    ArrowRight, MessageSquare, Quote, HelpCircle,
    Globe, Shield, Award, ChevronRight, Sparkles, BarChart, ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const Landing = () => {
    const { user } = useAuth();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const mentors = [
        { name: "Nomusa Dlamini", role: "Senior Product Manager at Masterclass", rating: 4.8, reviews: 320, exp: "10+ years", img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop" },
        { name: "Kofi Ampah", role: "Software Architect at AWS", rating: 4.9, reviews: 156, exp: "12+ years", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop" },
        { name: "Amara Okafor", role: "UX Design Lead at Google", rating: 5.0, reviews: 210, exp: "8+ years", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop" },
        { name: "Babajide Benson", role: "Data Science Director", rating: 4.7, reviews: 89, exp: "15+ years", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop" },
    ];

    const stats = [
        { icon: <Users size={24} />, count: "500+", label: "Expert Mentors", color: "#6366f1" },
        { icon: <Star size={24} />, count: "4.8", label: "Average Rating", color: "#f59e0b" },
        { icon: <MessageSquare size={24} />, count: "10,000+", label: "Sessions Completed", color: "#10b981" },
        { icon: <TrendingUp size={24} />, count: "92%", label: "Success Rate", color: "#8b5cf6" },
    ];

    const stories = [
        {
            name: "Chidinma Eze",
            role: "Junior Developer → Senior Engineer",
            company: "Flutterwave",
            img: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=200&h=200&fit=crop",
            quote: "Within 6 months of being matched with my mentor, I went from struggling with system design to leading my team's architecture decisions. MentorMatch didn't just connect me to knowledge — it connected me to belief in myself.",
            outcome: "Promoted in 6 months",
            outcomeColor: "#10b981",
            tag: "Software Engineering"
        },
        {
            name: "Emeka Obi",
            role: "Business Analyst → Product Manager",
            company: "Paystack",
            img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
            quote: "I had the skills but didn't know how to navigate the transition from BA to PM. My mentor had made the same jump at Google. Three months in, I had my offer letter. The match was almost eerily perfect.",
            outcome: "Career pivot in 3 months",
            outcomeColor: "#2563eb",
            tag: "Product Management"
        },
        {
            name: "Aïssatou Bah",
            role: "Graduate → UX Designer",
            company: "Interswitch",
            img: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop",
            quote: "Coming from Conakry with a design degree but zero industry contacts, I felt invisible. MentorMatch gave me access to a mentor who reviewed my portfolio, introduced me to her network, and helped me land my first real role.",
            outcome: "First industry role secured",
            outcomeColor: "#8b5cf6",
            tag: "UX Design"
        }
    ];

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh' }}>

            {/* Hero */}
            <section style={{
                padding: isMobile ? '6rem 1.5rem 3rem' : '8rem 2rem 4rem',
                maxWidth: 'var(--max-content-width)',
                margin: '0 auto',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? '2rem' : '4rem',
                flexDirection: isMobile ? 'column' : 'row'
            }}>
                <div style={{ flex: '1', minWidth: isMobile ? '100%' : '350px', textAlign: isMobile ? 'center' : 'left' }}>
                    <h1 style={{ fontSize: 'clamp(2.2rem, 8vw, 4.2rem)', lineHeight: 1.1, fontWeight: 900, color: '#1e3a8a', marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
                        The Right Mentor <br /> Changes Everything.
                    </h1>
                    <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '2.5rem', maxWidth: '540px', margin: isMobile ? '0 auto 2.5rem' : '0 0 2.5rem', lineHeight: 1.6, fontWeight: 500 }}>
                        We use intelligent matching to connect you with mentors who understand your journey and help you achieve measurable growth.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                        <Link to="/login" style={{ padding: '1.1rem 2.8rem', fontSize: '1rem', background: '#1e3a8a', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: 800, boxShadow: '0 10px 15px -3px rgba(30, 58, 138, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            Get Started <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                        <div style={{ display: 'flex' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid white', marginLeft: i === 1 ? 0 : '-10px', overflow: 'hidden' }}>
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
                            Trusted by <span style={{ color: '#1e293b', fontWeight: 800 }}>10,000+</span> users
                        </p>
                    </div>
                </div>

                <div style={{
                    flex: '1',
                    width: '100%',
                    position: 'relative',
                    height: isMobile ? '400px' : '520px',
                    display: 'flex',
                    gap: '0.75rem',
                    justifyContent: 'center',
                    overflow: 'hidden'
                }}>
                    <div style={{ width: isMobile ? '140px' : '260px', height: isMobile ? '240px' : '380px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', alignSelf: 'center', position: 'relative', zIndex: 1 }}>
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Mentor" />
                    </div>
                    <div style={{ width: isMobile ? '160px' : '280px', height: isMobile ? '280px' : '420px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', position: 'relative', zIndex: 2, margin: isMobile ? '0 -10%' : '0 -20% 0 0' }}>
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Mentor" />
                    </div>
                    {!isMobile && (
                        <div style={{ width: '240px', height: '360px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', alignSelf: 'end' }}>
                            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Mentor" />
                        </div>
                    )}
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" style={{ padding: isMobile ? '4rem 1.5rem' : '6rem 2rem' }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                    borderRadius: isMobile ? '24px' : '40px',
                    padding: isMobile ? '3rem 1.5rem' : '6rem 4rem',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: isMobile ? '3rem' : '8rem' }}>
                        <h2 style={{ fontSize: isMobile ? '2.2rem' : '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>How it Works</h2>
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
                        gap: isMobile ? '3rem' : '2rem',
                        position: 'relative',
                        zIndex: 2,
                        alignItems: 'start'
                    }}>
                        {!isMobile && (
                            <svg style={{ position: 'absolute', top: '150px', left: '10%', width: '80%', height: '100px', zIndex: -1 }}>
                                <path d="M 0 50 Q 150 -50 300 50 T 600 50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="8,8" />
                            </svg>
                        )}
                        {[
                            { icon: <Target size={28} />, step: 'Step 1', title: 'Goals', desc: 'Share your career aspirations and what you want to learn.', mt: isMobile ? '0' : '140px' },
                            { icon: <Sparkles size={28} />, step: 'Step 2', title: 'AI Match', desc: 'Our AI finds your ideal mentor matching your profile.', mt: '0' },
                            { icon: <Calendar size={28} />, step: 'Step 3', title: 'Schedule', desc: 'Book a session based on real-time availability.', mt: isMobile ? '0' : '140px' },
                            { icon: <BarChart size={28} />, step: 'Step 4', title: 'Grow', desc: 'Get guidance and track your progress over time.', mt: '0' },
                        ].map(({ icon, step, title, desc, mt }) => (
                            <div key={step} style={{ marginTop: mt, textAlign: 'center' }}>
                                <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>{icon}</div>
                                <p style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{step}</p>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem' }}>{title}</h3>
                                <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.5 }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Success Stories */}
            <section id="success-stories" style={{ padding: isMobile ? '4rem 1.5rem' : '6rem 2rem', background: '#f8fafc' }}>
                <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2563eb', marginBottom: '0.75rem' }}>Real Results</p>
                        <h2 style={{ fontSize: isMobile ? '2.2rem' : '2.5rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em', marginBottom: '1rem' }}>Success Stories</h2>
                        <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
                            Professionals across Africa are transforming their careers through the power of the right mentorship connection.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
                        {stories.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12 }}
                                style={{ background: 'white', borderRadius: '28px', padding: isMobile ? '1.5rem' : '2.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
                            >
                                <div style={{ color: '#dbeafe' }}>
                                    <Quote size={36} fill="#dbeafe" strokeWidth={0} />
                                </div>
                                <span style={{ display: 'inline-flex', width: 'fit-content', padding: '0.3rem 0.9rem', borderRadius: '99px', background: `${s.outcomeColor}15`, color: s.outcomeColor, fontWeight: 700, fontSize: '0.75rem' }}>
                                    {s.tag}
                                </span>
                                <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.75, fontStyle: 'italic', flex: 1 }}>
                                    "{s.quote}"
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '12px', background: `${s.outcomeColor}10`, width: 'fit-content' }}>
                                    <TrendingUp size={14} color={s.outcomeColor} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: s.outcomeColor }}>{s.outcome}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                    <img src={s.img} alt={s.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
                                    <div>
                                        <p style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.1rem' }}>{s.name}</p>
                                        <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{s.role}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Top Mentors */}
            <section style={{ padding: isMobile ? '4rem 1.5rem' : '6rem 2rem', background: '#ffffff' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>Top Rated Mentors</h2>
                            <p style={{ color: '#64748b', fontWeight: 500 }}>Learn from industry leaders at top tech companies.</p>
                        </div>
                        <Link to="/login" style={{ color: '#1e3a8a', fontWeight: 800, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            View all mentors <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                        gap: '2rem'
                    }}>
                        {mentors.map((m, i) => (
                            <div key={i} className="mentor-card" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px', overflow: 'hidden', transition: 'var(--transition)' }}>
                                <div style={{ height: '240px', position: 'relative' }}>
                                    <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(255,255,255,0.9)', padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, color: '#1e3a8a', backdropFilter: 'blur(4px)' }}>Featured</div>
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>{m.name}</h4>
                                    <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500, marginBottom: '1.25rem' }}>{m.role}</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', marginBottom: '1.25rem' }}>
                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                                        <span style={{ color: '#64748b', fontSize: '0.8rem', marginLeft: '0.5rem', fontWeight: 600 }}>5.0 ({m.reviews})</span>
                                    </div>
                                    <Link to="/login" style={{ display: 'block', textAlign: 'center', textDecoration: 'none', padding: '0.8rem', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#1e3a8a', fontWeight: 800 }}>View Profile</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Platform Stats */}
            <section style={{ padding: isMobile ? '4rem 1.5rem' : '6rem 2rem', background: '#f8fafc' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? '1rem' : '2rem' }}>
                        {stats.map((s, i) => (
                            <div key={i} style={{ background: 'white', padding: isMobile ? '1.5rem' : '2.5rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', border: '1px solid rgba(0,0,0,0.03)' }}>
                                <div style={{ color: s.color, background: `${s.color}10`, padding: '0.75rem', borderRadius: '12px' }}>{s.icon}</div>
                                <div>
                                    <p style={{ fontSize: isMobile ? '1.8rem' : '2.2rem', fontWeight: 900, color: '#1e293b' }}>{s.count}</p>
                                    <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.85rem' }}>{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section id="qa" style={{ padding: isMobile ? '4rem 1.5rem' : '6rem 2rem' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
                        <h2 style={{ fontSize: isMobile ? '2.2rem' : '2.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>Common Questions</h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { q: "How does the matching algorithm work?", a: "Our AI analyzes your skills, goals, and interests to find mentors with relevant experience and a high compatibility score." },
                            { q: "Is there a cost for sessions?", a: "Mentors set their own rates. Many offer free introductory sessions to ensure a good fit before starting a structured program." },
                            { q: "How do I become a mentor?", a: "Application is simple through your dashboard menu once you've set up your profile." },
                        ].map((item, i) => (
                            <div key={i} style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <HelpCircle size={20} color="#1e3a8a" />
                                    {item.q}
                                </h4>
                                <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 500, paddingLeft: isMobile ? '0' : '2.5rem' }}>{item.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{
                padding: isMobile ? '4rem 1.5rem 2rem' : '6rem 2rem 2rem',
                background: '#0f172a',
                color: 'white'
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr',
                    gap: '3rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    paddingBottom: '4rem'
                }}>
                    <div>
                        <Logo size={28} />
                        <p style={{ marginTop: '1.5rem', color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6 }}>Empowering the next generation of tech leaders through AI-driven mentorship matching.</p>
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1rem' }}>Platform</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Find a Mentor</Link>
                            <Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Become a Mentor</Link>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1rem' }}>Company</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>About Us</a>
                            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Contact</a>
                        </div>
                    </div>
                    <div>
                        <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1rem' }}>Social</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>Twitter</a>
                            <a href="#" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' }}>LinkedIn</a>
                        </div>
                    </div>
                </div>
                <div style={{ maxWidth: '1200px', margin: '2rem auto 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.8rem', flexDirection: isMobile ? 'column' : 'row', gap: '1rem', textAlign: 'center' }}>
                    <p>© 2026 MentorMatch. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
                        <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
