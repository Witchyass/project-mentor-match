import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, GraduationCap, Star,
    ArrowLeft, ArrowRight, CheckCircle2, Globe, MessageCircle, Clock, List
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { ref, update } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const Onboarding = () => {
    const [step, setStep] = useState(1);
    const { user, profile } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        role: '',
        name: '',
        country: '',
        email: user?.email || '',
        career: '',
        company: '',
        interests: [], // For mentees: what they want to learn
        expertiseAreas: [], // For mentors: what they teach
        companySizePref: '',
        yearsExperience: '',
        preferredCountries: [],
        availability: [], // Mentee availability selection
        languages: [],
        mentorshipStyle: '',
        sessionFrequency: '',
        sessionDuration: '',
        preferredDays: [],
        timeOfDay: '',
        bio: '',
        onboarded: true
    });

    const [loading, setLoading] = useState(false);

    if (!user) return null; // Safety check

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    const toggleItem = (field, item) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(item)
                ? prev[field].filter(i => i !== item)
                : [...prev[field], item]
        }));
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const userRef = ref(db, `users/${user.uid}`);
            // Harmonize data for AI Matching Engine
            const skills = formData.role === 'mentor' ? formData.expertiseAreas : formData.interests;

            // Map years to semantic levels the engine understands
            const expLevelMap = {
                "1-2 Years": "Entry",
                "3-5 Years": "Mid-level",
                "5-10 Years": "Senior",
                "10+ Years": "Expert / Lead"
            };

            const updatedProfile = {
                ...profile,
                ...formData,
                skills: skills || [],
                experienceLevel: expLevelMap[formData.yearsExperience] || "Entry",
                availability: Array.isArray(formData.availability) ? formData.availability[0] : (formData.availability || "Flexible"),
                onboarded: true,
                id: user.uid,
                email: user.email,
                updatedAt: new Date().toISOString()
            };

            console.log("📤 Saving profile to Firebase:", updatedProfile);

            // Use set directly on the user node for better permission stability
            const { set: firebaseSet } = await import('firebase/database');
            await firebaseSet(userRef, updatedProfile);

            console.log("✅ Profile saved successfully!");

            // Brief delay to allow onValue listener in AuthContext to sync before we navigate
            // This prevents App.jsx from seeing the "old" onboarded=false state and redirecting back
            setTimeout(() => {
                if (formData.role === 'mentee') {
                    console.log("➡️ Navigating to Mentee Preferences");
                    navigate('/mentee-preferences');
                } else {
                    console.log("➡️ Navigating to Dashboard");
                    navigate('/dashboard');
                }
            }, 800);

        } catch (error) {
            console.error("❌ Error saving onboarding:", error);
            alert(`Failed to save profile: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Options from template
    const expertiseOptions = ["Products", "Healthcare/Tech", "AgTech", "Media & Entertainment", "Fintech", "EdTech", "DevTools", "AI/ML", "SaaS", "Web3/Crypto", "Mobile Apps"];
    const countryOptions = ["Nigeria", "South Africa", "Kenya", "Rwanda", "Tunisia", "Egypt", "Ghana", "Morocco", "Uganda", "Ethiopia", "Other"];
    const langOptions = ["English", "French", "Arabic", "Swahili", "Zulu", "Yoruba", "Igbo", "Hausa", "Amharic", "Portuguese"];
    const mentorshipStyles = ["Direct and hands-on", "Guidance and support", "Goal-oriented", "Collaborative"];
    const sessionDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    return (
        <div style={{ minHeight: '100vh', background: '#eef2f6', padding: '4rem 2rem' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <div style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
                        <Logo size={32} showText={false} />
                    </div>
                    <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                        {formData.role === 'mentor' ? 'Become a Master Mentor' : 'Let\'s Get You Started'}
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>
                        {formData.role === 'mentor' ? 'Share your expertise and shape the future of African talent' : 'We\'ll match you with the perfect mentor in just a few steps'}
                    </p>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} style={{
                                height: '6px',
                                flex: 1,
                                background: i <= step ? '#2563eb' : '#cbd5e1',
                                borderRadius: '10px'
                            }} />
                        ))}
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>
                        Step {step} of 5
                    </p>
                </div>

                {/* Card Container */}
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'white',
                        borderRadius: '32px',
                        padding: '4rem',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
                        minHeight: '600px',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <div style={{ flex: 1 }}>
                        {step === 1 && (
                            <div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>What brings you here?</h2>
                                <p style={{ color: '#64748b', marginBottom: '3rem', fontWeight: 500 }}>Choose the role that best describes you</p>

                                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => setFormData({ ...formData, role: 'mentee' })}
                                        style={{ flex: 1, minWidth: '300px', padding: '2.5rem', borderRadius: '20px', border: formData.role === 'mentee' ? '2px solid #1e293b' : '1.5px solid #cbd5e1', background: 'white', textAlign: 'left', cursor: 'pointer', transition: '0.3s' }}
                                    >
                                        <div style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>🎓</div>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>I'm a Mentee</h3>
                                        <p style={{ color: '#64748b', lineHeight: 1.5, fontSize: '0.95rem' }}>Looking for guidance and advice to advance my career</p>
                                    </button>

                                    <button
                                        onClick={() => setFormData({ ...formData, role: 'mentor' })}
                                        style={{ flex: 1, minWidth: '300px', padding: '2.5rem', borderRadius: '20px', border: formData.role === 'mentor' ? '2px solid #1e293b' : '1.5px solid #cbd5e1', background: 'white', textAlign: 'left', cursor: 'pointer', transition: '0.3s' }}
                                    >
                                        <div style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>🌟</div>
                                        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.75rem' }}>I'm a Mentor</h3>
                                        <p style={{ color: '#64748b', lineHeight: 1.5, fontSize: '0.95rem' }}>Ready to share my experience and help others grow</p>
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>Tell us about yourself</h2>
                                <p style={{ color: '#64748b', marginBottom: '3rem', fontWeight: 500 }}>Help us personalize your experience</p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
                                    {[
                                        { label: 'Full Name', key: 'name', placeholder: 'John Doe' },
                                        { label: 'Country', key: 'country', placeholder: 'South Africa' },
                                        { label: 'Email', key: 'email', placeholder: 'johndoe@gmail.com', disabled: true },
                                        { label: 'Professional Title', key: 'career', placeholder: 'e.g. Senior Software Architect' },
                                        { label: 'Company', key: 'company', placeholder: 'e.g. Google' },
                                    ].map(field => (
                                        <div key={field.key}>
                                            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem' }}>{field.label}</label>
                                            <input
                                                type="text"
                                                disabled={field.disabled}
                                                placeholder={field.placeholder}
                                                value={formData[field.key]}
                                                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                                style={{ width: '100%', padding: '1.1rem 1.5rem', borderRadius: '12px', border: 'none', background: '#f1f5f9', fontSize: '1rem', outline: 'none', color: '#334155' }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                                    {formData.role === 'mentor' ? 'Mentor Background' : 'What areas interest you?'}
                                </h2>
                                <p style={{ color: '#64748b', marginBottom: '3rem', fontWeight: 500 }}>
                                    {formData.role === 'mentor' ? 'Define your professional focus and achievements' : 'Select topics you want to learn about'}
                                </p>

                                {formData.role === 'mentor' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem' }}>Individuality Parameters</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.25rem' }}>
                                                {expertiseOptions.map(opt => (
                                                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, color: '#475569' }}>
                                                        <input type="checkbox" checked={formData.expertiseAreas.includes(opt)} onChange={() => toggleItem('expertiseAreas', opt)} style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} />
                                                        {opt}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
                                            <div style={{ flex: 1, minWidth: '250px' }}>
                                                <label style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem' }}>Company Size Experience</label>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    {["Startup (1-10)", "Mid-sized (11-50)", "Growth (51-500)", "Enterprise (500+)"].map(opt => (
                                                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>
                                                            <input type="radio" name="size" checked={formData.companySizePref === opt} onChange={() => setFormData({ ...formData, companySizePref: opt })} style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} />
                                                            {opt}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{ flex: 1, minWidth: '250px' }}>
                                                <label style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem' }}>Years of Experience</label>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    {["1-2 Years", "3-5 Years", "5-10 Years", "10+ Years"].map(opt => (
                                                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>
                                                            <input type="radio" name="exp" checked={formData.yearsExperience === opt} onChange={() => setFormData({ ...formData, yearsExperience: opt })} style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} />
                                                            {opt}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                        {["Product Management", "Software Engineering", "Data Science", "UX/UI Design", "Marketing", "Sales", "Business Strategy", "Entrepreneurship", "Finance", "Career Transitions"].map(opt => (
                                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, color: '#334155' }}>
                                                <input type="checkbox" checked={formData.interests.includes(opt)} onChange={() => toggleItem('interests', opt)} style={{ width: '20px', height: '20px', accentColor: '#2563eb' }} />
                                                {opt}
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 4 && (
                            <div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                                    {formData.role === 'mentor' ? 'Location & Communication' : 'What are your goals?'}
                                </h2>
                                <p style={{ color: '#64748b', marginBottom: '3rem', fontWeight: 500 }}>
                                    {formData.role === 'mentor' ? 'Where do you prefer your mentees to be from?' : 'Tell us what you want to achieve'}
                                </p>

                                {formData.role === 'mentor' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}><Globe size={20} /> Preferred Countries</label>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const allSelected = countryOptions.every(c => formData.preferredCountries.includes(c));
                                                        setFormData({
                                                            ...formData,
                                                            preferredCountries: allSelected ? [] : [...countryOptions]
                                                        });
                                                    }}
                                                    style={{ background: 'transparent', border: 'none', color: '#2563eb', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
                                                >
                                                    {countryOptions.every(c => formData.preferredCountries.includes(c)) ? "Deselect All" : "Select All"}
                                                </button>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1.25rem' }}>
                                                {countryOptions.map(opt => (
                                                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
                                                        <input type="checkbox" checked={formData.preferredCountries.includes(opt)} onChange={() => toggleItem('preferredCountries', opt)} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                                                        {opt}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem' }}><MessageCircle size={20} /> Communication Style</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                                {mentorshipStyles.map(opt => (
                                                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, color: '#334155' }}>
                                                        <input type="radio" name="style" checked={formData.mentorshipStyle === opt} onChange={() => setFormData({ ...formData, mentorshipStyle: opt })} style={{ width: '20px', height: '20px', accentColor: '#2563eb' }} />
                                                        {opt}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '0.75rem' }}>Career Goals</label>
                                            <textarea placeholder="e.g., I want to transition into product management..." value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} style={{ width: '100%', padding: '1.5rem', borderRadius: '12px', border: 'none', background: '#f1f5f9', fontSize: '1rem', minHeight: '120px', outline: 'none', resize: 'none', fontFamily: 'inherit' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: '#475569', marginBottom: '1.25rem' }}>Availability</label>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                                {["Flexible - I can adjust my schedule", "Weekends only", "Evenings (after 6 PM)"].map(opt => (
                                                    <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, color: '#334155' }}>
                                                        <input type="checkbox" checked={formData.availability.includes(opt)} onChange={() => toggleItem('availability', opt)} style={{ width: '20px', height: '20px', accentColor: '#2563eb' }} />
                                                        {opt}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 5 && (
                            <div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>
                                    {formData.role === 'mentor' ? 'Session Preferences' : 'Almost Finished'}
                                </h2>
                                <p style={{ color: '#64748b', marginBottom: '3rem', fontWeight: 500 }}>
                                    {formData.role === 'mentor' ? 'How do you want to manage your mentorship sessions?' : 'Review and complete your profile'}
                                </p>

                                {formData.role === 'mentor' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                                        <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
                                            <div style={{ flex: 1, minWidth: '250px' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem' }}><Clock size={18} /> Session Duration</label>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                    {["30 Minutes", "45 Minutes", "1 Hour", "1.5 Hours"].map(opt => (
                                                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>
                                                            <input type="radio" name="dur" checked={formData.sessionDuration === opt} onChange={() => setFormData({ ...formData, sessionDuration: opt })} style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} />
                                                            {opt}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div style={{ flex: 1, minWidth: '250px' }}>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem' }}><List size={18} /> Preferred Days</label>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                                                    {sessionDays.map(opt => (
                                                        <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontWeight: 600, color: '#475569' }}>
                                                            <input type="checkbox" checked={formData.preferredDays.includes(opt)} onChange={() => toggleItem('preferredDays', opt)} style={{ width: '18px', height: '18px', accentColor: '#2563eb' }} />
                                                            {opt}
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>Tell us more about your ideal mentee</label>
                                            <textarea placeholder="I prefer working with early-career designers who are eager to learn and have a strong foundation in..." value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} style={{ width: '100%', padding: '1.5rem', borderRadius: '12px', border: 'none', background: '#f1f5f9', fontSize: '1rem', minHeight: '120px', outline: 'none', resize: 'none', fontFamily: 'inherit' }} />
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                                        <div style={{ color: '#2563eb', marginBottom: '2rem' }}>
                                            <CheckCircle2 size={80} strokeWidth={2.5} />
                                        </div>
                                        <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '1rem' }}>All set!</h3>
                                        <p style={{ color: '#64748b', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto' }}>You're ready to start finding the perfect mentor to help you grow your career.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div style={{ display: 'flex', gap: '1.5rem', paddingTop: '4rem', marginTop: 'auto' }}>
                        <button onClick={handleBack} disabled={step === 1} style={{ flex: 1, padding: '1rem', borderRadius: '12px', border: '1.5px solid #cbd5e1', background: step === 1 ? '#f8fafc' : 'white', color: step === 1 ? '#cbd5e1' : '#1e293b', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <ArrowLeft size={18} /> Back
                        </button>
                        <button onClick={step === 5 ? handleSubmit : handleNext} disabled={step === 1 && !formData.role || loading} style={{ flex: 2, padding: '1rem', borderRadius: '12px', border: 'none', background: step === 1 && !formData.role ? '#cbd5e1' : '#1e3a8a', color: 'white', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            {loading ? "Saving..." : (step === 5 ? "Complete Profile" : "Continue")} <ArrowRight size={18} />
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Onboarding;
