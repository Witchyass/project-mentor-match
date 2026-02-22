# 🧠 AI Matching Engine

MentorMatch uses a sophisticated **Vector Space Model** to calculate compatibility between mentors and mentees. This ensures that every connection is backed by data-driven alignment.

## 📊 The Scoring Algorithm

The compatibility score (0-100%) is calculated using a weighted average of four primary feature vectors:

| Feature | Weight | Description |
| :--- | :--- | :--- |
| **Skills & Interests** | 45% | Overlap between mentor expertise and mentee interests. |
| **Career Alignment** | 35% | Keyword similarity in career titles and goal descriptions. |
| **Experience Delta** | 15% | Ensures mentors have more experience than mentees (and vice-versa). |
| **Availability** | 5% | Overlapping free days in weekly schedules. |

---

## 🔍 Key Mechanisms

### 1. Semantic Skill Mapping
The engine doesn't just look for exact word matches. It uses a **Semantic Expansion Map** to understand related technologies.
- **Example**: If a mentor lists "React", the engine automatically considers them a match for mentees interested in "Frontend", "Javascript", "UI", and "Web".
- **Supported Domains**: Software Engineering (Frontend/Backend/Mobile), Data Science, AI/ML, Design (UI/UX), Management (Agile/Scrum), and DevOps.

### 2. Career Trajectory Analysis
We use **Cosine Similarity** to compare career goal descriptions. This allows us to match users who use different terminology to describe the same professional path.

### 3. Preference Bonuses
Beyond the core weights, the engine applies "compatibility boosters":
- **Mentorship Style**: A +15% bonus is applied if both users prefer the same style (e.g., both prefer "Goal-oriented" or "Collaborative").
- **Location Preference**: A +10% bonus is applied if a mentee has a specific country preference that matches the mentor's location.

### 4. Smart Ranking & Deck Density
- **For Mentees**: The discovery deck is dynamically ranked to show the top 10 most compatible gurus first.
- **For Mentors**: Shows all potential mentees ranked by how well the mentor can help them.

---

## 🛠 Technical Implementation

The engine is implemented in `src/utils/matchingEngine.js` as a modular utility:
- **`calculateCompatibility(user, target)`**: The core scoring function.
- **`rankMatches(currentUser, allUsers)`**: The batch processing function used by the discovery UI.

> [!NOTE]
> All calculations are performed client-side to ensure privacy and low-latency swiping experiences.
