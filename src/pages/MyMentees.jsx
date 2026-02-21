import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Search, User, Calendar, MessageCircle,
    MoreHorizontal, ChevronRight, Check, X,
    Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { ref, onValue, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

const MyMentees = () => {
    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [mentees, setMentees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user) return;

        // Fetch matches and sessions for real-time updates
        const matchesRef = ref(db, 'matches');
        const sessionsRef = ref(db, 'sessions');

        const updateData = async () => {
            try {
                const [matchesSnap, sessionsSnap] = await Promise.all([
                    get(matchesRef),
                    get(sessionsRef)
                ]);

                const matchesData = matchesSnap.exists() ? matchesSnap.val() : {};
                const allSessions = sessionsSnap.exists() ? Object.values(sessionsSnap.val()) : [];
                const myMatches = Object.values(matchesData).filter(m => m.mentorId === user.uid);

                const menteesWithDetails = await Promise.all(myMatches.map(async (match) => {
                    const menteeSnap = await get(ref(db, `users/${match.menteeId}`));
                    const menteeProfile = menteeSnap.exists() ? menteeSnap.val() : {};

                    const menteeSessions = allSessions.filter(s =>
                        s.menteeId === match.menteeId &&
                        s.mentorId === user.uid &&
                        s.status === 'completed'
                    ).sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

                    const lastSessionDate = menteeSessions.length > 0
                        ? new Date(menteeSessions[0].dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : 'No sessions yet';

                    return {
                        id: match.menteeId,
                        matchId: match.id,
                        name: menteeProfile.name || 'Anonymous Mentee',
                        status: 'Active',
                        startDate: new Date(match.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                        totalSessions: menteeSessions.length,
                        lastSession: lastSessionDate,
                        profileImage: menteeProfile.profileImage,
                        role: menteeProfile.career || 'Mentee'
                    };
                }));

                setMentees(menteesWithDetails);
            } catch (err) {
                console.error("❌ Error fetching mentees data:", err);
                setMentees([]);
            } finally {
                setLoading(false);
            }
        };

        const unsubMatches = onValue(matchesRef, updateData);
        const unsubSessions = onValue(sessionsRef, updateData);

        return () => {
            unsubMatches();
            unsubSessions();
        };
    }, [user]);

    const filteredMentees = mentees.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header with Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '1.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>My Mentees</h1>
                <div style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '400px'
                }}>
                    <Search
                        size={20}
                        color="#cbd5e1"
                        style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                        type="text"
                        placeholder="Search mentees by name or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.85rem 1rem 0.85rem 3rem',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            background: 'white',
                            fontSize: '0.95rem',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '10rem' }}>
                    <Loader2 className="animate-spin" size={40} color="#1e3a8a" style={{ margin: '0 auto' }} />
                </div>
            ) : filteredMentees.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '6rem', background: 'white', borderRadius: '24px', border: '1px dashed #cbd5e1' }}>
                    <User size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#64748b' }}>
                        {searchTerm ? "No mentees found matching your search." : "You don't have any active mentees yet."}
                    </h3>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
                    gap: '2.5rem'
                }}>
                    {filteredMentees.map(mentee => (
                        <motion.div
                            key={mentee.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'white',
                                borderRadius: '24px',
                                padding: '3rem 2rem',
                                border: '1px solid #f1f5f9',
                                textAlign: 'center',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1.5rem'
                            }}
                        >
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                border: '4px solid #f8fafc',
                                background: '#f1f5f9'
                            }}>
                                <img
                                    src={mentee.profileImage || `https://ui-avatars.com/api/?name=${mentee.name}&background=random`}
                                    alt={mentee.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.5rem' }}>{mentee.name}</h3>
                                <div style={{
                                    display: 'inline-block',
                                    padding: '4px 16px',
                                    background: '#f0fdf4',
                                    color: '#10b981',
                                    borderRadius: '100px',
                                    fontSize: '0.85rem',
                                    fontWeight: 800
                                }}>
                                    {mentee.status}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', padding: '0 1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>Start Date</span>
                                    <span style={{ color: '#1e293b', fontWeight: 800 }}>{mentee.startDate}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>Role</span>
                                    <span style={{ color: '#1e293b', fontWeight: 800, textAlign: 'right' }}>{mentee.role}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>Last Session</span>
                                    <span style={{ color: '#1e293b', fontWeight: 800 }}>{mentee.lastSession}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                                <button
                                    onClick={() => navigate(`/messages?with=${mentee.id}`)}
                                    style={{
                                        flex: 2,
                                        padding: '1rem',
                                        background: '#1a365d',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '12px',
                                        fontSize: '0.95rem',
                                        fontWeight: 700,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Message
                                </button>
                                <button
                                    onClick={() => navigate(`/profile/${mentee.id}`)}
                                    style={{
                                        flex: 1,
                                        padding: '1rem',
                                        background: 'white',
                                        color: '#64748b',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <User size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyMentees;
