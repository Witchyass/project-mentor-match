import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Send, Check } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose, mentorName }) => {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
        // In real app, push to Firestore
        console.log(`Feedback for ${mentorName}: ${rating} stars, ${feedback}`);
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
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                            {!submitted ? (
                                <form onSubmit={handleSubmit}>
                                    <div style={{ width: '64px', height: '64px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#3b82f6', border: '1px solid #e2e8f0' }}>
                                        <MessageSquare size={32} />
                                    </div>
                                    <h2 style={{ marginBottom: '0.5rem', color: '#1e293b', fontWeight: 900 }}>Session Completed</h2>
                                    <p style={{ color: '#475569', marginBottom: '2.5rem', fontSize: '0.9rem', fontWeight: 500 }}>How was your experience with <strong>{mentorName}</strong>?</p>

                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2.5rem' }}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <Star
                                                key={star}
                                                size={32}
                                                color={star <= rating ? '#f59e0b' : '#cbd5e1'}
                                                fill={star <= rating ? '#f59e0b' : 'transparent'}
                                                cursor="pointer"
                                                onClick={() => setRating(star)}
                                                style={{ transition: '0.2s transform', transform: star <= rating ? 'scale(1.1)' : 'scale(1)' }}
                                            />
                                        ))}
                                    </div>

                                    <textarea
                                        value={feedback}
                                        onChange={e => setFeedback(e.target.value)}
                                        placeholder="Share any thoughts or progress made..."
                                        style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', minHeight: '120px', color: '#1e293b', marginBottom: '2.5rem', background: '#f8fafc', outline: 'none' }}
                                    />

                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button type="button" className="btn" style={{ flex: 1, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }} onClick={onClose}>Skip</button>
                                        <button type="submit" className="btn btn-primary" style={{ flex: 2, fontWeight: 800, border: 'none' }} disabled={!rating}>Submit Review</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="animate-fade-in" style={{ padding: '2rem 0' }}>
                                    <div style={{ width: '80px', height: '80px', background: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'white' }}>
                                        <Check size={48} />
                                    </div>
                                    <h3>Thank you!</h3>
                                    <p style={{ color: '#475569', marginTop: '0.75rem', fontWeight: 500 }}>Your feedback helps us maintain a safe and high-quality community.</p>
                                    <button className="btn btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={onClose}>Back to Messenger</button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default FeedbackModal;
