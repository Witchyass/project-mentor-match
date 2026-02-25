/**
 * AI Matching Engine - Vector Space Model
 * Calculates compatibility scores using feature vectorization and cosine similarity.
 */

const WEIGHTS = {
    SKILLS: 0.40,
    CAREER: 0.20,
    LANGUAGE: 0.10,
    EXPERIENCE: 0.15,
    BIO: 0.10,
    AVAILABILITY: 0.05
};

const EXPERIENCE_MAP = {
    "Beginner": 1,
    "Entry": 1,
    "Junior": 2,
    "Mid": 3,
    "Mid-level": 3,
    "Senior": 4,
    "Expert": 5,
    "Expert / Lead": 5
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
 * Calculates language overlap score.
 */
const calculateLanguageScore = (userLangs = [], targetLangs = []) => {
    const userSet = new Set(userLangs.map(l => l.toLowerCase().trim()));
    const targetSet = new Set(targetLangs.map(l => l.toLowerCase().trim()));
    const intersection = [...userSet].filter(l => targetSet.has(l));
    return intersection.length > 0 ? 1 : 0;
};

/**
 * Calculates bio keyword overlap (lightweight TF-IDF substitute).
 */
const calculateBioScore = (userBio = "", targetBio = "") => {
    if (!userBio || !targetBio) return 0;
    const userWords = new Set(userBio.toLowerCase().split(/\W+/).filter(w => w.length > 3));
    const targetWords = new Set(targetBio.toLowerCase().split(/\W+/).filter(w => w.length > 3));
    if (userWords.size === 0) return 0;
    const intersection = [...userWords].filter(w => targetWords.has(w));
    return intersection.length / userWords.size;
};

/**
 * Calculates a compatibility score from 0-100 between two profiles.
 */
export const calculateCompatibility = (user, target) => {
    if (!user || !target || user.role === target.role) return 0;

    let finalScore = 0;

    // 1. Semantic Skill Match (40%) - Updated Weight
    const userSkills = getSemanticSkills(user.skills || user.interests || []);
    const targetSkills = getSemanticSkills(target.skills || target.expertiseAreas || []);
    const skillSim = calculateSimilarity(userSkills, targetSkills);
    finalScore += skillSim * 100 * WEIGHTS.SKILLS;

    // 2. Career Alignment (20%) - Updated Weight
    const userCareer = user.career?.toLowerCase() || "";
    const targetCareer = target.career?.toLowerCase() || "";
    const userCareerWords = new Set(userCareer.split(/[,\s]+/).filter(w => w.length > 2));
    const targetCareerWords = new Set(targetCareer.split(/[,\s]+/).filter(w => w.length > 2));
    const careerSim = calculateSimilarity(userCareerWords, targetCareerWords);
    finalScore += careerSim * 100 * WEIGHTS.CAREER;

    // 3. Language Match (10%) - New Category
    const langScore = calculateLanguageScore(user.languages, target.languages);
    finalScore += langScore * 100 * WEIGHTS.LANGUAGE;

    // 4. Experience Delta (15%)
    const userExp = EXPERIENCE_MAP[user.experienceLevel] || 1;
    const targetExp = EXPERIENCE_MAP[target.experienceLevel] || 1;
    const expDiff = targetExp - userExp;

    let expScore = 0;
    if (expDiff > 1) expScore = 1;
    else if (expDiff === 1) expScore = 0.5;
    else expScore = 0;

    finalScore += expScore * 100 * WEIGHTS.EXPERIENCE;

    // 5. Bio Keyword Match (10%) - New Category
    const bioScore = calculateBioScore(user.bio, target.bio);
    finalScore += bioScore * 100 * WEIGHTS.BIO;

    // 6. Availability Match (5%)
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

    // BONUS: Mentorship Style Match
    const userStyle = (user.mentoringStyle || user.mentorshipStyle || "").toLowerCase();
    const targetStyle = (target.mentoringStyle || target.mentorshipStyle || "").toLowerCase();
    if (userStyle && targetStyle && userStyle === targetStyle) {
        finalScore += 15;
    }

    // BONUS: Country Preference
    const preferredCountries = user.preferredCountries || [];
    if (preferredCountries.length > 0 && target.country && preferredCountries.includes(target.country)) {
        finalScore += 10;
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
