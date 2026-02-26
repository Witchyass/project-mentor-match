import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Heart, Calendar, Target, MessageSquare } from 'lucide-react';

const DeclineRequestModal = ({ isOpen, onClose, onConfirm, menteeName }) => {
    const [reason, setReason] = useState('');
    const [customMessage, setCustomMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const reasons = useMemo(() => [
        {
            id: 'capacity',
            label: 'At capacity',
            icon: <Calendar size={18} />,
            template: `Hi ${menteeName}, I'm currently at my capacity for mentees and wouldn't be able to give your journey the time it deserves right now. Please don't be discouraged—there are many other fantastic mentors here!`
        },
        {
            id: 'fit',
            label: 'Expertise Mismatch',
            icon: <Target size={18} />,
            template: `Hi ${menteeName}, after reviewing your goals, I believe another mentor with more specific experience in your area would be a better fit to help you reach your full potential.`
        },
        {
            id: 'schedule',
            label: 'Schedule Conflict',
            icon: <Calendar size={18} />,
            template: `Hi ${menteeName}, my current schedule is quite packed for the next few months. I'd hate to start a mentorship that I can't stay consistent with. I recommend connecting with another mentor who has more immediate availability!`
        },
        {
            id: 'other',
            label: 'Other / Custom',
            icon: <MessageSquare size={18} />,
            template: ''
        }
    ], [menteeName]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalMessage = reason === 'other' ? customMessage : reasons.find(r => r.id === reason)?.template || customMessage;

        if (!finalMessage.trim()) {
            alert("Please provide a supportive message for the mentee.");
            return;
        }

        setIsSubmitting(true);
        await onConfirm(finalMessage);
        setIsSubmitting(false);
        onClose();
        setReason('');
        setCustomMessage('');
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
                        style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        style={{
                            width: '100%',
                            maxWidth: '500px',
                            background: 'white',
                            borderRadius: '32px',
                            overflow: 'hidden',
                            position: 'relative',
                            zIndex: 1,
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '2rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>Respond with Care</h2>
                                <p style={{ fontSize: '0.9rem', color: '#475569', marginTop: '0.25rem' }}>Help {menteeName} stay encouraged on their journey.</p>
                            </div>
                            <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer', color: '#475569' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
                            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '1rem', display: 'block' }}>Select a supportive reason:</label>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                {reasons.map(r => (
                                    <button
                                        key={r.id}
                                        type="button"
                                        onClick={() => {
                                            setReason(r.id);
                                            if (r.id !== 'other') setCustomMessage(r.template);
                                        }}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '16px',
                                            border: '2px solid',
                                            borderColor: reason === r.id ? '#3b82f6' : '#f1f5f9',
                                            background: reason === r.id ? '#eff6ff' : 'white',
                                            color: reason === r.id ? '#1e40af' : '#475569',
                                            fontSize: '0.85rem',
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem',
                                            cursor: 'pointer',
                                            transition: '0.2s',
                                            textAlign: 'left'
                                        }}
                                    >
                                        <div style={{ color: reason === r.id ? '#3b82f6' : '#475569' }}>{r.icon}</div>
                                        {r.label}
                                    </button>
                                ))}
                            </div>

                            <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '1rem', display: 'block' }}>Preview message to {menteeName}:</label>
                            <div style={{ position: 'relative' }}>
                                <textarea
                                    value={customMessage}
                                    onChange={e => setCustomMessage(e.target.value)}
                                    placeholder={reason === 'other' ? "Type your supportive note here..." : "Choose a reason above or edit this message..."}
                                    style={{
                                        width: '100%',
                                        padding: '1.25rem',
                                        borderRadius: '16px',
                                        border: '1px solid #e2e8f0',
                                        minHeight: '140px',
                                        fontSize: '0.95rem',
                                        lineHeight: 1.6,
                                        color: '#1e293b',
                                        marginBottom: '2rem',
                                        resize: 'none',
                                        background: '#f8fafc'
                                    }}
                                />
                                <div style={{ position: 'absolute', bottom: '2.75rem', right: '1rem', fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                                    Your message will be sent privately.
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button type="button" onClick={onClose} className="btn" style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569' }}>Cancel</button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !customMessage.trim()}
                                    className="btn btn-primary"
                                    style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    {isSubmitting ? 'Sending...' : <><Send size={18} /> Send with Care</>}
                                </button>
                            </div>

                            <p style={{ fontSize: '0.8rem', color: '#475569', textAlign: 'center', marginTop: '1.5rem', fontWeight: 500 }}>
                                <Heart size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                                We'll encourage {menteeName} to explore other great mentors.
                            </p>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DeclineRequestModal;
