import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HelpCircle, ChevronDown, Search, MessageSquare, Zap, Shield, Mail, ArrowRight } from 'lucide-react';

const HelpPage = () => {
    const [activeId, setActiveId] = useState(null);
    const [search, setSearch] = useState('');

    const faqs = [
        {
            id: 1,
            q: "How does the AI matching work?",
            a: "Our AI analyzes over 20+ data points including your skills, career aspirations, and communication style to calculate a compatibility score with potential mentors, ensuring an outcome-focused match.",
            category: "Platform"
        },
        {
            id: 2,
            q: "Can I switch between being a mentor and a mentee?",
            a: "Yes! During signup you select a primary role, but your profile allows you to offer mentorship in areas of strength while seeking mentorship in areas of growth.",
            category: "Account"
        },
        {
            id: 3,
            q: "How are mentors verified?",
            a: "All mentors go through a background verification process, including LinkedIn profile validation and sometimes a brief screening call to ensure the highest quality of guidance.",
            category: "Safety"
        },
        {
            id: 4,
            q: "Is there a limit on messaging?",
            a: "Once you match, messaging is unlimited. We encourage you to use our AI Ice Breakers to get the conversation started effectively.",
            category: "Messaging"
        }
    ];

    const filteredFaqs = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div style={{ width: '64px', height: '64px', background: 'var(--glass)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
                    <HelpCircle size={32} />
                </div>
                <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>How can we help?</h1>
                <p style={{ opacity: 0.6 }}>Find answers to common questions about Mentor Match.</p>
            </div>

            <div style={{ position: 'relative', marginBottom: '4rem' }}>
                <Search size={20} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
                <input
                    className="glass"
                    placeholder="Search for questions..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ width: '100%', padding: '1.25rem 1.25rem 1.25rem 3.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', fontSize: '1.125rem', color: 'inherit' }}
                />
            </div>

            <div style={{ display: 'grid', gap: '1rem', marginBottom: '6rem' }}>
                {filteredFaqs.map(faq => (
                    <div key={faq.id} className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                        <button
                            onClick={() => setActiveId(activeId === faq.id ? null : faq.id)}
                            style={{ width: '100%', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', textAlign: 'left' }}
                        >
                            <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>{faq.q}</span>
                            <motion.div animate={{ rotate: activeId === faq.id ? 180 : 0 }}>
                                <ChevronDown opacity={0.5} />
                            </motion.div>
                        </button>
                        <AnimatePresence>
                            {activeId === faq.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div style={{ padding: '0 2rem 1.5rem', opacity: 0.7, lineHeight: 1.7 }}>
                                        {faq.a}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            {/* Support CTA */}
            <div className="glass" style={{ padding: '3rem', borderRadius: 'var(--radius-xl)', textAlign: 'center', background: 'var(--gradient-premium)', border: 'none' }}>
                <h2 style={{ color: 'white', marginBottom: '1rem' }}>Still have questions?</h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>Our support team is available 24/7 to help you along your journey.</p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button className="btn" style={{ background: 'white', color: 'var(--primary)' }}>
                        <Mail size={18} /> Contact Support
                    </button>
                    <Link to="/#success-stories" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        See Success Stories <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HelpPage;
