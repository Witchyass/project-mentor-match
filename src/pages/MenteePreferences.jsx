import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, GraduationCap, Star,
    ArrowLeft, ArrowRight, CheckCircle2, Globe, MessageCircle, Clock, List,
    Target, Layout, Users, Shield, Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, update } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const COUNTRIES = ['Nigeria', 'South Africa', 'Kenya', 'Rwanda', 'Tunisia', 'Egypt', 'Ghana', 'Morocco', 'Uganda', 'Ethiopia'];
const LANGUAGES = ['English', 'French', 'Arabic', 'Portuguese', 'Swahili', 'Hausa', 'Amharic', 'Yoruba', 'Zulu', 'Afrikaans'];

const MenteePreferences = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // "Other" text inputs for location & language
    const [otherCountry, setOtherCountry] = useState('');
    const [otherLanguage, setOtherLanguage] = useState('');
    const [showOtherCountry, setShowOtherCountry] = useState(false);
    const [showOtherLanguage, setShowOtherLanguage] = useState(false);

    const [formData, setFormData] = useState({
        // Mentor Background
        industries: [],
        companySize: [],
        mentorExperience: '',

        // Location & Language
        preferredCountries: [],
        languages: [],
        timeZone: '',

        // Communication Style
        mentoringStyle: '',
        communicationStyle: '',
        responseTime: '',

        // Session Preferences
        sessionFrequency: '',
        sessionDuration: '',
        preferredDays: [],
        timeOfDay: '',

        // Additional
        specificNeeds: '',
        idealMentor: '',

        // Matching Priorities
        priorities: [],
        budget: ''
    });

    const toggleItem = (field, item) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(item)
                ? prev[field].filter(i => i !== item)
                : [...prev[field], item]
        }));
    };

    // Select All / Deselect All for a field against a list
    const toggleSelectAll = (field, list) => {
        const allSelected = list.every(item => formData[field].includes(item));
        setFormData(prev => ({
            ...prev,
            [field]: allSelected ? prev[field].filter(i => !list.includes(i)) : [...new Set([...prev[field], ...list])]
        }));
    };

    // Commit an "Other" typed value into the array
    const commitOther = (field, value, setter, setShow) => {
        const trimmed = value.trim();
        if (!trimmed) return;
        if (!formData[field].includes(trimmed)) {
            setFormData(prev => ({ ...prev, [field]: [...prev[field], trimmed] }));
        }
        setter('');
        setShow(false);
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const userRef = ref(db, `users/${user.uid}`);

            // Merge existing profile with new form data and harmonize for recommendations
            const updatedProfile = {
                ...profile,
                ...formData,
                skills: formData.industries || profile?.skills || [], // Map industry pref to skills for matching
                onboarded: true,
                menteePreferencesComplete: true,
                updatedAt: new Date().toISOString()
            };

            const { set: firebaseSet } = await import('firebase/database');
            await firebaseSet(userRef, updatedProfile);

            console.log("✅ Mentee preferences saved!");

            // Brief delay for sync
            setTimeout(() => {
                navigate('/dashboard');
            }, 800);

        } catch (error) {
            console.error("❌ Error saving preferences:", error);
            alert(`Failed to save preferences: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const sections = [
        {
            id: 'background',
            title: 'Mentor Background',
            subtitle: 'What type of mentor experience fits labels best?',
            icon: <Zap size={20} color="#3b82f6" />,
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '1.25rem' }}>Individuality Parameters</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {['Products', 'Healthcare/Tech', 'AgTech', 'Media & Entertainment', 'Fintech', 'EdTech', 'DevTools', 'AI/ML', 'SaaS', 'Web3/Crypto'].map(opt => (
                                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b' }}>
                                    <input type="checkbox" checked={formData.industries.includes(opt)} onChange={() => toggleItem('industries', opt)} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '1.25rem' }}>Company Size Experience</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {['Startup (1-10)', 'Mid-sized (11-50)', 'Growth (51-500)', 'Enterprise (500+)'].map(opt => (
                                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b' }}>
                                    <input type="checkbox" checked={formData.companySize.includes(opt)} onChange={() => toggleItem('companySize', opt)} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'location',
            title: 'Location & Language',
            subtitle: 'Where should your mentor be based?',
            icon: <Globe size={20} color="#8b5cf6" />,
            content: (() => {
                const allCountriesSelected = COUNTRIES.every(c => formData.preferredCountries.includes(c));
                const allLangsSelected = LANGUAGES.every(l => formData.languages.includes(l));

                // Custom (Other) values currently saved
                const customCountries = formData.preferredCountries.filter(c => !COUNTRIES.includes(c));
                const customLanguages = formData.languages.filter(l => !LANGUAGES.includes(l));

                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* ── Preferred Countries ── */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', margin: 0 }}>Preferred Countries</p>
                                <button
                                    type="button"
                                    onClick={() => toggleSelectAll('preferredCountries', COUNTRIES)}
                                    style={{
                                        background: allCountriesSelected ? '#eff6ff' : '#f8fafc',
                                        border: `1.5px solid ${allCountriesSelected ? '#93c5fd' : '#e2e8f0'}`,
                                        color: allCountriesSelected ? '#2563eb' : '#64748b',
                                        padding: '0.3rem 0.9rem', borderRadius: '99px',
                                        fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: '0.2s'
                                    }}
                                >
                                    {allCountriesSelected ? '✓ All Selected' : 'Select All'}
                                </button>
                            </div>

                            {/* Custom tags */}
                            {customCountries.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                                    {customCountries.map(c => (
                                        <span key={c} style={{
                                            background: '#eff6ff', border: '1px solid #93c5fd', color: '#1d4ed8',
                                            padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.78rem',
                                            fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem'
                                        }}>
                                            {c}
                                            <button type="button" onClick={() => toggleItem('preferredCountries', c)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#93c5fd', lineHeight: 1, padding: 0, fontSize: '1rem' }}>×</button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                {COUNTRIES.map(opt => (
                                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b' }}>
                                        <input type="checkbox" checked={formData.preferredCountries.includes(opt)} onChange={() => toggleItem('preferredCountries', opt)} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                                        {opt}
                                    </label>
                                ))}

                                {/* Other checkbox */}
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b' }}>
                                    <input type="checkbox" checked={showOtherCountry} onChange={e => setShowOtherCountry(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                                    Other
                                </label>
                            </div>

                            {/* Other text input */}
                            {showOtherCountry && (
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={otherCountry}
                                        onChange={e => setOtherCountry(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && commitOther('preferredCountries', otherCountry, setOtherCountry, setShowOtherCountry)}
                                        placeholder="Type a country and press Add"
                                        style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '10px', border: '1.5px solid #93c5fd', fontSize: '0.85rem', outline: 'none', background: '#f8fafc' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => commitOther('preferredCountries', otherCountry, setOtherCountry, setShowOtherCountry)}
                                        style={{ padding: '0.6rem 1.1rem', borderRadius: '10px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                                    >
                                        Add
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* ── Languages ── */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', margin: 0 }}>Preferred Languages</p>
                                <button
                                    type="button"
                                    onClick={() => toggleSelectAll('languages', LANGUAGES)}
                                    style={{
                                        background: allLangsSelected ? '#eff6ff' : '#f8fafc',
                                        border: `1.5px solid ${allLangsSelected ? '#93c5fd' : '#e2e8f0'}`,
                                        color: allLangsSelected ? '#2563eb' : '#64748b',
                                        padding: '0.3rem 0.9rem', borderRadius: '99px',
                                        fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: '0.2s'
                                    }}
                                >
                                    {allLangsSelected ? '✓ All Selected' : 'Select All'}
                                </button>
                            </div>

                            {/* Custom tags */}
                            {customLanguages.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                                    {customLanguages.map(l => (
                                        <span key={l} style={{
                                            background: '#eff6ff', border: '1px solid #93c5fd', color: '#1d4ed8',
                                            padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.78rem',
                                            fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem'
                                        }}>
                                            {l}
                                            <button type="button" onClick={() => toggleItem('languages', l)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#93c5fd', lineHeight: 1, padding: 0, fontSize: '1rem' }}>×</button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                {LANGUAGES.map(opt => (
                                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b' }}>
                                        <input type="checkbox" checked={formData.languages.includes(opt)} onChange={() => toggleItem('languages', opt)} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                                        {opt}
                                    </label>
                                ))}

                                {/* Other checkbox */}
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b' }}>
                                    <input type="checkbox" checked={showOtherLanguage} onChange={e => setShowOtherLanguage(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                                    Other
                                </label>
                            </div>

                            {/* Other text input */}
                            {showOtherLanguage && (
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={otherLanguage}
                                        onChange={e => setOtherLanguage(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && commitOther('languages', otherLanguage, setOtherLanguage, setShowOtherLanguage)}
                                        placeholder="Type a language and press Add"
                                        style={{ flex: 1, padding: '0.6rem 1rem', borderRadius: '10px', border: '1.5px solid #93c5fd', fontSize: '0.85rem', outline: 'none', background: '#f8fafc' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => commitOther('languages', otherLanguage, setOtherLanguage, setShowOtherLanguage)}
                                        style={{ padding: '0.6rem 1.1rem', borderRadius: '10px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                                    >
                                        Add
                                    </button>
                                </div>
                            )}
                        </div>

                    </div>
                );
            })()
        },
        {
            id: 'communication',
            title: 'Communication Style',
            subtitle: 'How do you prefer to interact?',
            icon: <MessageCircle size={20} color="#10b981" />,
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {['Direct and hands-on', 'Guidance and support', 'Goal-oriented', 'Collaborative'].map(opt => (
                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b' }}>
                            <input type="radio" name="mentoringStyle" checked={formData.mentoringStyle === opt} onChange={() => setFormData({ ...formData, mentoringStyle: opt })} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                            {opt}
                        </label>
                    ))}
                </div>
            )
        },
        {
            id: 'sessions',
            title: 'Session Preferences',
            subtitle: 'Physical or Video based learning?',
            icon: <Clock size={20} color="#f59e0b" />,
            content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '1.25rem' }}>Session Duration</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {['30 Minutes', '45 Minutes', '1 Hour'].map(opt => (
                                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b' }}>
                                    <input type="radio" name="duration" checked={formData.sessionDuration === opt} onChange={() => setFormData({ ...formData, sessionDuration: opt })} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#eef2f6', padding: '4rem 2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <Logo size={24} color="#1e3a8a" />
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Find Your Perfect Mentor Match</h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Fill out your preferences so we can match you with the best mentor.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {sections.map(section => (
                        <div key={section.id} style={{
                            background: 'white',
                            borderRadius: '20px',
                            padding: '2rem',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '10px',
                                    background: '#f8fafc',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {section.icon}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{section.title}</h2>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{section.subtitle}</p>
                                </div>
                            </div>
                            {section.content}
                        </div>
                    ))}

                    {/* Additional Preferences */}
                    <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <List size={20} color="#ec4899" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>Additional Preferences</h2>
                                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Anything else you'd like to share?</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem' }}>Specific Needs or Requirements</label>
                                <textarea
                                    placeholder="e.g., Looking for someone with experience in transitioning from engineering to product..."
                                    value={formData.specificNeeds}
                                    onChange={(e) => setFormData({ ...formData, specificNeeds: e.target.value })}
                                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: '#f8fafc', border: 'none', fontSize: '0.85rem', minHeight: '80px', outline: 'none', resize: 'none' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Matching Priorities */}
                    <div style={{ background: 'white', borderRadius: '20px', padding: '2rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Shield size={20} color="#6366f1" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>Matching Priorities</h2>
                                <p style={{ fontSize: '0.8rem', color: '#64748b' }}>What matters most?</p>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            {['Industry Experience', 'Startup Experience', 'Mentoring Style', 'Technical Expertise', 'Company Culture'].map(opt => (
                                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', color: '#64748b' }}>
                                    <input type="checkbox" checked={formData.priorities.includes(opt)} onChange={() => toggleItem('priorities', opt)} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Footer Nav */}
                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2rem' }}>
                        <button onClick={() => navigate(-1)} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1.5px solid #cbd5e1', background: 'white', color: '#1e293b', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <ChevronLeft size={18} /> Back
                        </button>
                        <button onClick={handleSubmit} style={{ flex: 2, padding: '1rem', borderRadius: '12px', border: 'none', background: '#1a365d', color: 'white', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            {loading ? 'Saving...' : 'Continue'} <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenteePreferences;
