/**
 * Utility to generate "Add to Google Calendar" URLs without an API key.
 */

export const generateGoogleCalendarUrl = (session) => {
    if (!session) return '';

    const { mentorName, menteeName, dateTime, duration = 60, topic, meetLink } = session;

    const start = new Date(dateTime);
    const end = new Date(start.getTime() + duration * 60000);

    const formatDate = (date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
    };

    const title = encodeURIComponent(`Mentorship Session: ${mentorName} & ${menteeName}`);
    const details = encodeURIComponent(`Topic: ${topic || 'General Mentorship'}\nMeeting Link: ${meetLink}`);
    const location = encodeURIComponent(meetLink);
    const dates = `${formatDate(start)}/${formatDate(end)}`;

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}&dates=${dates}`;
};

/**
 * Generates a consistent Jitsi Meet link for a session
 */
export const generateFallbackMeetLink = (sessionId) => {
    // Using a clean, unique ID for Jitsi
    const cleanId = sessionId.replace(/[^a-zA-Z0-9]/g, '');
    return `https://meet.jit.si/MentorMatch_${cleanId}`;
};
