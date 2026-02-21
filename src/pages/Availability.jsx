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
    const [error, setError] = useState(null);

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
        if (!user) {
            setLoading(false);
            return;
        }

        const userRef = ref(db, `users/${user.uid}`);
        return onValue(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const data = userData.availability || {};

                setAvailabilityData({
                    ...defaultAvailability,
                    ...data,
                    schedule: Array.isArray(data.schedule) ? data.schedule : defaultAvailability.schedule
                });

                // Fetch busy slots
                if (userData.busySlots) {
                    const slots = Object.values(userData.busySlots)
                        .filter(slot => new Date(slot.startTime) > new Date())
                        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
                    setBusySlots(slots);
                } else {
                    setBusySlots([]);
                }
            }
            setLoading(false);
        }, (err) => {
            console.error("Availability Load Error:", err);
            setError(err.message);
            setLoading(false);
        });
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await update(ref(db, `users/${user.uid}/availability`), availabilityData);
            setIsEditing(false);
        } catch (err) {
            console.error("Availability Save Error:", err);
            alert("Error saving settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div style={{ padding: '10rem 0', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #1e3a8a', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1.5rem', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#64748b', fontWeight: 700 }}>Loading Schedule...</p>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#1e293b' }}>Availability & Schedule</h1>
                    <p style={{ color: '#64748b', fontWeight: 600 }}>Manage your session hours and track your bookings.</p>
                </div>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} style={{ padding: '0.8rem 1.5rem', background: '#1e3a8a', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Edit size={18} /> Edit Weekly Schedule
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={handleSave} disabled={saving} style={{ padding: '0.8rem 2rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {saving ? <Loader2 className="spin" size={18} /> : <Save size={18} />} Save Changes
                        </button>
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', border: '1px solid #f1f5f9' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem' }}>Weekly Commitments</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {availabilityData.schedule.map((day, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '2rem', padding: '1.25rem', borderRadius: '16px', background: day.available ? '#f8fafc' : 'white', border: '1px solid #e2e8f0' }}>
                                    <div style={{ width: '120px', fontWeight: 800, color: day.available ? '#1e3a8a' : '#94a3b8' }}>{day.day}</div>
                                    <div style={{ flex: 1 }}>
                                        {isEditing && day.available ? (
                                            <input value={day.time} onChange={(e) => {
                                                const nS = [...availabilityData.schedule];
                                                nS[idx].time = e.target.value;
                                                setAvailabilityData({ ...availabilityData, schedule: nS });
                                            }} style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                                        ) : (
                                            <span style={{ fontWeight: 600, color: day.available ? '#475569' : '#cbd5e1' }}>{day.available ? day.time : 'Unavailable'}</span>
                                        )}
                                    </div>
                                    {isEditing && (
                                        <button onClick={() => {
                                            const nS = [...availabilityData.schedule];
                                            nS[idx].available = !nS[idx].available;
                                            setAvailabilityData({ ...availabilityData, schedule: nS });
                                        }} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: day.available ? '#fee2e2' : '#f0fdf4', color: day.available ? '#ef4444' : '#10b981', fontWeight: 700, cursor: 'pointer' }}>
                                            {day.available ? 'Set Off' : 'Set On'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ background: 'white', borderRadius: '24px', padding: '2.5rem', border: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#4f46e5', marginBottom: '0.5rem' }}>Session Duration</label>
                            {isEditing ? (
                                <input type="number" value={availabilityData.sessionDuration} onChange={(e) => setAvailabilityData({ ...availabilityData, sessionDuration: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            ) : (
                                <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{availabilityData.sessionDuration} Minutes</p>
                            )}
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#4f46e5', marginBottom: '0.5rem' }}>Max Sessions / Week</label>
                            {isEditing ? (
                                <input type="number" value={availabilityData.maxSessionsPerWeek} onChange={(e) => setAvailabilityData({ ...availabilityData, maxSessionsPerWeek: parseInt(e.target.value) || 0 })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                            ) : (
                                <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{availabilityData.maxSessionsPerWeek}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div style={{ background: '#f8fafc', borderRadius: '24px', padding: '2rem', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={20} color="#6366f1" /> Booked Sessions
                    </h3>

                    {busySlots.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                            <p style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.9rem' }}>No upcoming bookings.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {busySlots.map((slot, i) => (
                                <div key={i} style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6366f1', marginBottom: '0.25rem' }}>
                                        {new Date(slot.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </div>
                                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                                        {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{slot.duration} Min Session</span>
                                        {slot.menteeName && <span style={{ color: '#1e3a8a', fontWeight: 800 }}>with {slot.menteeName}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <AlertCircle size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                            <p style={{ fontSize: '0.8rem', color: '#1e40af', fontWeight: 600, margin: 0 }}>
                                Booked hours are automatically blocked from your public profile to prevent double-bookings.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
};

export default Availability;
