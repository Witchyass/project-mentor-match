import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Sparkles, Heart, X, Globe, Star, CheckCircle, MessageCircle, Calendar, Lock } from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue, get } from 'firebase/database';
import { useAuth } from '../context/AuthContext';
import { rankMatches } from '../utils/matchingEngine';
import { sendMatchRequest } from '../lib/matchService';
import { useNavigate } from 'react-router-dom';

const MatchCard = ({ profile, onSwipe, index, isMobile }) => {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-150, 0, 150], [-15, 0, 15]);
    const opacity = useTransform(x, [-150, -100, 0, 100, 150], [0, 1, 1, 1, 0]);
    const colorRight = useTransform(x, [0, 100], ['rgba(0,0,0,0)', 'rgba(34, 197, 94, 0.4)']);
    const colorLeft = useTransform(x, [-100, 0], ['rgba(239, 68, 68, 0.4)', 'rgba(0,0,0,0)']);

    const handleDragEnd = (event, info) => {
        if (info.offset.x > 80) {
            onSwipe('right', profile);
        } else if (info.offset.x < -80) {
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
            whileTap={{ scale: 1.02 }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, transition: { delay: index * 0.1 } }}
            exit={{ x: x.get() > 0 ? 1000 : -1000, opacity: 0 }}
        >
            <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '24px',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                background: 'white',
                border: '1px solid #f1f5f9'
            }}>
                <motion.div style={{ background: colorRight, position: 'absolute', inset: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <motion.div style={{ opacity: useTransform(x, [0, 50], [0, 1]) }}><Heart size={80} color="white" fill="white" /></motion.div>
                </motion.div>
                <motion.div style={{ background: colorLeft, position: 'absolute', inset: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                    <motion.div style={{ opacity: useTransform(x, [-50, 0], [1, 0]) }}><X size={80} color="white" /></motion.div>
                </motion.div>

                {profile.compatibility > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        zIndex: 10,
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '100px',
                        color: '#1e3a8a',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        border: '1px solid #e2e8f0'
                    }}>
                        <Sparkles size={12} fill="currentColor" />
                        {profile.compatibility}% Match
                    </div>
                )}

                <div style={{ height: '60%', background: '#f1f5f9', position: 'relative' }}>
                    <img
                        src={profile.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name || profile.id}`}
                        alt={profile.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.5rem', background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', color: 'white' }}>
                        <h2 style={{ fontSize: isMobile ? '1.5rem' : '1.8rem', fontWeight: 900, marginBottom: '0.2rem' }}>{profile.name}</h2>
                        <p style={{ opacity: 0.9, fontWeight: 600, fontSize: '0.9rem' }}>{profile.career || 'Professional'}</p>
                    </div>
                </div>

                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        {(profile.skills || profile.interests || []).slice(0, 3).map(skill => (
                            <span key={skill} style={{ background: '#eff6ff', color: '#1e3a8a', padding: '0.25rem 0.75rem', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 700 }}>{skill}</span>
                        ))}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{profile.bio || 'Wants to help more people grow in their tech journey.'}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                            <Globe size={14} /> {Array.isArray(profile.languages) ? profile.languages[0] : 'English'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b' }}>
                            <Star size={14} fill="#f59e0b" /> {profile.rating || '4.9'}
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
    const [activeMatch, setActiveMatch] = useState(null);
    const [matchLoading, setMatchLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!user || profile?.role !== 'mentee') return;
        setMatchLoading(true);
        const matchesRef = ref(db, 'matches');
        const unsubscribe = onValue(matchesRef, async (snapshot) => {
            if (snapshot.exists()) {
                const myMatch = Object.values(snapshot.val()).find(m => m.menteeId === user.uid);
                if (myMatch) {
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
                        setActiveMatch({ mentorId: myMatch.mentorId, mentorName: 'Your Mentor' });
                    }
                } else setActiveMatch(null);
            } else setActiveMatch(null);
            setMatchLoading(false);
        });
        return () => unsubscribe();
    }, [user, profile]);

    useEffect(() => {
        if (!user) return;
        const unsubscribe = onValue(ref(db, 'users'), (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const filtered = Object.keys(data)
                    .map(key => ({ ...data[key], id: key }))
                    .filter(p => p.id !== user.uid && (profile?.role === 'mentee' ? p.role === 'mentor' : p.role === 'mentee'));
                setProfiles(rankMatches(profile, filtered));
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [user, profile]);

    const handleRequestMatch = async (p) => {
        if (activeMatch) return;
        try {
            const res = await sendMatchRequest(user, profile, p.id);
            if (res?.success) {
                setProfiles(prev => prev.filter(item => item.id !== p.id));
                alert(`Match request sent to ${p.name}!`);
            }
        } catch (err) { alert("Failed to send request."); }
    };

    if (matchLoading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>;

    if (activeMatch && profile?.role === 'mentee') {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '1.5rem' : '2rem' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', borderRadius: '24px', padding: isMobile ? '2rem 1.5rem' : '3rem', maxWidth: '400px', width: '100%', textAlign: 'center', border: '1px solid #f1f5f9', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                    <div style={{ width: '64px', height: '64px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <CheckCircle size={32} color="#16a34a" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>You're Matched!</h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>You've found your mentor. Start your journey by reaching out or scheduling a session.</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '16px', marginBottom: '2rem', textAlign: 'left' }}>
                        <img src={activeMatch.mentorImage} style={{ width: '48px', height: '48px', borderRadius: '12px' }} alt="mentor" />
                        <div><p style={{ fontWeight: 800, fontSize: '0.95rem' }}>{activeMatch.mentorName}</p><p style={{ fontSize: '0.8rem', color: '#64748b' }}>{activeMatch.mentorCareer}</p></div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button onClick={() => navigate('/messages')} style={{ padding: '0.8rem', borderRadius: '12px', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><MessageCircle size={18} /> Message</button>
                        <button onClick={() => navigate('/sessions')} style={{ padding: '0.8rem', borderRadius: '12px', background: 'white', color: '#1e3a8a', border: '1px solid #e2e8f0', fontWeight: 800, cursor: 'pointer' }}>View Sessions</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: isMobile ? '1.5rem' : '3rem', padding: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: isMobile ? '2rem' : '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Discover Your <span style={{ color: '#3b82f6' }}>Match</span></h1>
                <p style={{ color: '#64748b', fontSize: isMobile ? '0.95rem' : '1.1rem' }}>Swipe right to connect with your next {profile?.role === 'mentor' ? 'mentee' : 'mentor'}</p>
            </div>

            <div style={{ position: 'relative', width: isMobile ? '90vw' : '380px', height: isMobile ? '500px' : '560px', perspective: '1000px' }}>
                <AnimatePresence>
                    {loading ? <div style={{ textAlign: 'center', opacity: 0.5 }}>Analyzing...</div> : profiles.length > 0 ? (
                        profiles.slice(0, 3).map((p, index) => (
                            <MatchCard key={p.id} profile={p} index={index} onSwipe={(dir) => dir === 'right' ? handleRequestMatch(p) : setProfiles(prev => prev.filter(i => i.id !== p.id))} isMobile={isMobile} />
                        )).reverse()
                    ) : (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <Sparkles size={48} color="#3b82f6" style={{ marginBottom: '1rem' }} />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>All Caught Up!</h2>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>New experts join every day. Check back soon!</p>
                            <button onClick={() => window.location.reload()} style={{ marginTop: '1.5rem', padding: '0.6rem 1.5rem', borderRadius: '10px', background: '#3b82f6', color: 'white', border: 'none', fontWeight: 800 }}>Refresh</button>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem' }}>
                <button onClick={() => profiles.length > 0 && setProfiles(prev => prev.filter((_, i) => i !== 0))} style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'white', color: '#ef4444', border: '1px solid #fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}><X size={28} /></button>
                <button onClick={() => profiles.length > 0 && handleRequestMatch(profiles[0])} style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'white', color: '#10b981', border: '1px solid #d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}><Heart size={28} fill="#10b981" /></button>
            </div>
        </div>
    );
};

export default Matcher;
