# 🤝 MentorMatch

**A High-End, AI-Powered Discovery & Mentorship Platform.**

MentorMatch is designed to bridge the gap between aspiring talent and industry leaders. Built with a fluid "Tinder-style" discovery experience, the platform uses intelligent vector-based matching to connect users based on career goals, skills, and industry experience.

---

## 📖 In-Depth Documentation

To keep this guide concise, we've broken down our core systems into detailed specialized docs:

- **[🧠 AI Matching Engine](MATCHING.md)**: Data-driven compatibility scoring logic.
- **[💬 Messaging & Meetings](MESSAGING_MEETINGS.md)**: Real-time communication and scheduling mechanics.
- **[🚀 Deployment Plan](DEPLOYMENT.md)**: Step-by-step guide for hosting on Vercel or Firebase.

---

## ✨ Premium Features

### 🎯 Intelligent Discovery
- **Swipe-to-Match**: A fluid interface for browsing potential mentors or mentees using **Framer Motion**.
- **Verified Match Deck**: Mentees see top 10 most compatible "Gurus" ranked by our AI engine.
- **Privacy First**: Users can hide their profiles or restrict visibility at any time.

### 💬 Seamless Collaboration
- **Real-Time Messaging**: Secure instant communication powered by **Firebase**.
- **Session Booking**: Integrated calendar system for scheduling and managing mentorship meetings.
- **Smart Reminders**: Automated alerts for upcoming sessions today.

### 📊 Growth Insights
- **Impact Dashboard**: A single view for match requests, upcoming sessions, and platform activity.
- **Responsive Design**: A premium, glassmorphism UI optimized for all devices.

---

## 🛠 Tech Stack

- **Frontend**: [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **State & DB**: [Firebase](https://firebase.google.com/) (Auth & Realtime Database)
- **Styling**: Vanilla CSS (Modern Design Tokens & Glassmorphism)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Firebase Setup
Update your configuration in `src/lib/firebase.js` with your environment variables (contact the team for a `.env` template).

### 3. Local Development
```bash
npm run dev
```

## 🏗 Project Architecture

```text
src/
├── components/   # UI Layouts, Navbars, Modals
├── context/      # Auth & Theme state
├── lib/          # matchService & Firebase config
├── pages/        # Route views (Matcher, Messages, Settings)
├── utils/        # AI Matching Engine & Logging
└── __tests__/    # Automated unit tests
```

Built with ❤️ for the next generation of industry leaders.
