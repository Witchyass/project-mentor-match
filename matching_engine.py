"""
AI Matching Engine - Vector Space Model (Python)
Calculates compatibility scores using feature vectorization and cosine similarity.
"""

import math
from typing import List, Dict, Set, Optional

WEIGHTS = {
    "SKILLS": 0.45,
    "CAREER": 0.35,
    "EXPERIENCE": 0.15,
    "AVAILABILITY": 0.05
}

EXPERIENCE_MAP = {
    "Entry": 1,
    "Mid-level": 2,
    "Senior": 3,
    "Expert / Lead": 4
}

# Semantic mapping for common skills to handle partial/related matches
SKILL_MAP = {
    "react": ["frontend", "javascript", "web", "ui"],
    "node": ["backend", "javascript", "server", "api"],
    "python": ["data science", "backend", "ai", "ml"],
    "design": ["ui", "ux", "product", "figma"],
    "management": ["leadership", "strategy", "product", "agile"],
    "aws": ["cloud", "devops", "infrastructure"],
    "javascript": ["frontend", "web", "logic"]
}


def get_semantic_skills(skills: Optional[List[str]] = None) -> Set[str]:
    """
    Normalizes a list of skills into a semantic set.
    
    Args:
        skills: List of skill strings
        
    Returns:
        Set of normalized skills including semantic relationships
    """
    if skills is None:
        skills = []
    
    semantic_set = set()
    for skill in skills:
        s = skill.lower().strip()
        semantic_set.add(s)
        if s in SKILL_MAP:
            for related in SKILL_MAP[s]:
                semantic_set.add(related)
    
    return semantic_set


def calculate_similarity(set_a: Set[str], set_b: Set[str]) -> float:
    """
    Calculates Cosine Similarity between two sets (simplified for feature overlap).
    
    Args:
        set_a: First set of features
        set_b: Second set of features
        
    Returns:
        Similarity score between 0 and 1
    """
    if len(set_a) == 0 or len(set_b) == 0:
        return 0.0
    
    intersection = set_a & set_b
    denominator = math.sqrt(len(set_a) * len(set_b))
    
    return len(intersection) / denominator


def calculate_compatibility(user: Dict, target: Dict) -> int:
    """
    Calculates a compatibility score from 0-100 between two profiles.
    
    Args:
        user: The current logged-in user profile
        target: The profile being evaluated
        
    Returns:
        Compatibility score (0-100)
    """
    if not user or not target or user.get("role") == target.get("role"):
        return 0
    
    final_score = 0.0
    
    # 1. Semantic Skill Match (45%)
    user_skills = get_semantic_skills(user.get("skills", []))
    target_skills = get_semantic_skills(target.get("skills", []))
    skill_sim = calculate_similarity(user_skills, target_skills)
    final_score += skill_sim * 100 * WEIGHTS["SKILLS"]
    
    # 2. Career Alignment (35%)
    user_career = (user.get("career") or "").lower()
    target_career = (target.get("career") or "").lower()
    
    # Check for keyword overlaps in career description
    user_career_words = set(word for word in user_career.split() if len(word) > 2)
    target_career_words = set(word for word in target_career.split() if len(word) > 2)
    career_sim = calculate_similarity(user_career_words, target_career_words)
    
    # Explicit role goal check for mentees
    if user.get("role") == "mentee":
        if user_career in target_career:
            final_score += 20 * WEIGHTS["CAREER"]
    
    final_score += career_sim * 100 * WEIGHTS["CAREER"]
    
    # 3. Experience Delta (15%)
    user_exp = EXPERIENCE_MAP.get(user.get("experienceLevel"), 1)
    target_exp = EXPERIENCE_MAP.get(target.get("experienceLevel"), 1)
    
    if user.get("role") == "mentee":
        # Mentees want more experienced mentors
        if target_exp > user_exp:
            final_score += 100 * WEIGHTS["EXPERIENCE"]
        elif target_exp == user_exp:
            final_score += 50 * WEIGHTS["EXPERIENCE"]
    else:
        # Mentors ideally match with less experienced mentees
        if target_exp < user_exp:
            final_score += 100 * WEIGHTS["EXPERIENCE"]
        elif target_exp == user_exp:
            final_score += 50 * WEIGHTS["EXPERIENCE"]
    
    # 4. Availability Match (5%)
    if user.get("availability") == target.get("availability"):
        final_score += 100 * WEIGHTS["AVAILABILITY"]
    
    return min(round(final_score), 100)


def rank_matches(current_user: Dict, other_users: List[Dict]) -> List[Dict]:
    """
    Ranks a list of users based on compatibility with current user.
    
    Args:
        current_user: The current user's profile
        other_users: List of all user profiles from database
        
    Returns:
        List of profiles ranked by compatibility score
    """
    if not current_user:
        return []
    
    current_user_id = current_user.get("id")
    current_user_role = current_user.get("role")
    
    # Filter and score other users
    ranked = []
    for user in other_users:
        if user.get("id") != current_user_id and user.get("role") != current_user_role:
            scored_user = user.copy()
            scored_user["compatibility"] = calculate_compatibility(current_user, user)
            ranked.append(scored_user)
    
    # Sort by compatibility (descending)
    ranked.sort(key=lambda x: x["compatibility"], reverse=True)
    
    # Mentees see top 5 mentors, Mentors see all (but ranked)
    if current_user_role == "mentee":
        return ranked[:5]
    
    return ranked


# Example usage / Testing
if __name__ == "__main__":
    # Test data
    mentor = {
        "id": "1",
        "role": "mentor",
        "skills": ["React", "Python", "AWS"],
        "career": "Full-stack software engineer",
        "experienceLevel": "Senior",
        "availability": "Weekends"
    }
    
    mentee = {
        "id": "2",
        "role": "mentee",
        "skills": ["JavaScript", "Python"],
        "career": "Backend developer",
        "experienceLevel": "Entry",
        "availability": "Weekends"
    }
    
    compatibility = calculate_compatibility(mentee, mentor)
    print(f"Compatibility Score: {compatibility}/100")
    
    # Test ranking
    all_users = [mentor, mentee]
    ranked = rank_matches(mentee, all_users)
    print(f"\nRanked Matches for mentee:")
    for match in ranked:
        print(f"  - {match.get('name', 'User')}: {match['compatibility']}/100")
