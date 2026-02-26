import React, { useState, useEffect } from 'react';
import {
    Clock, Edit, Check, X,
    Calendar, Save, Loader2, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { ref, update, onValue } from 'firebase/database';

const Availability = () => {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);

    const defaultAvailability = {
        schedule: [
            { day: 'Monday', time: '9:00 AM - 5:00 PM', available: true },
            { day: 'Tuesday', time: '9:00 AM - 5:00 PM', available: true },
            { day: 'Wednesday', time: '9:00 AM - 5:00 PM', available: true },
            { day: 'Thursday', time: '9:00 AM - 5:00 PM', available: true },
            { day: 'Friday', time: '9:00 AM - 5:00 PM', available: true },
            { day: 'Saturday', time: 'Unavailable', available: false },
            { day: 'Sunday', time: 'Unavailable', available: false },
        ],
        sessionDuration: '60',
        maxSessionsPerWeek: 10,
        autoAccept: false
    };

    const [availabilityData, setAvailabilityData] = useState(defaultAvailability);
    const [busySlots, setBusySlots] = useState([]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
            setIsTablet(window.innerWidth <= 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!user) return;
        return onValue(ref(db, `users/${user.uid}`), (snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const data = userData.availability || {};
                setAvailabilityData({
                    ...defaultAvailability,
                    ...data,
                    schedule: Array.isArray(data.schedule) ? data.schedule : defaultAvailability.schedule
                });
                if (userData.busySlots) {
                    setBusySlots(Object.values(userData.busySlots)
                        .filter(slot => new Date(slot.startTime) > new Date())
                        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime)));
                } else setBusySlots([]);
            }
            setLoading(false);
        });
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await update(ref(db, `users/${user.uid}/availability`), availabilityData);
            setIsEditing(false);
        } catch (err) { alert("Error saving settings."); }
        finally { setSaving(false); }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '10rem 0' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: isMobile ? '1.5rem' : '2.5rem' }}>

            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.5rem', fontWeight: 900, color: '#1e293b' }}>Schedule</h1>
                    <p style={{ color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>Set your availability and manage bookings.</p>
                </div>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} style={{ width: isMobile ? '100%' : 'auto', padding: '0.75rem 1.25rem', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <Edit size={18} /> Edit Weekly
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '1rem', width: isMobile ? '100%' : 'auto' }}>
                        <button onClick={() => setIsEditing(false)} style={{ flex: 1, background: 'transparent', border: 'none', color: '#475569', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleSave} disabled={saving} style={{ flex: 2, padding: '0.75rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 320px', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: 'white', borderRadius: '24px', padding: isMobile ? '1.25rem' : '2rem', border: '1px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.25rem' }}>Weekly Commitments</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {availabilityData.schedule.map((day, idx) => (
                                <div key={idx} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '0.75rem' : '1.5rem', padding: '1rem', borderRadius: '16px', background: day.available ? '#f8fafc' : 'white', border: '1px solid #e2e8f0' }}>
                                    <div style={{ width: isMobile ? 'auto' : '100px', fontWeight: 800, color: day.available ? '#1e3a8a' : '#94a3b8', fontSize: '0.9rem' }}>{day.day}</div>
                                    <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                                        {isEditing && day.available ? (
                                            <input value={day.time} onChange={(e) => {
                                                const nS = [...availabilityData.schedule];
                                                nS[idx].time = e.target.value;
                                                setAvailabilityData({ ...availabilityData, schedule: nS });
                                            }} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                                        ) : (
                                            <span style={{ fontWeight: 600, color: day.available ? '#475569' : '#cbd5e1', fontSize: '0.9rem' }}>{day.available ? day.time : 'Unavailable'}</span>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <button onClick={() => {
                                            const nS = [...availabilityData.schedule];
                                            nS[idx].available = !nS[idx].available;
                                            setAvailabilityData({ ...availabilityData, schedule: nS });
                                        }} style={{ width: isMobile ? '100%' : 'auto', padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: day.available ? '#fee2e2' : '#f0fdf4', color: day.available ? '#ef4444' : '#10b981', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
                                            {day.available ? 'Set Off' : 'Set On'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: '24px', padding: isMobile ? '1.25rem' : '2rem', border: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Duration</label>
                            {isEditing ? (
                                <input type="number" value={availabilityData.sessionDuration} onChange={(e) => setAvailabilityData({ ...availabilityData, sessionDuration: e.target.value })} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            ) : (
                                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{availabilityData.sessionDuration} Mins</p>
                            )}
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Max / Week</label>
                            {isEditing ? (
                                <input type="number" value={availabilityData.maxSessionsPerWeek} onChange={(e) => setAvailabilityData({ ...availabilityData, maxSessionsPerWeek: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            ) : (
                                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b' }}>{availabilityData.maxSessionsPerWeek} Sessions</p>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: '24px', padding: isMobile ? '1.25rem' : '1.5rem', border: '1px solid #e2e8f0', alignSelf: 'start' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={18} color="#3b82f6" /> Bookings
                    </h3>
                    {busySlots.length === 0 ? (
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>No upcoming sessions.</p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {busySlots.map((slot, i) => (
                                <div key={i} style={{ background: 'white', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#3b82f6' }}>{new Date(slot.startTime).toLocaleDateString()}</div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>{new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '0.4rem' }}>{slot.menteeName ? `With ${slot.menteeName}` : 'Booked'}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Availability;
