import { db } from './firebase';
import { ref, push, set, serverTimestamp, onValue, get, update } from 'firebase/database';
import logger from '../utils/logger';

/**
 * Sends a match request from a mentee to a mentor.
 * Also creates a notification for the mentor.
 */
export const sendMatchRequest = async (fromUser, fromProfile, toUserId) => {
    if (!fromUser || !toUserId) {
        console.error("Missing required data for match request:", { fromUser: !!fromUser, toUserId });
        return;
    }

    let normalizedToId = toUserId.trim();
    logger.debug("sendMatchRequest: Initiated");

    // IDENTITY BRIDGE: If toUserId is a push-ID, try to find the real Auth UID for this user
    if (normalizedToId.startsWith('-')) {
        logger.debug("Identity Bridge: Checking push-ID");
        try {
            const usersRef = ref(db, 'users');
            const snapshot = await get(usersRef);
            if (snapshot.exists()) {
                const users = snapshot.val();
                let mockProfile = users[normalizedToId];
                if (mockProfile && mockProfile.email) {
                    const targetEmail = mockProfile.email.toLowerCase();
                    // Find any other record with SAME email but a REAL UID key
                    const realUid = Object.keys(users).find(key =>
                        !key.startsWith('-') &&
                        users[key].email?.toLowerCase() === targetEmail
                    );

                    if (realUid) {
                        logger.debug("Identity Bridge: Resolved UID");
                        normalizedToId = realUid;
                    } else {
                        logger.debug("Identity Bridge: No resolution");
                    }
                }
            }
        } catch (bridgeError) {
            console.warn("⚠️ Identity Bridge failed:", bridgeError);
        }
    }

    if (fromUser.uid === normalizedToId) {
        console.error("❌ sendMatchRequest: Cannot send match request to yourself");
        return { success: false, error: "Self-match not allowed" };
    }

    // CHECK FOR EXISTING REQUEST: Prevent duplicate requests
    try {
        const requestsRef = ref(db, 'requests');
        const snapshot = await get(requestsRef);
        if (snapshot.exists()) {
            const allRequests = snapshot.val();
            const existingRequest = Object.values(allRequests).find(req =>
                req.from === fromUser.uid && req.to === normalizedToId
            );
            if (existingRequest) {
                logger.log("Duplicate request prevented");
                return { success: false, error: "Request already exists" };
            }
        }
    } catch (checkError) {
        console.warn("⚠️ Could not verify existing requests:", checkError);
    }

    const requestRef = ref(db, 'requests');
    const newRequestRef = push(requestRef);
    const requestId = newRequestRef.key;

    const menteeDetails = {
        name: fromProfile?.name || fromUser.displayName || 'Anonymous',
        career: fromProfile?.career || 'N/A',
        skills: fromProfile?.skills || [],
        bio: fromProfile?.bio || '',
        experienceLevel: fromProfile?.experienceLevel || 'New',
        profileImage: fromProfile?.profileImage || ''
    };

    const requestData = {
        id: requestId,
        from: fromUser.uid,
        fromName: menteeDetails.name,
        to: toUserId,
        toEmail: null, // We'll try to find this if possible
        status: 'pending',
        menteeDetails,
        timestamp: serverTimestamp()
    };

    // Try to fetch target user email for legacy fallback
    try {
        const targetSnap = await get(ref(db, `users/${toUserId}`));
        if (targetSnap.exists()) {
            const data = targetSnap.val();
            requestData.toEmail = data.email || null;
        }
    } catch (e) {
        console.warn("Could not fetch target email for request");
        requestData.toEmail = null;
    }

    // Create notification for the mentor
    const notifRef = ref(db, `notifications/${toUserId}`);
    const newNotifRef = push(notifRef);

    const updates = {};
    updates[`requests/${requestId}`] = requestData;
    updates[`notifications/${normalizedToId}/${newNotifRef.key}`] = {
        id: newNotifRef.key,
        text: `${menteeDetails.name} has requested a match with you!`,
        type: 'match_request',
        requestId: requestId,
        fromId: fromUser.uid,
        menteeDetails,
        read: false,
        timestamp: serverTimestamp()
    };

    try {
        await update(ref(db), updates);
        logger.log("Match request successfully sent");
        return { success: true, requestId };
    } catch (error) {
        console.error("❌ Firebase update failed for match request:", error);
        console.error("Error details:", error.message);
        throw error;
    }
};

/**
 * Accepts a match request.
 * Updates request status, creates a match, and notifies the mentee.
 */
export const acceptMatchRequest = async (request, mentorProfile) => {
    if (!request || !request.id || !request.from) {
        console.error("Invalid request object for acceptance:", request);
        throw new Error("Missing request data (ID or sender).");
    }

    const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mentorName = mentorProfile?.name || 'A mentor';
    const menteeId = request.from;

    logger.debug("Accepting match request");

    // Create match and update request
    const updates = {};
    updates[`requests/${request.id}/status`] = 'accepted';
    updates[`matches/${matchId}`] = {
        users: [menteeId, request.to],
        mentorId: request.to,
        menteeId: menteeId,
        createdAt: serverTimestamp()
    };

    // Notify the mentee
    const menteeNotifRef = ref(db, `notifications/${menteeId}`);
    const newMenteeNotifRef = push(menteeNotifRef);

    updates[`notifications/${menteeId}/${newMenteeNotifRef.key}`] = {
        id: newMenteeNotifRef.key,
        text: `${mentorName} accepted your match request! You can now start chatting.`,
        type: 'match_accepted',
        matchId: matchId,
        fromId: request.to, // Mentor ID
        mentorDetails: {
            name: mentorName,
            career: mentorProfile?.career || 'N/A',
            skills: mentorProfile?.skills || [],
            bio: mentorProfile?.bio || '',
            profileImage: mentorProfile?.profileImage || ''
        },
        read: false,
        timestamp: serverTimestamp()
    };

    // Also notify the mentor as a confirmation
    const mentorNotifRef = ref(db, `notifications/${request.to}`);
    const newMentorNotifRef = push(mentorNotifRef);
    updates[`notifications/${request.to}/${newMentorNotifRef.key}`] = {
        id: newMentorNotifRef.key,
        text: `You are now connected with ${request.menteeDetails?.name || 'your new mentee'}!`,
        type: 'match_accepted',
        matchId: matchId,
        fromId: menteeId,
        menteeDetails: request.menteeDetails || {},
        read: true, // Already read since they just clicked it
        timestamp: serverTimestamp()
    };

    try {
        await update(ref(db), updates);
        logger.log("Acceptance updates successful");
        return { success: true, matchId };
    } catch (error) {
        console.error("Firebase update failed during acceptance:", error);
        throw error;
    }
};

/**
 * Sends a notification to a user when they receive a new message.
 */
export const sendMessageNotification = async (fromUser, fromProfile, toUserId, messageText) => {
    if (!fromUser || !toUserId) {
        console.warn("Missing fromUser or toUserId in sendMessageNotification", { fromUser: !!fromUser, toUserId });
        return;
    }

    const notifRef = ref(db, `notifications/${toUserId}`);
    const newNotifRef = push(notifRef);

    logger.debug("Sending message notification");

    try {
        await set(newNotifRef, {
            id: newNotifRef.key,
            text: `New message from ${fromProfile?.name || 'someone'}: "${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}"`,
            type: 'new_message',
            fromId: fromUser.uid,
            read: false,
            timestamp: serverTimestamp()
        });
        logger.debug("Message notification sent");
        return { success: true };
    } catch (error) {
        console.error("❌ Failed to send message notification:", error);
        return { success: false, error: error.message };
    }
};

export const subscribeToNotifications = (userId, callback) => {
    if (!userId) {
        console.warn("subscribeToNotifications called without userId");
        return () => { };
    }

    const notifRef = ref(db, `notifications/${userId}`);
    logger.debug("Setting up notification subscription");

    return onValue(notifRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const list = Object.keys(data).map(key => ({ id: key, ...data[key] }))
                .sort((a, b) => {
                    const timeA = (a.timestamp && typeof a.timestamp === 'number') ? a.timestamp : 0;
                    const timeB = (b.timestamp && typeof b.timestamp === 'number') ? b.timestamp : 0;
                    return timeB - timeA;
                });
            logger.debug("Notifications received");
            callback(list);
        } else {
            callback([]);
        }
    }, (error) => {
        console.error(`❌ notification subscription error for ${userId}:`, error);
        // Alert the user if it's a permission denied error
        if (error.message.includes("permission_denied") || error.code === "PERMISSION_DENIED") {
            console.error("CRITICAL: Firebase Rules are blocking notification reads for this user!");
        }
    });
};

/**
 * Declines a match request with an empathetic custom message.
 */
export const declineMatchRequest = async (requestId, mentorProfile, customMessage) => {
    if (!requestId) {
        console.error("Missing request ID for decline");
        throw new Error("Request ID is required");
    }

    const mentorName = mentorProfile?.name || 'A mentor';

    // 1. Get the request details to know who to notify
    const requestRef = ref(db, `requests/${requestId}`);
    const snapshot = await get(requestRef);
    if (!snapshot.exists()) throw new Error("Request not found");
    const requestData = snapshot.val();
    const menteeId = requestData.from;

    logger.debug("Declining match request");

    const updates = {};
    // Update request status
    updates[`requests/${requestId}/status`] = 'declined';
    updates[`requests/${requestId}/rejectionMessage`] = customMessage;

    // Notify the mentee with an empathetic message
    const menteeNotifRef = ref(db, `notifications/${menteeId}`);
    const newMenteeNotifRef = push(menteeNotifRef);

    updates[`notifications/${menteeId}/${newMenteeNotifRef.key}`] = {
        id: newMenteeNotifRef.key,
        text: `${mentorName} shared some thoughts regarding your match request.`,
        type: 'match_declined',
        requestId: requestId,
        rejectionMessage: customMessage,
        mentorDetails: {
            name: mentorName,
            career: mentorProfile?.career || 'N/A',
            profileImage: mentorProfile?.profileImage || ''
        },
        read: false,
        timestamp: serverTimestamp()
    };

    try {
        await update(ref(db), updates);
        logger.log("Request declined successfully");
        return { success: true };
    } catch (error) {
        console.error("Firebase update failed during decline:", error);
        throw error;
    }
};

/**
 * Marks a notification as read.
 */
export const markNotificationAsRead = async (userId, notifId) => {
    return update(ref(db, `notifications/${userId}/${notifId}`), { read: true });
};

/**
 * Sends a test notification to the current user.
 */
export const sendTestNotification = async (userId) => {
    if (!userId) return;

    const notifRef = ref(db, `notifications/${userId}`);
    const newNotif = push(notifRef);

    try {
        await set(newNotif, {
            id: newNotif.key,
            text: "✅ This is a test notification! It's working.",
            type: 'test',
            timestamp: serverTimestamp(),
            read: false
        });
        console.log("✅ Diagnostic: Test notification sent to", userId);
        return { success: true };
    } catch (error) {
        console.error("❌ Diagnostic: Failed to send test notification:", error);
        throw error;
    }
};

/**
 * Helper to mark a specific request notification as read
 */
export const markRequestNotificationAsRead = async (userId, requestId) => {
    if (!userId || !requestId) return;

    const notifRef = ref(db, `notifications/${userId}`);
    try {
        const snapshot = await get(notifRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const notifId = Object.keys(data).find(key => data[key].requestId === requestId);
            if (notifId) {
                await markNotificationAsRead(userId, notifId);
                console.log(`✅ Marked notification ${notifId} for request ${requestId} as read`);
            }
        }
    } catch (err) {
        console.error("Error marking request notification as read:", err);
    }
};
