import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Globe, MessageCircle, Clock, List, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, set as firebaseSet } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const COUNTRIES = ['Nigeria', 'South Africa', 'Kenya', 'Rwanda', 'Tunisia', 'Egypt', 'Ghana', 'Morocco', 'Uganda', 'Ethiopia'];
const LANGUAGES = ['English', 'French', 'Arabic', 'Portuguese', 'Swahili', 'Hausa', 'Amharic', 'Yoruba', 'Zulu', 'Afrikaans'];

const MenteePreferences = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [formData, setFormData] = useState({
        industries: [], companySize: [], preferredCountries: [], languages: [],
        mentoringStyle: '', sessionDuration: '', specificNeeds: [], priorities: []
    });

    const toggleItem = (field, item) => {
        setFormData(prev => ({ ...prev, [field]: prev[field].includes(item) ? prev[field].filter(i => i !== item) : [...prev[field], item] }));
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const updatedProfile = { ...profile, ...formData, skills: formData.industries || profile?.skills || [], onboarded: true, menteePreferencesComplete: true, updatedAt: new Date().toISOString() };
            await firebaseSet(ref(db, `users/${user.uid}`), updatedProfile);
            setTimeout(() => navigate('/dashboard'), 800);
        } catch (error) { alert(`Error: ${error.message}`); }
        finally { setLoading(false); }
    };

    const Section = ({ title, icon, color, children }) => (
        <div style={{ background: 'white', borderRadius: '24px', padding: isMobile ? '1.25rem' : '2rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
                <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>{title}</h2>
            </div>
            {children}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: isMobile ? '1.5rem 1rem' : '3rem 2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Logo size={24} color="#1e3a8a" />
                    <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 900, color: '#1e293b', marginTop: '1rem' }}>Matching Preferences</h1>
                    <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Help us find mentors that fit your specific needs.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <Section title="Expertise" icon={<Zap size={18} />} color="#3b82f6">
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
                            {['Products', 'Healthcare/Tech', 'AgTech', 'Media', 'Fintech', 'EdTech', 'AI/ML', 'SaaS'].map(opt => (
                                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={formData.industries.includes(opt)} onChange={() => toggleItem('industries', opt)} style={{ width: '16px', height: '16px' }} />
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </Section>

                    <Section title="Location" icon={<Globe size={18} />} color="#8b5cf6">
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
                            {COUNTRIES.slice(0, 6).map(opt => (
                                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                                    <input type="checkbox" checked={formData.preferredCountries.includes(opt)} onChange={() => toggleItem('preferredCountries', opt)} style={{ width: '16px', height: '16px' }} />
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </Section>

                    <Section title="Style" icon={<MessageCircle size={18} />} color="#10b981">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {['Direct and hands-on', 'Guidance and support', 'Goal-oriented'].map(opt => (
                                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                                    <input type="radio" name="style" checked={formData.mentoringStyle === opt} onChange={() => setFormData({ ...formData, mentoringStyle: opt })} />
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </Section>

                    <Section title="Priorities" icon={<Shield size={18} />} color="#6366f1">
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
                            {['Industry Experience', 'Startup Focus', 'Mentoring Style', 'Technical Expertise'].map(opt => (
                                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' }}>
                                    <input type="checkbox" checked={formData.priorities.includes(opt)} onChange={() => toggleItem('priorities', opt)} />
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </Section>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button onClick={() => navigate(-1)} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 800 }}>Back</button>
                        <button onClick={handleSubmit} style={{ flex: 2, padding: '0.8rem', borderRadius: '12px', background: '#1e3a8a', color: 'white', fontWeight: 800 }}>{loading ? 'Saving...' : 'Complete Setup'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenteePreferences;
