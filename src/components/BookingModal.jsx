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
                        className="glass"
                        style={{ width: '100%', maxWidth: '450px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', position: 'relative', zIndex: 1 }}
                    >
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontWeight: 800 }}>{rescheduleMode ? 'Reschedule Session' : 'Schedule Session'}</h3>
                            <X size={20} onClick={onClose} cursor="pointer" />
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
                                        style={{ width: '100%', background: '#22c55e' }}
                                        onClick={() => window.open(existingSession.meetLink, '_blank')}
                                    >
                                        Join Existing Session
                                    </button>
                                    <button
                                        className="btn glass"
                                        style={{ width: '100%', marginTop: '1rem' }}
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : step === 1 && (
                                <div className="animate-fade-in">
                                    <p style={{ opacity: 0.6, marginBottom: '1.5rem' }}>Select a preferred date to meet with <strong>{partnerName}</strong>.</p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                                        {dates.map(date => (
                                            <button
                                                key={date.value}
                                                className={`glass ${selectedDate === date.value ? 'btn-primary' : ''}`}
                                                onClick={() => setSelectedDate(date.value)}
                                                style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'var(--transition)' }}
                                            >
                                                {date.display}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={{ marginTop: '1.5rem' }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text)' }}>Session Topic</p>
                                        <input
                                            type="text"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            placeholder="e.g., Career Advice, Resume Review..."
                                            style={{
                                                width: '100%',
                                                padding: '1rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--border)',
                                                background: 'rgba(255,255,255,0.5)',
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
                                                        border: `1px solid ${isSelected ? 'var(--primary)' : taken ? '#e2e8f0' : 'var(--border)'}`,
                                                        background: isSelected ? 'var(--primary)' : taken ? '#f8fafc' : 'rgba(255,255,255,0.7)',
                                                        color: isSelected ? 'white' : taken ? '#cbd5e1' : 'inherit',
                                                        cursor: taken ? 'not-allowed' : 'pointer',
                                                        textAlign: 'left',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        gap: '1rem',
                                                        opacity: taken ? 0.6 : 1,
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

                                    <div className="glass" style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <Calendar size={18} color="var(--primary)" />
                                            <div>
                                                <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>Automated Reminders</p>
                                                <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>Email + Google Calendar</p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={sendReminders}
                                            onChange={() => setSendReminders(!sendReminders)}
                                            style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                                        <button className="btn glass" style={{ flex: 1 }} onClick={() => setStep(1)}>Back</button>
                                        <button className="btn btn-primary" style={{ flex: 2 }} disabled={!selectedTime || isCreating} onClick={handleBooking}>
                                            {isCreating ? 'Processing...' : (rescheduleMode ? 'Confirm Reschedule' : 'Confirm Booking')}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="animate-fade-in" style={{ textAlign: 'center', padding: '1rem 0' }}>
                                    <div style={{ width: '80px', height: '80px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'white' }}>
                                        <CheckCircle size={48} />
                                    </div>
                                    <h2 style={{ marginBottom: '0.5rem' }}>{rescheduleMode ? 'Session Rescheduled!' : 'Session Booked!'}</h2>
                                    <p style={{ opacity: 0.6, marginBottom: '2rem' }}>
                                        See you on {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} at {selectedTime}!
                                    </p>

                                    <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', textAlign: 'left' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                            <Video size={20} color="var(--primary)" />
                                            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Google Meet Link</h3>
                                        </div>
                                        <div style={{
                                            background: 'var(--background)',
                                            padding: '0.75rem 1rem',
                                            borderRadius: 'var(--radius-md)',
                                            fontFamily: 'monospace',
                                            fontSize: '0.875rem',
                                            wordBreak: 'break-all',
                                            marginBottom: '0.75rem'
                                        }}>
                                            {meetLink}
                                        </div>
                                        <button
                                            onClick={copyMeetLink}
                                            className="btn glass"
                                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                        >
                                            <Copy size={16} /> {copiedLink ? 'Copied!' : 'Copy Link'}
                                        </button>
                                    </div>

                                    <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                        <ShieldAlert size={20} color="var(--primary)" />
                                        <p style={{ fontSize: '0.75rem', textAlign: 'left', opacity: 0.8 }}><strong>Trust & Safety:</strong> Our AI will moderate this session to ensure a safe environment for both parties.</p>
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
