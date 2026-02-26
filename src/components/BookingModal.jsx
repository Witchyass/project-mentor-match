import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, CheckCircle, X, ShieldAlert, Video, Copy } from 'lucide-react';
import { createSession, rescheduleSession } from '../lib/sessionService';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { ref, get } from 'firebase/database';

const BookingModal = ({ isOpen, onClose, mentorProfile, mentorId, rescheduleMode = false, sessionToReschedule = null }) => {
    const { user, profile } = useAuth();
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [topic, setTopic] = useState('');
    const [sendReminders, setSendReminders] = useState(true);
    const [meetLink, setMeetLink] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [existingSession, setExistingSession] = useState(null);
    const [busySlots, setBusySlots] = useState({});

    const isMentor = profile?.role === 'mentor';
    const partnerName = mentorProfile?.name || (isMentor ? 'mentee' : 'mentor');

    // Helper: check if a given time string on the selected date is already taken
    const isTimeTaken = (timeStr, dateStr) => {
        if (!dateStr || !timeStr || !busySlots) return false;
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        const slotDate = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
        const slotKey = slotDate.getTime().toString();
        return !!busySlots[slotKey];
    };

    // Reset ALL state and fetch busySlots whenever the modal opens or target mentee changes
    React.useEffect(() => {
        if (!isOpen) return;

        // Full reset so a new mentee always starts from step 1
        setStep(1);
        setSelectedTime('');
        setMeetLink('');
        setCopiedLink(false);
        setIsCreating(false);
        setExistingSession(null);
        setBusySlots({});

        if (rescheduleMode && sessionToReschedule) {
            setTopic(sessionToReschedule.topic || '');
            setSelectedDate(sessionToReschedule.dateTime.split('T')[0]);
        } else {
            setTopic('');
            setSelectedDate('');
        }

        if (!user || !mentorId) return;

        // Fetch the mentor's busy slots to disable taken times
        const targetMentorId = profile?.role === 'mentor' ? user.uid : mentorId;
        get(ref(db, `users/${targetMentorId}/busySlots`)).then(snap => {
            setBusySlots(snap.exists() ? snap.val() : {});
        });

        import('../lib/sessionService').then(({ findActiveSession }) => {
            findActiveSession(user.uid, mentorId).then(setExistingSession);
        });
    }, [isOpen, user, mentorId, rescheduleMode, sessionToReschedule]);

    // Generate next 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i + 1);
        return {
            display: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: date.toISOString().split('T')[0]
        };
    });

    const times = [
        '09:00 AM', '10:00 AM', '11:00 AM',
        '01:00 PM', '02:00 PM', '03:00 PM',
        '04:00 PM', '05:00 PM'
    ];

    const handleBooking = async () => {
        if (!user || !mentorId) return;

        setIsCreating(true);
        try {
            // Combine date and time into ISO string
            const [time, period] = selectedTime.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'PM' && hours !== 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;

            const dateTimeString = `${selectedDate}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
            const dateTime = new Date(dateTimeString).toISOString();

            let result;

            if (rescheduleMode && sessionToReschedule) {
                result = await rescheduleSession(
                    sessionToReschedule.id,
                    dateTime,
                    profile, // initiator
                    topic
                );
            } else {
                // Correctly assign roles based on who is initiating
                const currentMentorId = isMentor ? user.uid : mentorId;
                const currentMenteeId = isMentor ? mentorId : user.uid;

                const currentMentorProfile = isMentor ? profile : mentorProfile;
                const currentMenteeProfile = isMentor ? mentorProfile : profile;

                result = await createSession(
                    currentMentorId,
                    currentMenteeId,
                    currentMentorProfile,
                    currentMenteeProfile,
                    dateTime,
                    60, // 60 minutes duration
                    topic
                );
            }

            if (result.success) {
                setMeetLink(result.meetLink);
                setStep(3);
            }
        } catch (error) {
            console.error('Error creating session:', error);
            alert('Failed to create session. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const copyMeetLink = () => {
        navigator.clipboard.writeText(meetLink);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        style={{ width: '100%', maxWidth: '450px', background: 'white', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-xl)', overflow: 'hidden', position: 'relative', zIndex: 1, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                    >
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontWeight: 800, color: '#1e293b' }}>{rescheduleMode ? 'Reschedule Session' : 'Schedule Session'}</h3>
                            <X size={20} onClick={onClose} cursor="pointer" color="#475569" />
                        </div>

                        <div style={{ padding: '2rem', maxHeight: '70vh', overflowY: 'auto' }}>
                            {existingSession ? (
                                <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                                    <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
                                        <ShieldAlert size={40} color="#f97316" style={{ margin: '0 auto 1rem' }} />
                                        <h4 style={{ color: '#9a3412', fontWeight: 800, marginBottom: '0.5rem' }}>Session Already Scheduled</h4>
                                        <p style={{ fontSize: '0.9rem', color: '#c2410c' }}>
                                            You already have an upcoming session with {partnerName} on {new Date(existingSession.dateTime).toLocaleDateString()}.
                                        </p>
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        style={{ width: '100%', background: '#22c55e', border: 'none' }}
                                        onClick={() => window.open(existingSession.meetLink, '_blank')}
                                    >
                                        Join Existing Session
                                    </button>
                                    <button
                                        className="btn"
                                        style={{ width: '100%', marginTop: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : step === 1 && (
                                <div className="animate-fade-in">
                                    <p style={{ color: '#475569', marginBottom: '1.5rem', fontWeight: 500 }}>Select a preferred date to meet with <strong>{partnerName}</strong>.</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                                        {dates.map(date => (
                                            <button
                                                key={date.value}
                                                onClick={() => setSelectedDate(date.value)}
                                                style={{
                                                    padding: '1rem',
                                                    borderRadius: 'var(--radius-md)',
                                                    border: `1px solid ${selectedDate === date.value ? '#3b82f6' : '#e2e8f0'}`,
                                                    background: selectedDate === date.value ? '#eff6ff' : 'white',
                                                    color: selectedDate === date.value ? '#1e40af' : '#475569',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 700,
                                                    cursor: 'pointer',
                                                    transition: 'var(--transition)'
                                                }}
                                            >
                                                {date.display}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: '2rem' }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.75rem', color: '#1e293b' }}>Session Topic</p>
                                        <input
                                            type="text"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            placeholder="e.g., Career Advice, Resume Review..."
                                            style={{
                                                width: '100%',
                                                padding: '1rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid #e2e8f0',
                                                background: '#f8fafc',
                                                color: '#1e293b',
                                                outline: 'none',
                                                fontSize: '0.95rem'
                                            }}
                                        />
                                    </div>

                                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }} disabled={!selectedDate || !topic.trim()} onClick={() => setStep(2)}>Next Step</button>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="animate-fade-in">
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        {times.map(time => {
                                            const taken = isTimeTaken(time, selectedDate);
                                            const isSelected = selectedTime === time;
                                            return (
                                                <button
                                                    key={time}
                                                    disabled={taken}
                                                    onClick={() => !taken && setSelectedTime(time)}
                                                    style={{
                                                        padding: '1rem',
                                                        borderRadius: 'var(--radius-md)',
                                                        border: `1px solid ${isSelected ? '#3b82f6' : taken ? '#f1f5f9' : '#e2e8f0'}`,
                                                        background: isSelected ? '#3b82f6' : taken ? '#f8fafc' : 'white',
                                                        color: isSelected ? 'white' : taken ? '#cbd5e1' : '#1e293b',
                                                        cursor: taken ? 'not-allowed' : 'pointer',
                                                        textAlign: 'left',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        gap: '1rem',
                                                        opacity: taken ? 0.6 : 1,
                                                        fontWeight: 700,
                                                        transition: '0.2s'
                                                    }}
                                                >
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <Clock size={16} />
                                                        {time}
                                                    </span>
                                                    {taken && (
                                                        <span style={{
                                                            fontSize: '0.7rem',
                                                            fontWeight: 800,
                                                            background: '#fee2e2',
                                                            color: '#ef4444',
                                                            padding: '2px 8px',
                                                            borderRadius: '100px'
                                                        }}>
                                                            TAKEN
                                                        </span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Calendar size={18} color="#3b82f6" />
                                            <div>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 800, color: '#1e293b' }}>Automated Reminders</p>
                                                <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Email + Google Calendar</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={sendReminders}
                                            onChange={() => setSendReminders(!sendReminders)}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                                        <button className="btn" style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }} onClick={() => setStep(1)}>Back</button>
                                        <button className="btn btn-primary" style={{ flex: 2, fontWeight: 800, border: 'none' }} disabled={!selectedTime || isCreating} onClick={handleBooking}>
                                            {isCreating ? 'Processing...' : (rescheduleMode ? 'Confirm Reschedule' : 'Confirm Booking')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="animate-fade-in" style={{ textAlign: 'center', padding: '1rem 0' }}>
                                    <div style={{ width: '80px', height: '80px', background: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'white' }}>
                                        <CheckCircle size={48} />
                                    </div>
                                    <h2 style={{ marginBottom: '0.5rem', color: '#1e293b', fontWeight: 900 }}>{rescheduleMode ? 'Session Rescheduled!' : 'Session Booked!'}</h2>
                                    <p style={{ color: '#475569', marginBottom: '2.5rem', fontWeight: 500 }}>
                                        See you on {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} at {selectedTime}!
                                    </p>

                                    <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', textAlign: 'left', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                            <Video size={20} color="#3b82f6" />
                                            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>Google Meet Link</h3>
                                        </div>
                                        <div style={{
                                            background: 'white',
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            fontFamily: 'monospace',
                                            fontSize: '0.875rem',
                                            wordBreak: 'break-all',
                                            marginBottom: '1rem',
                                            border: '1px solid #e2e8f0',
                                            color: '#1e293b'
                                        }}>
                                            {meetLink}
                                        </div>
                                        <button
                                            onClick={copyMeetLink}
                                            className="btn"
                                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'white', border: '1px solid #e2e8f0', color: '#1e3a8a', fontWeight: 800 }}
                                        >
                                            <Copy size={16} /> {copiedLink ? 'Copied!' : 'Copy Link'}
                                        </button>
                                    </div>

                                    <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', background: '#eff6ff', border: '1px solid #dbeafe' }}>
                                        <ShieldAlert size={20} color="#3b82f6" />
                                        <p style={{ fontSize: '0.75rem', textAlign: 'left', color: '#1e40af', fontWeight: 600 }}><strong>Trust & Safety:</strong> Our AI will moderate this session to ensure a safe environment for both parties.</p>
                                    </div>

                                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>Done</button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BookingModal;
