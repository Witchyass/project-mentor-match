import React, { useState, useEffect } from 'react';
import { Globe, MessageCircle, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, set as firebaseSet } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const COUNTRIES = ['Nigeria', 'South Africa', 'Kenya', 'Rwanda', 'Tunisia', 'Egypt', 'Ghana', 'Morocco', 'Uganda', 'Ethiopia'];

/* Reusable pill chip — no layout shift, smooth transitions */
const Chip = ({ label, selected, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        onMouseDown={e => e.preventDefault()} // prevents browser focus-scroll jump on click
        style={{
            padding: '0.45rem 1rem',
            borderRadius: '100px',
            border: `1.5px solid ${selected ? '#1e3a8a' : '#e2e8f0'}`,
            background: selected ? '#1e3a8a' : 'white',
            color: selected ? 'white' : '#475569',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.18s ease',
            userSelect: 'none',
            flexShrink: 0,
        }}
    >
        {label}
    </button>
);

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
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(item)
                ? prev[field].filter(i => i !== item)
                : [...prev[field], item]
        }));
    };

    const setRadio = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const [showOtherInput, setShowOtherInput] = useState(false);
    const [otherCountryInput, setOtherCountryInput] = useState('');

    const addCustomCountry = () => {
        const val = otherCountryInput.trim();
        if (val && !formData.preferredCountries.includes(val)) {
            setFormData(prev => ({ ...prev, preferredCountries: [...prev.preferredCountries, val] }));
        }
        setOtherCountryInput('');
        setShowOtherInput(false);
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const updatedProfile = {
                ...profile, ...formData,
                skills: formData.industries || profile?.skills || [],
                onboarded: true,
                menteePreferencesComplete: true,
                updatedAt: new Date().toISOString()
            };
            await firebaseSet(ref(db, `users/${user.uid}`), updatedProfile);
            setTimeout(() => navigate('/dashboard'), 800);
        } catch (error) { alert(`Error: ${error.message}`); }
        finally { setLoading(false); }
    };

    /* Section wrapper */
    const Section = ({ title, icon, children }) => (
        <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: isMobile ? '1.25rem' : '1.75rem',
            border: '1px solid #f1f5f9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.1rem' }}>
                <span style={{ color: '#1e3a8a' }}>{icon}</span>
                <h2 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>{title}</h2>
            </div>
            {children}
        </div>
    );

    /* Chip row — wraps naturally, no grid shift */
    const ChipRow = ({ field, options, radio = false }) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {options.map(opt => (
                <Chip
                    key={opt}
                    label={opt}
                    selected={radio ? formData[field] === opt : formData[field].includes(opt)}
                    onClick={() => radio ? setRadio(field, opt) : toggleItem(field, opt)}
                />
            ))}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: isMobile ? '1.5rem 1rem' : '3rem 2rem' }}>
            <div style={{ maxWidth: '720px', margin: '0 auto' }}>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Logo size={24} color="#1e3a8a" />
                    <h1 style={{ fontSize: isMobile ? '1.4rem' : '1.9rem', fontWeight: 900, color: '#1e293b', marginTop: '1rem' }}>
                        Matching Preferences
                    </h1>
                    <p style={{ color: '#475569', fontSize: '0.85rem', marginTop: '0.4rem' }}>
                        Help us find mentors that fit your specific needs.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    <Section title="Expertise" icon={<Zap size={17} />}>
                        <ChipRow
                            field="industries"
                            options={['Products', 'Healthcare/Tech', 'AgTech', 'Media', 'Fintech', 'EdTech', 'AI/ML', 'SaaS']}
                        />
                    </Section>

                    <Section title="Preferred Location" icon={<Globe size={17} />}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
                            {/* Preset countries */}
                            {COUNTRIES.slice(0, 6).map(opt => (
                                <Chip
                                    key={opt}
                                    label={opt}
                                    selected={formData.preferredCountries.includes(opt)}
                                    onClick={() => toggleItem('preferredCountries', opt)}
                                />
                            ))}
                            {/* Custom countries added by user */}
                            {formData.preferredCountries
                                .filter(c => !COUNTRIES.includes(c))
                                .map(c => (
                                    <Chip
                                        key={c}
                                        label={`${c} ✕`}
                                        selected={true}
                                        onClick={() => toggleItem('preferredCountries', c)}
                                    />
                                ))}
                            {/* Other: toggle between chip and text input */}
                            {!showOtherInput ? (
                                <Chip label="+ Other" selected={false} onClick={() => setShowOtherInput(true)} />
                            ) : (
                                <input
                                    autoFocus
                                    value={otherCountryInput}
                                    onChange={e => setOtherCountryInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') { e.preventDefault(); addCustomCountry(); }
                                        if (e.key === 'Escape') { setShowOtherInput(false); setOtherCountryInput(''); }
                                    }}
                                    onBlur={addCustomCountry}
                                    placeholder="Type country, press Enter"
                                    style={{
                                        padding: '0.4rem 0.85rem',
                                        borderRadius: '100px',
                                        border: '1.5px solid #1e3a8a',
                                        fontSize: '0.82rem',
                                        fontWeight: 600,
                                        outline: 'none',
                                        width: '195px',
                                        color: '#1e293b',
                                    }}
                                />
                            )}
                        </div>
                    </Section>

                    <Section title="Mentoring Style" icon={<MessageCircle size={17} />}>
                        <ChipRow
                            field="mentoringStyle"
                            options={['Direct and hands-on', 'Guidance and support', 'Goal-oriented']}
                            radio
                        />
                    </Section>

                    <Section title="Priorities" icon={<Shield size={17} />}>
                        <ChipRow
                            field="priorities"
                            options={['Industry Experience', 'Startup Focus', 'Mentoring Style', 'Technical Expertise']}
                        />
                    </Section>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                flex: 1, padding: '0.85rem', borderRadius: '12px',
                                border: '1px solid #e2e8f0', background: 'white',
                                fontWeight: 800, color: '#475569', cursor: 'pointer'
                            }}
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSubmit}
                            style={{
                                flex: 2, padding: '0.85rem', borderRadius: '12px',
                                background: '#1e3a8a', color: 'white',
                                fontWeight: 800, border: 'none', cursor: 'pointer'
                            }}
                        >
                            {loading ? 'Saving...' : 'Complete Setup'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MenteePreferences;
