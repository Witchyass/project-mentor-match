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
    "react": ["frontend", "javascript", "web", "ui"],
    "node": ["backend", "javascript", "server", "api"],
    "python": ["data science", "backend", "ai", "ml"],
    "design": ["ui", "ux", "product", "figma"],
    "management": ["leadership", "strategy", "product", "agile"],
    "aws": ["cloud", "devops", "infrastructure"],
    "javascript": ["frontend", "web", "logic"]
};

/**
 * Normalizes a list of skills into a semantic set.
 */
const getSemanticSkills = (skills = []) => {
    const semanticSet = new Set();
    skills.forEach(skill => {
        const s = skill.toLowerCase().trim();
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
 * @param {Object} user - The current logged-in user profile
 * @param {Object} target - The profile being evaluated
 */
export const calculateCompatibility = (user, target) => {
    if (!user || !target || user.role === target.role) return 0;

    let finalScore = 0;

    // 1. Semantic Skill Match (45%)
    const userSkills = getSemanticSkills(user.skills || []);
    const targetSkills = getSemanticSkills(target.skills || []);
    const skillSim = calculateSimilarity(userSkills, targetSkills);
    finalScore += skillSim * 100 * WEIGHTS.SKILLS;

    // 2. Career Alignment (35%)
    const userCareer = user.career?.toLowerCase() || "";
    const targetCareer = target.career?.toLowerCase() || "";

    // Check for keyword overlaps in career description
    const userCareerWords = new Set(userCareer.split(/\s+/).filter(w => w.length > 2));
    const targetCareerWords = new Set(targetCareer.split(/\s+/).filter(w => w.length > 2));
    const careerSim = calculateSimilarity(userCareerWords, targetCareerWords);

    // Explicit role goal check for mentees
    if (user.role === 'mentee') {
        if (targetCareer.includes(userCareer)) finalScore += 20 * WEIGHTS.CAREER;
    }

    finalScore += careerSim * 100 * WEIGHTS.CAREER;

    // 3. Experience Delta (15%)
    const userExp = EXPERIENCE_MAP[user.experienceLevel] || 1;
    const targetExp = EXPERIENCE_MAP[target.experienceLevel] || 1;

    if (user.role === 'mentee') {
        // Mentees want more experienced mentors
        if (targetExp > userExp) finalScore += 100 * WEIGHTS.EXPERIENCE;
        else if (targetExp === userExp) finalScore += 50 * WEIGHTS.EXPERIENCE;
    } else {
        // Mentors ideally match with less experienced mentees
        if (targetExp < userExp) finalScore += 100 * WEIGHTS.EXPERIENCE;
        else if (targetExp === userExp) finalScore += 50 * WEIGHTS.EXPERIENCE;
    }

    // 4. Availability Match (5%)
    if (user.availability === target.availability) {
        finalScore += 100 * WEIGHTS.AVAILABILITY;
    }

    return Math.min(Math.round(finalScore), 100);
};

/**
 * Ranks a list of users based on compatibility with current user.
 * @param {Object} currentUser - The current user's profile
 * @param {Array} otherUsers - List of all user profiles from DB
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

    // Mentees see top 5 mentors, Mentors see all (but ranked)
    if (currentUser.role === 'mentee') {
        return ranked.slice(0, 5);
    }

    return ranked;
};
