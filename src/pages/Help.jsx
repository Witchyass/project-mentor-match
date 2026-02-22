import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, Search, MessageSquare, Zap, Shield, Mail, ArrowRight } from 'lucide-react';

const HelpPage = () => {
    const [activeId, setActiveId] = useState(null);
    const [search, setSearch] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const faqs = [
        { id: 1, q: "How does the AI matching work?", a: "Our AI analyzes over 20+ data points including your skills, career aspirations, and communication style to calculate a compatibility score." },
        { id: 2, q: "Can I switch roles?", a: "Yes! You can seek mentorship while offering it in other areas." },
        { id: 3, q: "Are mentors verified?", a: "All mentors go through a background verification process including LinkedIn validation." },
        { id: 4, q: "Is there a messaging limit?", a: "Once you match, messaging is unlimited." }
    ];

    const filteredFaqs = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
            <div style={{ textAlign: 'center', marginBottom: isMobile ? '2rem' : '3.5rem' }}>
                <div style={{ width: '56px', height: '56px', background: '#eff6ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#1e3a8a' }}>
                    <HelpCircle size={28} />
                </div>
                <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.8rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>How can we help?</h1>
                <p style={{ color: '#64748b', marginTop: '0.5rem', fontSize: '0.95rem' }}>Find answers to common questions about Mentor Match.</p>
            </div>

            <div style={{ position: 'relative', marginBottom: isMobile ? '1.5rem' : '2.5rem' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                    placeholder="Search help topics..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
                />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '3rem' }}>
                {filteredFaqs.map(faq => (
                    <div key={faq.id} style={{ background: 'white', borderRadius: '16px', border: '1px solid #f1f5f9', overflow: 'hidden' }}>
                        <button
                            onClick={() => setActiveId(activeId === faq.id ? null : faq.id)}
                            style={{ width: '100%', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer' }}
                        >
                            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b', flex: 1 }}>{faq.q}</span>
                            <motion.div animate={{ rotate: activeId === faq.id ? 180 : 0 }}>
                                <ChevronDown size={18} color="#94a3b8" />
                            </motion.div>
                        </button>
                        <AnimatePresence>
                            {activeId === faq.id && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                    <div style={{ padding: '0 1.25rem 1.25rem', color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>{faq.a}</div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            <div style={{ background: '#1e3a8a', padding: isMobile ? '2rem' : '3rem', borderRadius: '24px', textAlign: 'center', color: 'white' }}>
                <h2 style={{ fontSize: isMobile ? '1.3rem' : '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>Still need help?</h2>
                <p style={{ opacity: 0.8, fontSize: '0.9rem', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 2rem' }}>Our support team is ready to assist you on your mentorship journey.</p>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn" style={{ background: 'white', color: '#1e3a8a', padding: '0.8rem 1.5rem', borderRadius: '10px' }}>Contact Support</button>
                    <Link to="/#success-stories" style={{ color: 'white', fontSize: '0.9rem', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>Success Stories <ArrowRight size={16} /></Link>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;
