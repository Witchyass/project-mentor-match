# 🤝 MentorMatch: Africa's Premier Mentorship Network

**A High-End, AI-Powered Discovery & Mentorship Platform.**

MentorMatch is designed to bridge the gap between aspiring talent and industry leaders across the African professional landscape. Built with a "Tinder-style" discovery experience, the platform uses intelligent vector-based matching to connect users based on career goals, skills, and industry experience.

---

## ✨ Premium Features

### 🎯 Intelligent Discovery
- **Swipe-to-Match**: A fluid, Tinder-style interface for browsing potential mentors or mentees using **Framer Motion** physics.
- **AI Matching Engine**: Real-time compatibility scoring (0-100%) calculated using semantic skill overlapping and career trajectory analysis.
- **Role Mastery**: Optimized discovery paths for both mentors and mentees with dedicated dashboard views.

### 💬 Seamless Collaboration
- **Real-Time Messaging**: Instant communication powered by **Firebase Realtime Database**.
- **Contextual Notifications**: Match requests, acceptances, and new message alerts delivered instantly to your sidebar.
- **Session Booking**: Integrated calendar and scheduling system for managing mentorship sessions.

### 📊 Growth Insights
- **Impact Dashboard**: Visualized stats, career timelines, and skill progress trackers.
- **Comprehensive Profiles**: Rich user profiles featuring bios, expert endorsements, and verified skills.

### 🎨 State-of-the-Art Design
- **Glassmorphism UI**: A stunning, modern interface with blurred translucent layers and vibrant gradients.
- **Dynamic Theming**: Premium Light and Dark mode support that adapts to your system preferences.
- **Responsive Layout**: Designed to feel native on mobile, tablet, and desktop.

---

## 🛠 Tech Stack

- **Frontend**: [React.js](https://reactjs.org/) + [Vite](https://vitejs.dev/) for high-performance builds.
- **Routing**: [React Router Dom](https://reactrouter.com/) with SPA hash navigation.
- **State & Persistence**: [Firebase](https://firebase.google.com/) (Authentication & Realtime Database).
- **Styling**: Vanilla CSS with modern **Design Tokens** and glassmorphism utilities.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for fluid, 60fps UI transitions.
- **Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for core logic and UI verification.

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Firebase Configuration
MentorMatch requires a Firebase project. Update the configuration in `src/lib/firebase.js` with your project keys:
```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  databaseURL: "YOUR_RTDB_URL",
  // ...
};
```

### 3. Local Development
Run the development server:
```bash
npm run dev
```

---

## 🧪 Testing & Verification

We maintain a suite of unit and component tests to ensure reliability.

**Run All Tests:**
```bash
npm test -- --run
```

**Watch Mode:**
```bash
npm test
```

---

## ☁️ Deployment

### Vercel (Frontend)
The platform is optimized for [Vercel](https://vercel.com).
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **SPA Protocol**: A `vercel.json` is included to handle client-side routing.

### Firebase (Rules)
Ensure you apply the hardened security rules for production:
```bash
firebase deploy --only database
```
> See `REALTIME_DATABASE_RULES.json` for the full security specification.

---

## 🏗 Project Architecture

```text
src/
├── components/   # UI components (Layout, Navbar, Cards, Modals)
├── context/      # Global state (Auth, Theme)
├── lib/          # Backend integration (Firebase, matchService)
├── pages/        # Route-level views (Matcher, Messages, Dashboard)
├── utils/        # Core business logic (AI Matching Engine, Calendar)
└── __tests__/    # Automated test suite
```

Built with ❤️ for the next generation of African leaders.
