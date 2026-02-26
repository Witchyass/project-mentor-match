import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, GraduationCap, Star,
    ArrowLeft, ArrowRight, CheckCircle2, Globe, MessageCircle, Clock, List
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, update, set as firebaseSet } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const Onboarding = () => {
    const [step, setStep] = useState(1);
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [formData, setFormData] = useState({
        role: '', name: '', country: '', email: user?.email || '', career: '', company: '',
        interests: [], expertiseAreas: [], companySizePref: '', yearsExperience: '',
        preferredCountries: [], availability: [], languages: [], mentorshipStyle: '',
        sessionFrequency: '', sessionDuration: '', preferredDays: [], timeOfDay: '', bio: '', onboarded: true,
        customOther: ''
    });

    const [loading, setLoading] = useState(false);
    if (!user) return null;

    const validateStep = () => {
        if (step === 1 && !formData.role) return "Please select a role.";
        if (step === 2) {
            if (!formData.name.trim()) return "Full Name is required.";
            if (!formData.country.trim()) return "Country is required.";
            if (!formData.career.trim()) return "Career Title is required.";
            if (!formData.company.trim()) return "Company is required.";
        }
        if (step === 3) {
            const list = formData.role === 'mentor' ? formData.expertiseAreas : formData.interests;
            if (list.length === 0) return `Please select at least one ${formData.role === 'mentor' ? 'expertise area' : 'interest'}.`;
            if (list.includes('Other') && !formData.customOther.trim()) return "Please specify your 'Other' field.";
            if (formData.role === 'mentor' && !formData.yearsExperience) return "Please select your experience level.";
        }
        if (step === 4) {
            if (!formData.bio.trim()) return "Please tell us about your goals.";
            if (formData.role === 'mentor' && !formData.mentorshipStyle) return "Please select a mentorship style.";
        }
        return null;
    };

    const handleNext = () => {
        const errorMsg = validateStep();
        if (errorMsg) {
            alert(errorMsg);
            return;
        }
        setStep(step + 1);
    };
    const handleBack = () => setStep(step - 1);

    const toggleItem = (field, item) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(item) ? prev[field].filter(i => i !== item) : [...prev[field], item]
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const expLevelMap = { "1-2 Years": "Entry", "3-5 Years": "Mid-level", "5-10 Years": "Senior", "10+ Years": "Expert / Lead" };

            let finalSkills = formData.role === 'mentor' ? formData.expertiseAreas : formData.interests;
            if (finalSkills.includes('Other')) {
                finalSkills = finalSkills.filter(s => s !== 'Other');
                if (formData.customOther.trim()) {
                    finalSkills.push(formData.customOther.trim());
                }
            }

            const updatedProfile = {
                ...profile, ...formData,
                skills: finalSkills,
                experienceLevel: expLevelMap[formData.yearsExperience] || "Entry",
                onboarded: true, id: user.uid, email: user.email, updatedAt: new Date().toISOString()
            };
            delete updatedProfile.customOther;

            await firebaseSet(ref(db, `users/${user.uid}`), updatedProfile);
            setTimeout(() => navigate(formData.role === 'mentee' ? '/mentee-preferences' : '/dashboard'), 800);
        } catch (error) { alert(`Error: ${error.message}`); }
        finally { setLoading(false); }
    };

    const expertiseOptions = ["Products", "Healthcare/Tech", "AgTech", "Media & Entertainment", "Fintech", "EdTech", "DevTools", "AI/ML", "SaaS", "Web3/Crypto", "Mobile Apps", "Other"];
    const interestOptions = ["Product Management", "Software Development", "Design", "Data Science", "Marketing", "Finance", "Other"];
    const countryOptions = ["Nigeria", "South Africa", "Kenya", "Rwanda", "Tunisia", "Egypt", "Ghana", "Morocco", "Uganda", "Ethiopia", "Other"];
    const mentorshipStyles = ["Direct and hands-on", "Guidance and support", "Goal-oriented", "Collaborative"];
    const sessionDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', padding: isMobile ? '1.5rem 1rem' : '3rem 2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: isMobile ? '1.5rem' : '2.5rem' }}>
                    <Logo size={isMobile ? 24 : 32} showText={false} />
                    <h1 style={{ fontSize: isMobile ? '1.6rem' : '2.4rem', fontWeight: 900, color: '#1e293b', marginTop: '1rem', letterSpacing: '-0.02em' }}>
                        {formData.role === 'mentor' ? 'Become a Mentor' : 'Join MentorMatch'}
                    </h1>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '0.75rem' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} style={{ height: '5px', flex: 1, background: i <= step ? '#1e3a8a' : '#e2e8f0', borderRadius: '10px' }} />
                        ))}
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#475569', fontWeight: 700 }}>Step {step} of 5</p>
                </div>

                <motion.div key={step} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', borderRadius: '24px', padding: isMobile ? '1.5rem' : '3rem', border: '1px solid #f1f5f9', minHeight: isMobile ? 'auto' : '500px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1 }}>
                        {step === 1 && (
                            <div>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', marginBottom: '2rem' }}>What's your goal?</h2>
                                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '1rem' }}>
                                    {['mentee', 'mentor'].map(r => (
                                        <button key={r} onClick={() => setFormData({ ...formData, role: r })} style={{ flex: 1, padding: '1.5rem', borderRadius: '16px', border: formData.role === r ? '2px solid #1e3a8a' : '1.5px solid #e2e8f0', background: 'white', textAlign: 'left', cursor: 'pointer' }}>
                                            <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{r === 'mentee' ? '🎓' : '🌟'}</div>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>I'm a {r.charAt(0).toUpperCase() + r.slice(1)}</h3>
                                            <p style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.4rem' }}>{r === 'mentee' ? 'Looking to grow' : 'Sharing my knowledge'}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem' }}>Basic Info</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {[{ lbl: 'Full Name', k: 'name' }, { lbl: 'Country', k: 'country' }, { lbl: 'Career Title', k: 'career' }, { lbl: 'Company', k: 'company' }].map(f => (
                                        <div key={f.k}>
                                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '0.4rem' }}>{f.lbl}</label>
                                            <input type="text" value={formData[f.k]} onChange={e => setFormData({ ...formData, [f.k]: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none' }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem' }}>Expertise & Experience</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ fontWeight: 800, fontSize: '0.9rem', display: 'block', marginBottom: '0.75rem', color: '#1e293b' }}>Industries / Interests</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.6rem' }}>
                                            {(formData.role === 'mentor' ? expertiseOptions : interestOptions).map(o => (
                                                <label key={o} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: '#1e293b' }}>
                                                    <input type="checkbox" checked={(formData.role === 'mentor' ? formData.expertiseAreas : formData.interests).includes(o)} onChange={() => toggleItem(formData.role === 'mentor' ? 'expertiseAreas' : 'interests', o)} style={{ width: '16px', height: '16px' }} />
                                                    {o}
                                                </label>
                                            ))}
                                        </div>
                                        {(formData.role === 'mentor' ? formData.expertiseAreas : formData.interests).includes('Other') && (
                                            <div style={{ marginTop: '0.75rem' }}>
                                                <input
                                                    type="text"
                                                    placeholder="Specify your field..."
                                                    value={formData.customOther}
                                                    onChange={e => setFormData({ ...formData, customOther: e.target.value })}
                                                    style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', outline: 'none', fontSize: '0.85rem' }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {formData.role === 'mentor' && (
                                        <div>
                                            <label style={{ fontWeight: 800, fontSize: '0.9rem', display: 'block', marginBottom: '0.75rem', color: '#1e293b' }}>Experience Level</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0.6rem' }}>
                                                {["1-2 Years", "3-5 Years", "5-10 Years", "10+ Years"].map(o => (
                                                    <label key={o} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#1e293b' }}>
                                                        <input type="radio" name="exp" checked={formData.yearsExperience === o} onChange={() => setFormData({ ...formData, yearsExperience: o })} />
                                                        {o}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e293b' }}>Preferences</h2>
                                <div>
                                    <label style={{ fontWeight: 800, fontSize: '0.9rem', display: 'block', marginBottom: '0.75rem', color: '#1e293b' }}>Tell us about your goals</label>
                                    <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '10px', border: '1px solid #e2e8f0', minHeight: '100px', outline: 'none' }} />
                                </div>
                                {formData.role === 'mentor' && (
                                    <div>
                                        <label style={{ fontWeight: 800, fontSize: '0.9rem', display: 'block', marginBottom: '0.75rem', color: '#1e293b' }}>Mentorship Style</label>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {mentorshipStyles.map(s => (
                                                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#1e293b' }}>
                                                    <input type="radio" name="style" checked={formData.mentorshipStyle === s} onChange={() => setFormData({ ...formData, mentorshipStyle: s })} />
                                                    {s}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 5 && (
                            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <CheckCircle2 size={60} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Ready to go!</h2>
                                <p style={{ fontSize: '0.9rem', color: '#475569' }}>Your customized profile will help us find the best matches.</p>
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                        <button onClick={handleBack} disabled={step === 1} style={{ flex: 1, padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', color: '#1e293b', fontWeight: 700, cursor: 'pointer' }}>Back</button>
                        <button onClick={step === 5 ? handleSubmit : handleNext} disabled={step === 1 && !formData.role || loading} style={{ flex: 2, padding: '0.8rem', borderRadius: '12px', background: '#1e3a8a', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>{loading ? 'Saving...' : (step === 5 ? 'Done' : 'Continue')}</button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Onboarding;
