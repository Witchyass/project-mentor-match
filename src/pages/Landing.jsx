import React, { useState } from 'react';
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
    const [activeRole, setActiveRole] = useState('mentee');

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

    const footerLinkStyle = { color: 'white', textDecoration: 'none', opacity: 0.65, fontSize: '0.9rem', transition: '0.2s' };

    return (
        <div style={{ background: '#ffffff', minHeight: '100vh' }}>

            {/* Hero */}
            <section style={{ padding: '8rem 2rem 4rem', maxWidth: '1300px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '350px' }}>
                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.2rem)', lineHeight: 1.1, fontWeight: 900, color: '#1e3a8a', marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
                        The Right Mentor <br /> Changes Everything.
                    </h1>
                    <p style={{ fontSize: '1.15rem', color: '#64748b', marginBottom: '2.5rem', maxWidth: '540px', lineHeight: 1.6, fontWeight: 500 }}>
                        We use intelligent matching to connect you with mentors who understand your journey and help you achieve measurable growth.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Link to="/login" style={{ padding: '1.1rem 2.8rem', fontSize: '1rem', background: '#1e3a8a', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: 800, boxShadow: '0 10px 15px -3px rgba(30, 58, 138, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            Get Started <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div style={{ marginTop: '3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex' }}>
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '3px solid white', marginLeft: i === 1 ? 0 : '-12px', overflow: 'hidden' }}>
                                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="user" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                            Trusted by <span style={{ color: '#1e293b', fontWeight: 800 }}>10,000+</span> students and early professionals
                        </p>
                    </div>
                </div>

                <div style={{ flex: '1', minWidth: '400px', position: 'relative', height: '520px', display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '260px', height: '380px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', alignSelf: 'center', position: 'relative', zIndex: 1 }}>
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Mentor" />
                    </div>
                    <div style={{ width: '280px', height: '420px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', position: 'relative', zIndex: 2, marginRight: '-20%' }}>
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Mentor" />
                    </div>
                    <div style={{ width: '240px', height: '360px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', alignSelf: 'end' }}>
                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Mentor" />
                    </div>
                </div>
            </section>

            {/* Role Toggle */}
            <section style={{ padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                <div style={{ background: '#f1f5f9', padding: '5px', borderRadius: '12px', display: 'flex', gap: '4px' }}>
                    {['mentor', 'mentee'].map(role => (
                        <button key={role} onClick={() => setActiveRole(role)} style={{ padding: '0.6rem 2.5rem', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer', background: activeRole === role ? '#1e3a8a' : 'transparent', color: activeRole === role ? 'white' : '#64748b', transition: '0.2s', textTransform: 'capitalize' }}>
                            {role === 'mentor' ? 'Mentor' : 'Mentee'}
                        </button>
                    ))}
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" style={{ padding: '6rem 2rem' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', borderRadius: '40px', padding: '6rem 4rem', color: 'white', position: 'relative', overflow: 'hidden', minHeight: '700px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '8rem' }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>How MentorMatch AI Works</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', position: 'relative', zIndex: 2, alignItems: 'start' }}>
                        <svg style={{ position: 'absolute', top: '150px', left: '10%', width: '80%', height: '100px', zIndex: -1 }}>
                            <path d="M 0 50 Q 150 -50 300 50 T 600 50" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="8,8" />
                        </svg>
                        {[
                            { icon: <Target size={28} />, step: 'Step 1', title: 'Tell us About Your Goals', desc: 'Share your career aspirations, challenges, and what you want to learn.', mt: '140px' },
                            { icon: <Sparkles size={28} />, step: 'Step 2', title: 'Our AI Matches You', desc: 'Our AI analyzes thousands of mentor profiles to find your ideal match.', mt: '0' },
                            { icon: <Calendar size={28} />, step: 'Step 3', title: 'Start a Session', desc: 'Schedule an introductory session based on availability.', mt: '140px' },
                            { icon: <BarChart size={28} />, step: 'Step 4', title: 'Receive Guidance & Grow', desc: 'Get personalized advice and track your progress over time.', mt: '0' },
                        ].map(({ icon, step, title, desc, mt }) => (
                            <div key={step} style={{ marginTop: mt, textAlign: 'center' }}>
                                <div style={{ width: '70px', height: '70px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>{icon}</div>
                                <p style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.8, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{step}</p>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.75rem' }}>{title}</h3>
                                <p style={{ fontSize: '0.9rem', opacity: 0.9, lineHeight: 1.5 }}>{desc}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{ position: 'absolute', bottom: '60px', right: '60px', width: '80px', height: '70px', background: 'white', borderRadius: '20px 20px 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5', fontWeight: 900, fontSize: '1.2rem', boxShadow: '0 15px 35px rgba(0,0,0,0.2)' }}>AI</div>
                </div>
            </section>

            {/* Success Stories */}
            <section id="success-stories" style={{ padding: '6rem 2rem', background: '#f8fafc' }}>
                <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2563eb', marginBottom: '0.75rem' }}>Real Results</p>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em', marginBottom: '1rem' }}>Success Stories From Our Community</h2>
                        <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
                            Professionals across Africa are transforming their careers through the power of the right mentorship connection.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
                        {stories.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.12 }}
                                style={{ background: 'white', borderRadius: '28px', padding: '2.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
                            >
                                {/* Quote icon */}
                                <div style={{ color: '#dbeafe' }}>
                                    <Quote size={36} fill="#dbeafe" strokeWidth={0} />
                                </div>

                                {/* Tag */}
                                <span style={{ display: 'inline-flex', width: 'fit-content', padding: '0.3rem 0.9rem', borderRadius: '99px', background: `${s.outcomeColor}15`, color: s.outcomeColor, fontWeight: 700, fontSize: '0.75rem' }}>
                                    {s.tag}
                                </span>

                                {/* Quote */}
                                <p style={{ color: '#334155', fontSize: '0.95rem', lineHeight: 1.75, fontStyle: 'italic', flex: 1 }}>
                                    "{s.quote}"
                                </p>

                                {/* Outcome badge */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '12px', background: `${s.outcomeColor}10`, width: 'fit-content' }}>
                                    <TrendingUp size={14} color={s.outcomeColor} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: s.outcomeColor }}>{s.outcome}</span>
                                </div>

                                {/* Author */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                                    <img src={s.img} alt={s.name} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
                                    <div>
                                        <p style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.1rem' }}>{s.name}</p>
                                        <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>{s.role} · {s.company}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2.5rem', background: '#1e3a8a', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '0.95rem', boxShadow: '0 8px 20px rgba(30,58,138,0.2)' }}>
                            Start Your Story <ArrowRight size={18} />
                        </Link>
                        <Link to="/#qa" style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                            Have questions? See our QA section
                        </Link>
                    </div>
                </div>
            </section>

            {/* Top Mentors */}
            <section style={{ padding: '6rem 2rem', maxWidth: '1300px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '3.5rem', textAlign: 'center', color: '#1e293b' }}>Discover Top Mentors in Africa</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                    {mentors.map((m, i) => (
                        <div key={i} style={{ background: 'white', borderRadius: '24px', padding: '1.25rem', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ width: '100%', height: '260px', borderRadius: '18px', overflow: 'hidden', marginBottom: '1.25rem' }}>
                                <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.2rem', color: '#1e293b' }}>{m.name}</h3>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', fontWeight: 600 }}>{m.role}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.25rem' }}>
                                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>{m.rating}</span>
                                <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>({m.reviews})</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700, borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
                                Experience <br />
                                <span style={{ color: '#1e293b', fontWeight: 900, fontSize: '0.9rem' }}>{m.exp}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Platform Stats */}
            <section style={{ padding: '6rem 2rem', background: '#f8fafc' }}>
                <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '4rem', textAlign: 'center', color: '#1e293b' }}>A Platform Made Just For You</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
                        {stats.map((s, i) => (
                            <div key={i} style={{ background: 'white', padding: '3.5rem 2rem', borderRadius: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', border: '1px solid rgba(0,0,0,0.03)' }}>
                                <div style={{ color: s.color, background: `${s.color}10`, padding: '1rem', borderRadius: '16px' }}>{s.icon}</div>
                                <div>
                                    <p style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: '0.25rem', color: '#1e293b', letterSpacing: '-1px' }}>{s.count}</p>
                                    <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.95rem' }}>{s.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* QA Section */}
            <section id="qa" style={{ padding: '8rem 2rem', background: 'white' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2563eb', marginBottom: '0.75rem' }}>Common Questions</p>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em', marginBottom: '1rem' }}>Questions & Answers</h2>
                        <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Everything you need to know about Africa's premier mentorship platform.</p>
                    </div>

                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {[
                            { q: "How does the AI matching work?", a: "Our AI analyzes over 20+ data points including your skills, career aspirations, and communication style to calculate a compatibility score, ensuring an outcome-focused match." },
                            { q: "Can I switch between being a mentor and a mentee?", a: "Yes! While you select a primary role during signup, your profile allows you to offer mentorship in areas of strength while seeking it in areas of growth." },
                            { q: "What makes MentorMatch different?", a: "We focus specifically on the African professional landscape, connecting talent with mentors who understand the unique challenges and opportunities in our markets." }
                        ].map((item, idx) => (
                            <div key={idx} style={{ padding: '2rem', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <HelpCircle size={20} color="#2563eb" /> {item.q}
                                </h3>
                                <p style={{ color: '#64748b', lineHeight: 1.7, fontWeight: 500 }}>{item.a}</p>
                            </div>
                        ))}
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '4rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '1.5rem' }}>
                            <Link to="/help" style={{ padding: '1rem 2rem', border: '2px solid #e2e8f0', borderRadius: '12px', textDecoration: 'none', color: '#1e293b', fontWeight: 800, fontSize: '0.95rem' }}>
                                See Full FAQ
                            </Link>
                            <Link to="/#success-stories" style={{ padding: '1rem 2rem', background: '#1e3a8a', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, fontSize: '0.95rem' }}>
                                See Success Stories
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: '#0f172a', color: 'white', padding: '6rem 2rem 3rem' }}>
                <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'grid', gridTemplateColumns: '2.5fr 1fr 1fr 1fr 2.5fr', gap: '4rem', marginBottom: '6rem', flexWrap: 'wrap' }}>

                    {/* Brand */}
                    <div>
                        <Logo size={28} color="white" />
                        <p style={{ opacity: 0.6, fontSize: '0.9rem', lineHeight: 1.6, marginTop: '1.5rem' }}>
                            Empowering tomorrow's leaders through meaningful mentorship connections across Africa.
                        </p>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1rem' }}>Product</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem' }}>
                            <a href="#how-it-works" style={footerLinkStyle}>How it Works</a>
                            <a href="#success-stories" style={footerLinkStyle}>Success Stories</a>
                            <Link to="/help" style={footerLinkStyle}>FAQs</Link>
                        </div>
                    </div>

                    {/* For Mentee */}
                    <div>
                        <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1rem' }}>For Mentee</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem' }}>
                            <Link to="/login?mode=signup" style={footerLinkStyle}>Find a Mentor</Link>
                            <Link to="/login" style={footerLinkStyle}>Log In</Link>
                            <Link to="/mentee-preferences" style={footerLinkStyle}>Set Preferences</Link>
                        </div>
                    </div>

                    {/* For Mentor */}
                    <div>
                        <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1rem' }}>For Mentor</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontSize: '0.9rem' }}>
                            <Link to="/login?mode=signup" style={footerLinkStyle}>Become a Mentor</Link>
                            <Link to="/login" style={footerLinkStyle}>Log In</Link>
                            <Link to="/dashboard" style={footerLinkStyle}>Dashboard</Link>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <h4 style={{ fontWeight: 800, marginBottom: '1.5rem', fontSize: '1rem' }}>Stay in the loop</h4>
                        <p style={{ opacity: 0.6, fontSize: '0.85rem', marginBottom: '1rem', lineHeight: 1.6 }}>Get updates on new mentors, feature releases, and community events.</p>
                        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <input
                                type="email"
                                placeholder="Email Address"
                                style={{ background: 'transparent', border: 'none', padding: '0.75rem 1rem', color: 'white', flex: 1, outline: 'none', fontSize: '0.9rem' }}
                            />
                            <button style={{ background: '#2563eb', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 800, cursor: 'pointer' }}>
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div style={{ maxWidth: '1300px', margin: '0 auto', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <p style={{ opacity: 0.4, fontSize: '0.8rem' }}>© 2026 MentorMatch. All rights reserved.</p>
                    <div style={{ display: 'flex', gap: '2rem', opacity: 0.4, fontSize: '0.8rem' }}>
                        <Link to="/help" style={{ color: 'white', textDecoration: 'none' }}>Privacy Policy</Link>
                        <Link to="/help" style={{ color: 'white', textDecoration: 'none' }}>Terms of Service</Link>
                        <Link to="/help" style={{ color: 'white', textDecoration: 'none' }}>Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
