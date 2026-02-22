# 💬 Messaging & 📅 Meetings

MentorMatch provides a seamless environment for real-time communication and structured mentorship sessions.

## 💬 Real-Time Messaging

The messaging system is built for speed and security, ensuring that professional boundaries are maintained.

### Key Features:
- **Verified Connections**: Users can only initiate a chat after a match request has been **accepted**. This prevents unsolicited messages and maintains platform integrity.
- **Firebase Real-time Database**: Messages are delivered instantly without page refreshes.
- **Rich Context**: Every chat displays the mentor/mentee's current career title and profile image for easy reference.
- **Smart Filtering**: The conversation list automatically sorts by the most recent activity.

### Technical Detail:
- Data is stored in the `chats/` node of the Realtime Database.
- Security rules ensure that only the two participants listed in a chat ID can read or write messages to that path.

---

## 📅 Mentorship Sessions (Meetings)

Structured learning is the heart of the platform. The sessions feature allows users to move from "chatting" to "mentoring".

### 1. Scheduling Workflow
1. **Invite**: A mentor or mentee can propose a session via the "Book Session" button.
2. **Review**: The other party receives a notification on their **Impact Dashboard**.
3. **Confirm**: Once accepted, the session is moved to the "Upcoming" list and added to both users' schedules.

### 2. Smart Reminders
The platform features an automated **Reminder Manager** that flags upcoming sessions:
- **Client-Side Notifications**: Toast alerts appear 15 minutes before a session starts if the user is active on the platform.
- **One-Click Join**: Links to meeting rooms (external or internal) are easily accessible from the dashboard.

### 3. Availability Management
Mentors can set their weekly availability (days and times) in the **Schedule** tab.
- **Status Tracking**: Sessions can be marked as `Pending`, `Accepted`, `Declined`, or `Completed`.
- **Conflict Prevention**: The Impact Dashboard highlights overlapping sessions to help users manage their time effectively.

---

## 🔔 Notification System

Stay updated without refreshing:
- **Sidebar Alerts**: Real-time counter for new match requests and messages.
- **Impact Dashboard**: A centralized view for all urgent actions (pending invites, upcoming sessions today).

> [!TIP]
> To ensure you never miss a session, keep the platform open in a background tab; the **Reminder Manager** will alert you even if you're browsing another part of the site.
