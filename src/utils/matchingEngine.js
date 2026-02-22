/**
 * AI Matching Engine - Vector Space Model
 * Calculates compatibility scores using feature vectorization and cosine similarity.
 */

const WEIGHTS = {
    SKILLS: 0.45,
    CAREER: 0.35,
    EXPERIENCE: 0.15,
    AVAILABILITY: 0.05
};

const EXPERIENCE_MAP = {
    "Entry": 1,
    "Mid-level": 2,
    "Senior": 3,
    "Expert / Lead": 4
};

// Semantic mapping for common skills to handle partial/related matches
const SKILL_MAP = {
    "react": ["frontend", "javascript", "web", "ui", "nextjs", "typescript"],
    "node": ["backend", "javascript", "server", "api", "express", "sql"],
    "python": ["data science", "backend", "ai", "ml", "django", "flask"],
    "design": ["ui", "ux", "product", "figma", "visual", "prototyping"],
    "management": ["leadership", "strategy", "product", "agile", "scrum", "business"],
    "aws": ["cloud", "devops", "infrastructure", "azure", "gcp", "docker"],
    "javascript": ["frontend", "web", "logic", "typescript", "es6"],
    "marketing": ["growth", "seo", "content", "strategy", "social media"],
    "sales": ["business development", "negotiation", "strategy", "crm"]
};

/**
 * Normalizes a list of skills into a semantic set.
 */
const getSemanticSkills = (skills = []) => {
    const semanticSet = new Set();
    skills.forEach(skill => {
        const s = skill.toLowerCase().trim();
        if (!s) return;
        semanticSet.add(s);
        if (SKILL_MAP[s]) {
            SKILL_MAP[s].forEach(related => semanticSet.add(related));
        }
    });
    return semanticSet;
};

/**
 * Calculates Cosine Similarity between two sets (simplified for feature overlap).
 */
const calculateSimilarity = (setA, setB) => {
    if (setA.size === 0 || setB.size === 0) return 0;
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    return intersection.size / Math.sqrt(setA.size * setB.size);
};

/**
 * Calculates a compatibility score from 0-100 between two profiles.
 */
export const calculateCompatibility = (user, target) => {
    if (!user || !target || user.role === target.role) return 0;

    let finalScore = 0;

    // 1. Semantic Skill Match (45%)
    const userSkills = getSemanticSkills(user.skills || user.interests || []);
    const targetSkills = getSemanticSkills(target.skills || target.expertiseAreas || []);
    const skillSim = calculateSimilarity(userSkills, targetSkills);
    finalScore += skillSim * 100 * WEIGHTS.SKILLS;

    // 2. Career Alignment (35%)
    const userCareer = user.career?.toLowerCase() || "";
    const targetCareer = target.career?.toLowerCase() || "";
    const userCareerWords = new Set(userCareer.split(/[,\s]+/).filter(w => w.length > 2));
    const targetCareerWords = new Set(targetCareer.split(/[,\s]+/).filter(w => w.length > 2));
    const careerSim = calculateSimilarity(userCareerWords, targetCareerWords);

    // Explicit role target check
    if (user.role === 'mentee' && targetCareer.includes(userCareer) && userCareer.length > 3) {
        finalScore += 20 * WEIGHTS.CAREER;
    }
    finalScore += careerSim * 100 * WEIGHTS.CAREER;

    // 3. Experience Delta & Preferences (15%)
    const userExp = EXPERIENCE_MAP[user.experienceLevel] || 1;
    const targetExp = EXPERIENCE_MAP[target.experienceLevel] || 1;

    if (user.role === 'mentee') {
        if (targetExp > userExp) finalScore += 100 * WEIGHTS.EXPERIENCE;
        else if (targetExp === userExp) finalScore += 50 * WEIGHTS.EXPERIENCE;
    } else {
        if (targetExp < userExp) finalScore += 100 * WEIGHTS.EXPERIENCE;
        else if (targetExp === userExp) finalScore += 50 * WEIGHTS.EXPERIENCE;
    }

    // BONUS: Mentorship Style Match
    const userStyle = (user.mentoringStyle || user.mentorshipStyle || "").toLowerCase();
    const targetStyle = (target.mentoringStyle || target.mentorshipStyle || "").toLowerCase();
    if (userStyle && targetStyle && userStyle === targetStyle) {
        finalScore += 15; // Style match is a strong bonus
    }

    // BONUS: Country Preference
    const preferredCountries = user.preferredCountries || [];
    if (preferredCountries.length > 0 && target.country && preferredCountries.includes(target.country)) {
        finalScore += 10;
    }

    // 4. Availability Match (5%) - Fixed overlap check
    const userSchedule = user.availability?.schedule || [];
    const targetSchedule = target.availability?.schedule || [];

    const userDays = new Set(userSchedule.filter(d => d.available).map(d => d.day));
    const targetDays = new Set(targetSchedule.filter(d => d.available).map(d => d.day));

    if (userDays.size > 0 && targetDays.size > 0) {
        const matchingDays = [...userDays].filter(day => targetDays.has(day));
        if (matchingDays.length > 0) {
            finalScore += 100 * WEIGHTS.AVAILABILITY;
        }
    }

    return Math.min(Math.round(finalScore), 100);
};

/**
 * Ranks a list of users based on compatibility with current user.
 */
export const rankMatches = (currentUser, otherUsers) => {
    if (!currentUser) return [];

    const ranked = otherUsers
        .filter(u => u.id !== currentUser.id && u.role !== currentUser.role)
        .map(u => ({
            ...u,
            compatibility: calculateCompatibility(currentUser, u)
        }))
        .sort((a, b) => b.compatibility - a.compatibility);

    // Mentees see top 10 mentors (increased from 5)
    if (currentUser.role === 'mentee') {
        return ranked.slice(0, 10);
    }

    return ranked;
};
