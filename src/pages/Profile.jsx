import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Edit2, MapPin, Mail, User, Briefcase,
    AtSign, Globe, Plus, Check, X, Save, Loader2, ChevronLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { ref, update, get } from 'firebase/database';
import { useParams, useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, profile, loading: authLoading } = useAuth();
    const { uid } = useParams();
    const navigate = useNavigate();
    const [remoteProfile, setRemoteProfile] = useState(null);
    const [fetchingRemote, setFetchingRemote] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const isOwnProfile = !uid || uid === user?.uid;
    const currentProfile = isOwnProfile ? profile : remoteProfile;
    const isLoading = authLoading || fetchingRemote;

    const [isEditing, setIsEditing] = useState({
        basic: false,
        about: false,
        goals: false,
        interests: false
    });

    const [formData, setFormData] = useState({
        name: '',
        career: '',
        location: '',
        bio: '',
        goals: [],
        interests: []
    });

    const [tempGoal, setTempGoal] = useState('');
    const [tempInterest, setTempInterest] = useState('');

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!isOwnProfile && uid) {
            setFetchingRemote(true);
            const profileRef = ref(db, `users/${uid}`);
            get(profileRef).then(snapshot => {
                if (snapshot.exists()) {
                    setRemoteProfile(snapshot.val());
                }
                setFetchingRemote(false);
            }).catch(err => {
                console.error("Error fetching remote profile:", err);
                setFetchingRemote(false);
            });
        }
    }, [uid, isOwnProfile]);

    useEffect(() => {
        if (currentProfile) {
            setFormData({
                name: currentProfile.name || '',
                career: currentProfile.career || '',
                location: currentProfile.location || currentProfile.country || '',
                bio: currentProfile.bio || '',
                goals: currentProfile.goals || [],
                interests: currentProfile.interests || []
            });
        }
    }, [currentProfile]);

    const handleSave = async (section) => {
        if (!user) return;
        setSaving(true);
        try {
            await update(ref(db, 'users/' + user.uid), {
                ...formData,
                updatedAt: new Date().toISOString()
            });
            setIsEditing(prev => ({ ...prev, [section]: false }));
        } catch (error) {
            console.error("Error saving profile:", error);
            alert("Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const addGoal = () => {
        if (!tempGoal.trim()) return;
        setFormData(prev => ({ ...prev, goals: [...prev.goals, tempGoal.trim()] }));
        setTempGoal('');
    };

    const removeGoal = (index) => {
        setFormData(prev => ({ ...prev, goals: prev.goals.filter((_, i) => i !== index) }));
    };

    const addInterest = () => {
        if (!tempInterest.trim()) return;
        setFormData(prev => ({ ...prev, interests: [...prev.interests, tempInterest.trim()] }));
        setTempInterest('');
    };

    const removeInterest = (index) => {
        setFormData(prev => ({ ...prev, interests: prev.interests.filter((_, i) => i !== index) }));
    };

    if (isLoading) return (
        <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" size={40} color="#1e3a8a" />
        </div>
    );

    const SectionHeader = ({ title, section, editing }) => (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{title}</h2>
            {isOwnProfile && (!editing ? (
                <button
                    onClick={() => setIsEditing(prev => ({ ...prev, [section]: true }))}
                    style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                    <Edit2 size={14} /> Edit
                </button>
            ) : (
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setIsEditing(prev => ({ ...prev, [section]: false }))}
                        style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => handleSave(section)}
                        disabled={saving}
                        style={{ background: '#1e3a8a', color: 'white', border: 'none', padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        {saving ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />} Save
                    </button>
                </div>
            ))}
        </div>
    );

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: isMobile ? '1.5rem' : '2rem', paddingBottom: '4rem' }}>

            {!isOwnProfile && (
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.6rem 1.2rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '0.9rem' }}
                >
                    <ChevronLeft size={18} /> Back
                </button>
            )}

            {/* Profile Header */}
            <div style={{
                background: 'white',
                borderRadius: '24px',
                padding: isMobile ? '2rem 1.5rem' : '3rem',
                border: '1px solid #f1f5f9',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'center' : 'center',
                textAlign: isMobile ? 'center' : 'left',
                gap: isMobile ? '1.5rem' : '2.5rem',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
            }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                        width: isMobile ? '100px' : '120px',
                        height: isMobile ? '100px' : '120px',
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: isMobile ? '2.2rem' : '2.8rem',
                        fontWeight: 900,
                        color: 'white',
                        border: '4px solid #f8fafc',
                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                    }}>
                        {formData.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.2rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                        {formData.name || (isOwnProfile ? 'Set your name' : 'Unknown User')}
                    </h1>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isMobile ? 'center' : 'flex-start',
                        gap: isMobile ? '1rem' : '1.5rem',
                        color: '#64748b',
                        flexWrap: 'wrap'
                    }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                            <Briefcase size={16} /> {formData.career || 'Title not set'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.9rem' }}>
                            <MapPin size={16} /> {formData.location || 'Location not set'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Basic Information */}
            <section style={{ background: 'white', borderRadius: '24px', padding: isMobile ? '1.5rem' : '2.5rem', border: '1px solid #f1f5f9' }}>
                <SectionHeader title="Account Details" section="basic" editing={isEditing.basic} />
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    {[
                        { label: 'Full Name', value: formData.name, key: 'name' },
                        { label: 'Professional Title', value: formData.career, key: 'career' },
                        { label: 'Location', value: formData.location, key: 'location' },
                        { label: 'Email', value: currentProfile?.email, readonly: true }
                    ].map((field, i) => (
                        <div key={i}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{field.label}</label>
                            {isEditing.basic && !field.readonly ? (
                                <input
                                    type="text"
                                    value={field.value}
                                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, outline: 'none', fontSize: '0.95rem' }}
                                />
                            ) : (
                                <p style={{ fontWeight: 700, color: field.readonly ? '#94a3b8' : '#1e293b', fontSize: '1rem' }}>{field.value || 'Not provided'}</p>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* About Me */}
            <section style={{ background: 'white', borderRadius: '24px', padding: isMobile ? '1.5rem' : '2.5rem', border: '1px solid #f1f5f9' }}>
                <SectionHeader title="About Me" section="about" editing={isEditing.about} />
                {isEditing.about ? (
                    <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={5}
                        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, outline: 'none', lineHeight: 1.6, resize: 'none', fontSize: '1rem' }}
                        placeholder="Share your experience and what you're looking for..."
                    />
                ) : (
                    <p style={{ color: '#475569', lineHeight: 1.7, fontWeight: 500, fontSize: '1rem' }}>
                        {formData.bio || 'Add a bio to let others know more about your journey.'}
                    </p>
                )}
            </section>

            {/* Goals & Interests (Grid on desktop, stack on mobile) */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1.5rem' : '2rem' }}>

                {/* Goals */}
                <section style={{ background: 'white', borderRadius: '24px', padding: isMobile ? '1.5rem' : '2rem', border: '1px solid #f1f5f9' }}>
                    <SectionHeader title="Goals" section="goals" editing={isEditing.goals} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {formData.goals.map((goal, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{goal}</p>
                                {isEditing.goals && <X size={16} onClick={() => removeGoal(i)} style={{ color: '#ef4444', cursor: 'pointer' }} />}
                            </div>
                        ))}
                        {isEditing.goals && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={tempGoal}
                                    onChange={(e) => setTempGoal(e.target.value)}
                                    placeholder="Add goal..."
                                    style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                                />
                                <button onClick={addGoal} style={{ padding: '0.6rem 1rem', background: '#1e3a8a', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 700 }}>Add</button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Interests */}
                <section style={{ background: 'white', borderRadius: '24px', padding: isMobile ? '1.5rem' : '2rem', border: '1px solid #f1f5f9' }}>
                    <SectionHeader title="Interests" section="interests" editing={isEditing.interests} />
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {formData.interests.map((interest, i) => (
                            <div key={i} style={{ padding: '0.5rem 1rem', background: '#eff6ff', color: '#1e3a8a', borderRadius: '100px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid #dbeafe', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {interest}
                                {isEditing.interests && <X size={14} onClick={() => removeInterest(i)} style={{ cursor: 'pointer' }} />}
                            </div>
                        ))}
                        {isEditing.interests && (
                            <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '0.5rem' }}>
                                <input
                                    type="text"
                                    value={tempInterest}
                                    onChange={(e) => setTempInterest(e.target.value)}
                                    placeholder="Add interest..."
                                    style={{ flex: 1, padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #e2e8f0', outline: 'none' }}
                                />
                                <button onClick={addInterest} style={{ padding: '0.6rem 1rem', background: '#1e3a8a', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 700 }}>Add</button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Profile;
