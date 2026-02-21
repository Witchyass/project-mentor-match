import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Edit2, MapPin, Mail, User, Briefcase,
    AtSign, Globe, Plus, Check, X, Save, Loader2
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{title}</h2>
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
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem', paddingBottom: '4rem' }}>

            {!isOwnProfile && (
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'white', border: '1px solid #e2e8f0', padding: '0.75rem 1.5rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}
                >
                    <X size={18} /> Back
                </button>
            )}

            {/* Profile Header */}
            <div style={{
                background: 'white',
                borderRadius: '32px',
                padding: '3rem 4rem',
                border: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '3rem',
                position: 'relative',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
            }}>
                <div style={{ position: 'relative' }}>
                    <div style={{
                        width: '140px',
                        height: '140px',
                        borderRadius: '50%',
                        background: 'linear-gradient(45deg, #1e3a8a, #3b82f6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem',
                        fontWeight: 900,
                        color: 'white',
                        border: '6px solid #f8fafc'
                    }}>
                        {formData.name?.split(' ').map(n => n[0]).join('') || 'U'}
                        <div style={{
                            position: 'absolute',
                            bottom: '8px',
                            right: '8px',
                            width: '28px',
                            height: '28px',
                            background: '#22c55e',
                            border: '4px solid white',
                            borderRadius: '50%'
                        }} />
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1e3a8a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{formData.name || 'Set your name'}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                            <Briefcase size={18} /> {formData.career || 'Career not set'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                            <MapPin size={18} /> {formData.location || 'Location not set'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Profile Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Basic Information */}
                <section style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', border: '1px solid #f1f5f9' }}>
                    <SectionHeader title="Basic Information" section="basic" editing={isEditing.basic} />

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#4f46e5', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                            {isEditing.basic ? (
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, outline: 'none' }}
                                />
                            ) : (
                                <p style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.05rem' }}>{formData.name || 'Not provided'}</p>
                            )}
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#4f46e5', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Professional Title</label>
                            {isEditing.basic ? (
                                <input
                                    type="text"
                                    value={formData.career}
                                    onChange={(e) => setFormData({ ...formData, career: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, outline: 'none' }}
                                />
                            ) : (
                                <p style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.05rem' }}>{formData.career || 'Not provided'}</p>
                            )}
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#4f46e5', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</label>
                            {isEditing.basic ? (
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 600, outline: 'none' }}
                                />
                            ) : (
                                <p style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.05rem' }}>{formData.location || 'Not provided'}</p>
                            )}
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#4f46e5', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                            <p style={{ fontWeight: 700, color: '#94a3b8', fontSize: '1.05rem' }}>{user?.email}</p>
                        </div>
                    </div>
                </section>

                {/* About Me */}
                <section style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', border: '1px solid #f1f5f9' }}>
                    <SectionHeader title="About Me" section="about" editing={isEditing.about} />
                    {isEditing.about ? (
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            rows={5}
                            style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: 500, outline: 'none', lineHeight: 1.6, resize: 'vertical' }}
                            placeholder="Tell us about yourself..."
                        />
                    ) : (
                        <p style={{ color: '#475569', lineHeight: 1.8, fontWeight: 500, fontSize: '1rem' }}>
                            {formData.bio || 'Add a bio to let others know more about you.'}
                        </p>
                    )}
                </section>

                {/* Goals */}
                <section style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', border: '1px solid #f1f5f9' }}>
                    <SectionHeader title="Career Goals" section="goals" editing={isEditing.goals} />

                    <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {formData.goals.map((goal, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#1e293b', fontWeight: 600 }}>
                                        <div style={{ width: '8px', height: '8px', background: '#2563eb', borderRadius: '50%' }} />
                                        {goal}
                                    </div>
                                    {isEditing.goals && (
                                        <button onClick={() => removeGoal(i)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                                            <X size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {isEditing.goals && (
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    <input
                                        type="text"
                                        placeholder="Add a new goal..."
                                        value={tempGoal}
                                        onChange={(e) => setTempGoal(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                                        style={{ flex: 1, padding: '0.8rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontWeight: 600 }}
                                    />
                                    <button onClick={addGoal} style={{ padding: '0.8rem 1.5rem', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                                        Add
                                    </button>
                                </div>
                            )}
                            {formData.goals.length === 0 && !isEditing.goals && (
                                <p style={{ textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', margin: '1rem 0' }}>No goals listed.</p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Areas of Interest */}
                <section style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', border: '1px solid #f1f5f9' }}>
                    <SectionHeader title="Areas of Interest" section="interests" editing={isEditing.interests} />

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {formData.interests.map((interest, i) => (
                            <div key={i} style={{
                                padding: '0.7rem 1.25rem',
                                background: '#eff6ff',
                                color: '#2563eb',
                                borderRadius: '100px',
                                fontSize: '0.9rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                border: '1px solid rgba(37, 99, 235, 0.1)'
                            }}>
                                {interest}
                                {isEditing.interests && (
                                    <button onClick={() => removeInterest(i)} style={{ background: 'transparent', border: 'none', color: '#2563eb', cursor: 'pointer', display: 'flex', pdding: 0 }}>
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        ))}
                        {isEditing.interests && (
                            <div style={{ display: 'flex', gap: '0.5rem', width: '100%', marginTop: '1rem' }}>
                                <input
                                    type="text"
                                    placeholder="Add an interest (e.g. AI, Fintech)..."
                                    value={tempInterest}
                                    onChange={(e) => setTempInterest(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                                    style={{ flex: 1, padding: '0.8rem 1.25rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontWeight: 600 }}
                                />
                                <button onClick={addInterest} style={{ padding: '0.8rem 1.5rem', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>
                                    Add
                                </button>
                            </div>
                        )}
                        {formData.interests.length === 0 && !isEditing.interests && (
                            <p style={{ width: '100%', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>No interests listed.</p>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default Profile;
