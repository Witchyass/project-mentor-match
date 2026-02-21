import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Sparkles, Heart, X, Globe, Star, CheckCircle, MessageCircle, Calendar, Lock } from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { rankMatches } from '../utils/matchingEngine';
import { sendMatchRequest } from '../lib/matchService';
import { useNavigate } from 'react-router-dom';

const MatchCard = ({ profile, onSwipe, index }) => {
    // Task: Fix Matching Cards UI (blurriness and unreadable text when swiping) <!-- id: 2 -->
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-150, 0, 150], [-25, 0, 25]);
    const opacity = useTransform(x, [-150, -100, 0, 100, 150], [0, 1, 1, 1, 0]);
    const colorRight = useTransform(x, [0, 100], ['rgba(0,0,0,0)', 'rgba(34, 197, 94, 0.4)']);
    const colorLeft = useTransform(x, [-100, 0], ['rgba(239, 68, 68, 0.4)', 'rgba(0,0,0,0)']);

    const handleDragEnd = (event, info) => {
        if (info.offset.x > 100) {
            onSwipe('right', profile);
        } else if (info.offset.x < -100) {
            onSwipe('left', profile);
        }
    };

    return (
        <motion.div
            style={{
                x,
                rotate,
                opacity,
                position: 'absolute',
                width: '100%',
                height: '100%',
                cursor: 'grab',
                zIndex: 100 - index
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            whileTap={{ scale: 1.05 }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { delay: index * 0.1 } }}
            exit={{ x: x.get() > 0 ? 1000 : -1000, opacity: 0 }}
        >
            <div className="glass-card" style={{
                width: '100%',
                height: '100%',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                background: 'var(--card-bg)', // Use a stable background
                backdropFilter: 'none', // Remove blur from moving cards
                willChange: 'transform, opacity' // Performance optimization
            }}>
                {/* Swipe Indicators */}
                <motion.div style={{ background: colorRight, position: 'absolute', inset: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <motion.div style={{ opacity: useTransform(x, [0, 50], [0, 1]) }}><Heart size={80} color="white" fill="white" /></motion.div>
                </motion.div>
                <motion.div style={{ background: colorLeft, position: 'absolute', inset: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <motion.div style={{ opacity: useTransform(x, [-50, 0], [1, 0]) }}><X size={80} color="white" /></motion.div>
                </motion.div>

                {/* Compatibility Badge */}
                {profile.compatibility > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        zIndex: 10,
                        background: profile.compatibility > 79 ? 'var(--gradient-premium)' : 'var(--glass)',
                        backdropFilter: 'blur(10px)',
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-full)',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        border: '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <Sparkles size={14} fill="currentColor" />
                        {profile.compatibility}% Match
                    </div>
                )}

                {profile.compatibility > 85 && (
                    <div style={{
                        position: 'absolute',
                        top: '1.5rem',
                        left: '-2rem',
                        zIndex: 10,
                        background: '#FFD700',
                        color: 'black',
                        padding: '0.25rem 3rem',
                        fontWeight: 900,
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        transform: 'rotate(-45deg)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                        Elite
                    </div>
                )}

                {/* Profile Image/Placeholder */}
                <div style={{ height: '65%', background: `linear-gradient(45deg, var(--primary), var(--secondary))`, position: 'relative' }}>
                    <img
                        src={profile.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || profile.id}`}
                        alt={profile.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem 1.5rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', color: 'white' }}>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.25rem' }}>{profile.name}, {profile.experienceLevel === 'Expert' ? '5y+' : profile.experienceLevel || 'New'}</h2>
                        <p style={{ opacity: 0.9, fontWeight: 500, fontSize: '1.1rem' }}>{profile.career || 'Professional'}</p>
                    </div>
                </div>

                {/* Profile Details */}
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {profile.skills?.map(skill => (
                            <span key={skill} className="glass" style={{ background: 'var(--primary)', color: 'white', padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>{skill}</span>
                        ))}
                    </div>

                    <p style={{ fontSize: '0.9rem', opacity: 0.6, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{profile.bio || 'No bio provided yet.'}</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', opacity: 0.7 }}>
                            <Globe size={16} /> {Array.isArray(profile.languages) ? profile.languages.join(', ') : 'English'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)' }}>
                            <Star size={16} fill="var(--primary)" /> {profile.rating || '4.8'}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const Matcher = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMatch, setActiveMatch] = useState(null); // { mentorName, mentorId, mentorCareer, mentorImage }
    const [matchLoading, setMatchLoading] = useState(false);

    // Check if mentee already has an accepted match
    useEffect(() => {
        if (!user || profile?.role !== 'mentee') {
            return;
        }

        setMatchLoading(true);
        const matchesRef = ref(db, 'matches');
        const unsubscribe = onValue(matchesRef, async (snapshot) => {
            if (snapshot.exists()) {
                const allMatches = snapshot.val();
                const myMatch = Object.values(allMatches).find(
                    m => m.menteeId === user.uid
                );
                if (myMatch) {
                    // Fetch mentor profile details
                    try {
                        const mentorSnap = await get(ref(db, `users/${myMatch.mentorId}`));
                        const mentorData = mentorSnap.exists() ? mentorSnap.val() : {};
                        setActiveMatch({
                            mentorId: myMatch.mentorId,
                            mentorName: mentorData.name || 'Your Mentor',
                            mentorCareer: mentorData.career || 'Professional',
                            mentorImage: mentorData.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${myMatch.mentorId}`
                        });
                    } catch {
                        setActiveMatch({ mentorId: myMatch.mentorId, mentorName: 'Your Mentor', mentorCareer: '', mentorImage: '' });
                    }
                } else {
                    setActiveMatch(null);
                }
            } else {
                setActiveMatch(null);
            }
            setMatchLoading(false);
        });
        return () => unsubscribe();
    }, [user, profile]);

    useEffect(() => {
        if (!user) return;
        const usersRef = ref(db, 'users');
        const unsubscribe = onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log("🔍 Discovery: Total users in DB:", Object.keys(data).length);

                const uniqueProfiles = {};

                Object.keys(data).forEach(key => {
                    const profileData = data[key];
                    if (!profileData) return;

                    const email = profileData.email?.toLowerCase();
                    const nameRoleKey = `${profileData.name?.toLowerCase()}_${profileData.role}`;

                    // Identify if this key is a real Firebase Auth UID (starts with alphanumeric, not '-')
                    const isRealId = !key.startsWith('-');

                    // Identify if this record belongs to the current user
                    const isMe = key === user.uid || (email && email === user.email?.toLowerCase());

                    if (isMe) return;

                    // Use email or name+role fingerprint for de-duplication
                    const primaryKey = email || nameRoleKey;
                    const existing = uniqueProfiles[primaryKey];

                    // Priority: Favor the record that uses a real UID as its key,
                    // or the first one we found if no real UID record exists yet.
                    if (!existing || isRealId) {
                        uniqueProfiles[primaryKey] = {
                            ...profileData,
                            id: isRealId ? key : (profileData.id || key)
                        };
                    }
                });

                const filtered = Object.values(uniqueProfiles).filter(p => {
                    // If current user is mentee, show mentors, and vice versa
                    if (profile?.role === 'mentee') return p.role === 'mentor';
                    if (profile?.role === 'mentor') return p.role === 'mentee';
                    return true; // If role not set, show all
                });

                console.log(`🔍 Discovery: Found ${filtered.length} unique potential matches.`);
                filtered.forEach(p => console.log(`  👤 Match: ${p.name} (ID: ${p.id})`));
                // AI Ranking
                const ranked = rankMatches(profile, filtered);
                setProfiles(ranked);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching profiles:", error);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user, profile]);

    const handleRequestMatch = async (profileData) => {
        // Guard: mentees can only have one mentor
        if (activeMatch) {
            return; // Button is blocked – UI already shows the matched screen
        }

        const targetId = profileData.id;
        console.log("🤝 Matcher: Sending request to:", profileData.name, "Target UID:", targetId);

        try {
            const result = await sendMatchRequest(user, profile, targetId);
            if (result && result.success) {
                setProfiles(prev => prev.filter(p => p.id !== profileData.id));
                alert(`✅ Match request sent to ${profileData.name}! They will be notified.`);
            }
        } catch (error) {
            console.error("❌ Error in handleRequestMatch:", error);
            alert("Failed to send match request. Check console for details.");
        }
    };

    const handleSkip = (profileData) => {
        setProfiles(prev => prev.filter(p => p.id !== profileData.id));
    };

    // Show loading state while checking for active match
    if (matchLoading) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                <div className="animate-pulse">Loading...</div>
            </div>
        );
    }

    // ── Already matched screen ──
    if (activeMatch && profile?.role === 'mentee') {
        return (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem', padding: '2rem' }}>
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'white',
                        borderRadius: '32px',
                        padding: '3rem 2.5rem',
                        maxWidth: '420px',
                        width: '100%',
                        textAlign: 'center',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 20px 40px rgba(30,58,138,0.08)'
                    }}
                >
                    {/* Green check header */}
                    <div style={{
                        width: '72px', height: '72px',
                        background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        <CheckCircle size={38} color="#16a34a" />
                    </div>

                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                        You're already matched!
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.65, marginBottom: '2rem' }}>
                        You can only be paired with <strong>one mentor at a time</strong>. Focus on making the most of your current mentorship journey.
                    </p>

                    {/* Mentor card */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '1rem',
                        background: '#f8fafc', borderRadius: '16px', padding: '1.25rem',
                        marginBottom: '2rem', textAlign: 'left',
                        border: '1px solid #e2e8f0'
                    }}>
                        <img
                            src={activeMatch.mentorImage}
                            alt={activeMatch.mentorName}
                            style={{ width: '52px', height: '52px', borderRadius: '12px', background: '#e2e8f0', flexShrink: 0 }}
                        />
                        <div>
                            <p style={{ fontWeight: 800, color: '#1e293b', marginBottom: '0.2rem' }}>{activeMatch.mentorName}</p>
                            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{activeMatch.mentorCareer}</p>
                            <span style={{
                                display: 'inline-block', marginTop: '0.3rem',
                                background: '#dcfce7', color: '#15803d',
                                fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem',
                                borderRadius: '99px'
                            }}>Active Mentor</span>
                        </div>
                    </div>

                    {/* CTA buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/messages')}
                            style={{ width: '100%', padding: '0.9rem', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.95rem' }}
                        >
                            <MessageCircle size={18} /> Message Your Mentor
                        </button>
                        <button
                            className="btn"
                            onClick={() => navigate('/sessions')}
                            style={{ width: '100%', padding: '0.9rem', borderRadius: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.95rem' }}
                        >
                            <Calendar size={18} /> View Sessions
                        </button>
                    </div>
                </motion.div>

                {/* Subtle padlock note */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 500 }}>
                    <Lock size={13} /> Discovery is locked while you have an active mentor
                </div>
            </div>
        );
    }

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-1px' }}>Find your <span className="text-gradient">Advantage</span></h1>
                <p style={{ opacity: 0.6, fontSize: '1.1rem' }}>Swipe right to connect with elite {profile?.role === 'mentor' ? 'mentees' : 'mentors'}</p>
            </div>

            <div style={{ position: 'relative', width: '400px', height: '600px', perspective: '1000px' }}>
                <AnimatePresence>
                    {loading ? (
                        <div key="loading" style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                            <div className="animate-pulse">Analyzing matches...</div>
                        </div>
                    ) : profiles.length > 0 ? (
                        profiles.slice(0, 3).map((p, index) => (
                            <MatchCard
                                key={p.id}
                                profile={p}
                                index={index}
                                onSwipe={(dir) => dir === 'right' ? handleRequestMatch(p) : handleSkip(p)}
                            />
                        )).reverse()
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass"
                            style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-xl)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem' }}
                        >
                            <div style={{ background: 'var(--glass)', padding: '2rem', borderRadius: '50%', marginBottom: '2rem' }}>
                                <Sparkles size={64} color="var(--primary)" />
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>All caught up!</h2>
                            <p style={{ opacity: 0.6, lineHeight: 1.6 }}>We've shown you everyone available right now. We'll notify you when new experts join the network.</p>
                            <button className="btn btn-primary" style={{ marginTop: '2.5rem', width: '100%' }} onClick={() => window.location.reload()}>Refresh Discovery</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                <button
                    onClick={() => profiles.length > 0 && handleSkip(profiles[0])}
                    className="btn glass"
                    style={{ width: '70px', height: '70px', borderRadius: '50%', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                >
                    <X size={32} />
                </button>
                <button
                    onClick={() => profiles.length > 0 && handleRequestMatch(profiles[0])}
                    className="btn glass"
                    style={{ width: '70px', height: '70px', borderRadius: '50%', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.2)' }}
                >
                    <Heart size={32} fill="#22c55e" />
                </button>
            </div>
        </div>
    );
};

export default Matcher;
