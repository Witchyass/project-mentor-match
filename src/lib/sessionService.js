import { db } from './firebase';
import { ref, push, set, serverTimestamp, onValue, get, update } from 'firebase/database';

import { generateFallbackMeetLink } from '../utils/calendarUtils';

const getMeetingLink = (sessionId, mentorProfile) => {
    if (mentorProfile?.personalMeetLink) return mentorProfile.personalMeetLink;
    return generateFallbackMeetLink(sessionId);
};

/**
 * Finds if there is an active upcoming session between two users
 */
export const findActiveSession = async (userId1, userId2) => {
    const sessionsRef = ref(db, 'sessions');
    const snapshot = await get(sessionsRef);
    if (!snapshot.exists()) return null;

    const data = snapshot.val();
    const now = new Date();

    return Object.values(data).find(s =>
        ((s.mentorId === userId1 && s.menteeId === userId2) || (s.mentorId === userId2 && s.menteeId === userId1)) &&
        s.status === 'scheduled' &&
        new Date(s.dateTime) > now
    ) || null;
};

/**
 * Creates a new session between mentor and mentee
 */
export const createSession = async (mentorId, menteeId, mentorProfile, menteeProfile, dateTime, duration = 60, topic = '') => {
    if (!mentorId || !menteeId || !dateTime) {
        throw new Error("Missing required session data");
    }

    const sessionsRef = ref(db, 'sessions');
    const newSessionRef = push(sessionsRef);
    const sessionId = newSessionRef.key;
    const meetLink = getMeetingLink(sessionId, mentorProfile);

    const sessionData = {
        id: sessionId,
        mentorId,
        menteeId,
        mentorName: mentorProfile?.name || 'Mentor',
        menteeName: menteeProfile?.name || 'Mentee',
        mentorImage: mentorProfile?.profileImage || '',
        menteeImage: menteeProfile?.profileImage || '',
        dateTime,
        duration, // in minutes
        meetLink,
        status: 'scheduled', // scheduled, completed, cancelled
        createdAt: serverTimestamp(),
        reminders: true,
        topic: topic || mentorProfile?.expectedTopic || 'Strategy Session'
    };

    const updates = {};
    updates[`sessions/${sessionId}`] = sessionData;

    // AUTO-LOCK: Add to busy slots for the mentor
    const slotKey = new Date(dateTime).getTime().toString();
    updates[`users/${mentorId}/busySlots/${slotKey}`] = {
        startTime: dateTime,
        duration,
        sessionId,
        menteeName: menteeProfile?.name || 'Mentee'
    };

    // Add notification for both users
    const mentorNotifRef = ref(db, `notifications/${mentorId}`);
    const menteeNotifRef = ref(db, `notifications/${menteeId}`);
    const mentorNotif = push(mentorNotifRef);
    const menteeNotif = push(menteeNotifRef);

    updates[`notifications/${mentorId}/${mentorNotif.key}`] = {
        id: mentorNotif.key,
        text: `Session scheduled with ${menteeProfile?.name || 'mentee'} on ${new Date(dateTime).toLocaleDateString()}`,
        type: 'session_scheduled',
        sessionId,
        read: false,
        timestamp: serverTimestamp()
    };

    updates[`notifications/${menteeId}/${menteeNotif.key}`] = {
        id: menteeNotif.key,
        text: `Session scheduled with ${mentorProfile?.name || 'mentor'} on ${new Date(dateTime).toLocaleDateString()}`,
        type: 'session_scheduled',
        sessionId,
        read: false,
        timestamp: serverTimestamp()
    };

    // CHAT SYNC: Add session invite to chat
    const chatId = [mentorId, menteeId].sort().join('_');
    const chatRef = ref(db, `chats/${chatId}`);
    const chatMsgRef = push(chatRef);

    updates[`chats/${chatId}/${chatMsgRef.key}`] = {
        id: chatMsgRef.key,
        type: 'session_invite',
        text: `📅 New Session Scheduled: ${new Date(dateTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
        sender: 'system',
        sessionId,
        meetLink,
        timestamp: serverTimestamp()
    };

    try {
        await update(ref(db), updates);
        console.log("Session created successfully:", sessionId);
        return { success: true, sessionId, meetLink };
    } catch (error) {
        console.error("Failed to create session:", error);
        throw error;
    }
};

/**
 * Subscribe to user's sessions (both as mentor and mentee)
 */
export const subscribeToUserSessions = (userId, callback) => {
    const sessionsRef = ref(db, 'sessions');
    return onValue(sessionsRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const sessions = Object.keys(data)
                .map(key => ({ id: key, ...data[key] }))
                .filter(session => session.mentorId === userId || session.menteeId === userId)
                .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
            callback(sessions);
        } else {
            callback([]);
        }
    }, (error) => {
        console.error("❌ Error subscribing to user sessions:", error);
        callback([]); // Return empty list on error to stop loading spinner
    });
};

/**
 * Get upcoming sessions for a user
 */
export const getUpcomingSessions = async (userId) => {
    const sessionsRef = ref(db, 'sessions');
    const snapshot = await get(sessionsRef);

    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    const now = new Date();

    return Object.keys(data)
        .map(key => ({ id: key, ...data[key] }))
        .filter(session =>
            (session.mentorId === userId || session.menteeId === userId) &&
            session.status === 'scheduled' &&
            new Date(session.dateTime) > now
        )
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
};

/**
 * Get past sessions for a user
 */
export const getPastSessions = async (userId) => {
    const sessionsRef = ref(db, 'sessions');
    const snapshot = await get(sessionsRef);

    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    const now = new Date();

    return Object.keys(data)
        .map(key => ({ id: key, ...data[key] }))
        .filter(session =>
            (session.mentorId === userId || session.menteeId === userId) &&
            (session.status === 'completed' || new Date(session.dateTime) < now)
        )
        .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
};
/**
 * Update session status
 */
export const updateSessionStatus = async (sessionId, status) => {
    try {
        await update(ref(db, `sessions/${sessionId}`), { status });
        return { success: true };
    } catch (error) {
        console.error("Failed to update session status:", error);
        throw error;
    }
};

/**
 * Mark a session as complete and release the slot
 */
export const completeSession = async (sessionId) => {
    try {
        const sessionRef = ref(db, `sessions/${sessionId}`);
        const snapshot = await get(sessionRef);

        if (!snapshot.exists()) {
            throw new Error("Session not found");
        }

        const session = snapshot.val();
        const { mentorId, dateTime } = session;
        const slotKey = new Date(dateTime).getTime().toString();

        const updates = {};
        updates[`sessions/${sessionId}/status`] = 'completed';
        updates[`users/${mentorId}/busySlots/${slotKey}`] = null;

        // CHAT SYNC: Add session completion to chat
        const { menteeId } = session;
        const chatId = [mentorId, menteeId].sort().join('_');
        const chatRef = ref(db, `chats/${chatId}`);
        const chatMsgRef = push(chatRef);

        updates[`chats/${chatId}/${chatMsgRef.key}`] = {
            id: chatMsgRef.key,
            type: 'session_completed',
            text: `✅ Session Completed! How was the experience?`,
            sender: 'system',
            sessionId,
            timestamp: serverTimestamp()
        };

        await update(ref(db), updates);
        return { success: true };
    } catch (error) {
        console.error("Failed to complete session:", error);
        throw error;
    }
};

/**
 * Cancel a session
 */
export const cancelSession = async (sessionId, userId, userName) => {
    const sessionRef = ref(db, `sessions/${sessionId}`);
    const snapshot = await get(sessionRef);

    if (!snapshot.exists()) {
        throw new Error("Session not found");
    }

    const session = snapshot.val();
    const otherUserId = session.mentorId === userId ? session.menteeId : session.mentorId;

    const updates = {};
    updates[`sessions/${sessionId}/status`] = 'cancelled';

    // UNLOCK: Remove from busy slots
    const slotKey = new Date(session.dateTime).getTime().toString();
    updates[`users/${session.mentorId}/busySlots/${slotKey}`] = null;

    // Notify the other user
    const notifRef = ref(db, `notifications/${otherUserId}`);
    const newNotif = push(notifRef);

    updates[`notifications/${otherUserId}/${newNotif.key}`] = {
        id: newNotif.key,
        text: `${userName} cancelled the session scheduled for ${new Date(session.dateTime).toLocaleDateString()}`,
        type: 'session_cancelled',
        sessionId,
        read: false,
        timestamp: serverTimestamp()
    };

    try {
        await update(ref(db), updates);
        return { success: true };
    } catch (error) {
        console.error("Failed to cancel session:", error);
        throw error;
    }
};

/**
 * Reschedule an existing session
 */
export const rescheduleSession = async (oldSessionId, newDateTime, initiatorProfile, newTopic = '') => {
    const sessionRef = ref(db, `sessions/${oldSessionId}`);
    const snapshot = await get(sessionRef);

    if (!snapshot.exists()) {
        throw new Error("Original session not found");
    }

    const oldSession = snapshot.val();
    const { mentorId, menteeId, mentorName, menteeName, mentorImage, menteeImage, duration, topic } = oldSession;

    // 1. Prepare Updates
    const updates = {};

    // Cancel Old
    updates[`sessions/${oldSessionId}/status`] = 'rescheduled';
    const oldSlotKey = new Date(oldSession.dateTime).getTime().toString();
    updates[`users/${mentorId}/busySlots/${oldSlotKey}`] = null;

    // Create New
    const sessionsRef = ref(db, 'sessions');
    const newSessionRef = push(sessionsRef);
    const newSessionId = newSessionRef.key;

    // Get Mentor Profile for Meat Link (we need it again)
    const mentorSnap = await get(ref(db, `users/${mentorId}`));
    const mentorProfile = mentorSnap.val();
    const meetLink = getMeetingLink(newSessionId, mentorProfile);

    const newSessionData = {
        id: newSessionId,
        mentorId,
        menteeId,
        mentorName,
        menteeName,
        mentorImage,
        menteeImage,
        dateTime: newDateTime,
        duration: duration || 60,
        meetLink,
        status: 'scheduled',
        createdAt: serverTimestamp(),
        topic: newTopic || topic || 'Strategy Session',
        rescheduledFrom: oldSessionId
    };

    updates[`sessions/${newSessionId}`] = newSessionData;

    // Lock New Slot
    const newSlotKey = new Date(newDateTime).getTime().toString();
    updates[`users/${mentorId}/busySlots/${newSlotKey}`] = {
        startTime: newDateTime,
        duration: duration || 60,
        sessionId: newSessionId,
        menteeName: menteeName // Store for display on availability page
    };

    // 2. Notifications
    const otherUserId = initiatorProfile.id === mentorId ? menteeId : mentorId;
    const notifRef = ref(db, `notifications/${otherUserId}`);
    const newNotif = push(notifRef);

    updates[`notifications/${otherUserId}/${newNotif.key}`] = {
        id: newNotif.key,
        text: `${initiatorProfile.name} rescheduled your session to ${new Date(newDateTime).toLocaleString()}`,
        type: 'session_rescheduled',
        sessionId: newSessionId,
        read: false,
        timestamp: serverTimestamp()
    };

    // 3. Chat Sync
    const chatId = [mentorId, menteeId].sort().join('_');
    const chatRef = ref(db, `chats/${chatId}`);
    const chatMsgRef = push(chatRef);

    updates[`chats/${chatId}/${chatMsgRef.key}`] = {
        id: chatMsgRef.key,
        type: 'session_invite',
        text: `🔄 Session Rescheduled: ${new Date(newDateTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`,
        sender: 'system',
        sessionId: newSessionId,
        meetLink,
        timestamp: serverTimestamp()
    };

    try {
        await update(ref(db), updates);
        return { success: true, sessionId: newSessionId, meetLink };
    } catch (error) {
        console.error("Failed to reschedule session:", error);
        throw error;
    }
};

/**
 * Get session statistics for a user
 */
export const getSessionStats = async (userId, role) => {
    const sessionsRef = ref(db, 'sessions');
    const snapshot = await get(sessionsRef);

    if (!snapshot.exists()) {
        return {
            total: 0,
            completed: 0,
            upcoming: 0,
            cancelled: 0,
            totalHours: 0
        };
    }

    const data = snapshot.val();
    const userSessions = Object.values(data).filter(session =>
        role === 'mentor' ? session.mentorId === userId : session.menteeId === userId
    );

    const now = new Date();

    return {
        total: userSessions.length,
        completed: userSessions.filter(s => s.status === 'completed').length,
        upcoming: userSessions.filter(s => s.status === 'scheduled' && new Date(s.dateTime) > now).length,
        cancelled: userSessions.filter(s => s.status === 'cancelled').length,
        totalHours: userSessions.reduce((sum, s) => sum + (s.duration || 60), 0) / 60
    };
};
