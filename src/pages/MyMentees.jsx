import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { ref, onValue, get } from 'firebase/database';
import { useNavigate } from 'react-router-dom';

const MyMentees = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [mentees, setMentees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!user) return;
        const matchesRef = ref(db, 'matches');
        const sessionsRef = ref(db, 'sessions');

        const updateData = async () => {
            try {
                const [matchesSnap, sessionsSnap] = await Promise.all([get(matchesRef), get(sessionsRef)]);
                const matchesData = matchesSnap.exists() ? matchesSnap.val() : {};
                const allSessions = sessionsSnap.exists() ? Object.values(sessionsSnap.val()) : [];
                const myMatches = Object.values(matchesData).filter(m => m.mentorId === user.uid);

                const menteesWithDetails = await Promise.all(myMatches.map(async (match) => {
                    const menteeSnap = await get(ref(db, `users/${match.menteeId}`));
                    const menteeProfile = menteeSnap.exists() ? menteeSnap.val() : {};
                    const menteeSessions = allSessions.filter(s => s.menteeId === match.menteeId && s.mentorId === user.uid && s.status === 'completed');
                    const lastSessionDate = menteeSessions.length > 0 ? new Date(menteeSessions[0].dateTime).toLocaleDateString() : 'No sessions yet';

                    return {
                        id: match.menteeId, name: menteeProfile.name || 'Anonymous', status: 'Active',
                        startDate: new Date(match.createdAt).toLocaleDateString(), role: menteeProfile.career || 'Mentee',
                        lastSession: lastSessionDate, profileImage: menteeProfile.profileImage
                    };
                }));
                setMentees(menteesWithDetails);
            } catch (err) { console.error(err); setMentees([]); }
            finally { setLoading(false); }
        };

        const unsubMatches = onValue(matchesRef, updateData);
        const unsubSessions = onValue(sessionsRef, updateData);
        return () => { unsubMatches(); unsubSessions(); };
    }, [user]);

    const filteredMentees = mentees.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '2.5rem', gap: '1.5rem' }}>
                <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.2rem', fontWeight: 900, color: '#1e293b' }}>My Mentees</h1>
                <div style={{ position: 'relative', width: isMobile ? '100%' : '320px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input placeholder="Search name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} />
                </div>
            </div>

            {loading ? <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={32} color="#1e3a8a" /></div> : (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {filteredMentees.map(m => (
                        <div key={m.id} style={{ background: 'white', borderRadius: '24px', padding: '2rem', border: '1px solid #f1f5f9', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.25rem', overflow: 'hidden', border: '3px solid #f8fafc' }}>
                                <img src={m.profileImage || `https://ui-avatars.com/api/?name=${m.name}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e3a8a', marginBottom: '0.25rem' }}>{m.name}</h3>
                            <p style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600, marginBottom: '1.25rem' }}>{m.role}</p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#94a3b8', fontWeight: 700 }}>Started</span>
                                    <span style={{ color: '#1e293b', fontWeight: 800 }}>{m.startDate}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                                    <span style={{ color: '#94a3b8', fontWeight: 700 }}>Last Session</span>
                                    <span style={{ color: '#1e293b', fontWeight: 800 }}>{m.lastSession}</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <button onClick={() => navigate(`/messages?with=${m.id}`)} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', background: '#1e3a8a', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>Message</button>
                                <button onClick={() => navigate(`/profile/${m.id}`)} style={{ padding: '0.75rem', borderRadius: '10px', background: 'white', border: '1px solid #e2e8f0', cursor: 'pointer' }}><User size={18} color="#475569" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyMentees;
