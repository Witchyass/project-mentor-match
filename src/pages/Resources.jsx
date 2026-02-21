import React from 'react';
import { ExternalLink, BookOpen, UserCheck, TrendingUp, Lightbulb } from 'lucide-react';

const Resources = () => {
    const resourceCategories = [
        {
            title: "Career Growth",
            icon: <TrendingUp className="text-blue-500" size={24} />,
            description: "Strategies and advice to accelerate your professional journey.",
            resources: [
                {
                    title: "12 Pieces of Advice for Your Career Growth",
                    source: "DEV Community",
                    link: "https://dev.to/sahsisunny/12-pieces-of-advice-for-your-career-growth-4j5g",
                    summary: "Techniques to enhance career growth, including starting small and joining communities."
                },
                {
                    title: "Practical advice on career development",
                    source: "Medium",
                    link: "https://tyahmadtaylor.medium.com/practical-advice-on-career-development-6a4a496c0d60",
                    summary: "Stresses cultivating a growth mindset, curiosity, and systems thinking."
                },
                {
                    title: "Advice for Early-career Developers",
                    source: "8th Light",
                    link: "https://8thlight.com/insights/advice-for-early-career-developers",
                    summary: "Focus on continuous learning, input (reading), and output (communication)."
                }
            ]
        },
        {
            title: "Self Improvement",
            icon: <Lightbulb className="text-yellow-500" size={24} />,
            description: "Personal development tips to become the best version of yourself.",
            resources: [
                {
                    title: "The Most Important Advice I've Given as a Mentor",
                    source: "Medium",
                    link: "https://medium.com/personal-growth/the-most-important-advice-ive-given-as-a-mentor-66440ca7f91b",
                    summary: "Universal keys to success, including finance and physical activity for energy."
                },
                {
                    title: "Mental Models: The Best Way to Make Intelligent Decisions",
                    source: "Farnam Street",
                    link: "https://fs.blog/mental-models/",
                    summary: "Understand how to think clearly and make better choices in life and work."
                }
            ]
        },
        {
            title: "Being a Great Mentor",
            icon: <UserCheck className="text-purple-500" size={24} />,
            description: "How to effectively guide, inspire, and support your mentees.",
            resources: [
                {
                    title: "How to be a good mentor",
                    source: "Vadim Kravcenko",
                    link: "https://vadimkravcenko.com/being-a-good-mentor-a-developers-guide/",
                    summary: "Attributes of a good mentor: listening, asking questions, and normalizing failure."
                },
                {
                    title: "21 Lessons from Years of Mentoring Developers",
                    source: "Sumit Gupta",
                    link: "https://sumitgupta.dev/21-lessons-and-best-practices-from-years-of-mentoring",
                    summary: "Focused on relationship first, sharing personal mistakes, and helping mentees find their 'why'."
                }
            ]
        },
        {
            title: "Being a Successful Mentee",
            icon: <BookOpen className="text-green-500" size={24} />,
            description: "Maximize the benefits of your mentorship and take charge of your growth.",
            resources: [
                {
                    title: "5 Tips on Being a Great Mentee",
                    source: "Medium",
                    link: "https://medium.com/the-ascent/5-tips-on-being-a-great-mentee-b0e6e7655075",
                    summary: "Actionable advice: be teachable, proactive, realistic, and grateful."
                },
                {
                    title: "Why Proactive Mentees Make the Best Mentees",
                    source: "Medium",
                    link: "https://betterhumans.pub/why-proactive-mentees-make-the-best-mentees-bbdec0380f2d",
                    summary: "Take charge of scheduling, setting agendas, and following up."
                },
                {
                    title: "How to be a good mentee",
                    source: "DEV Community",
                    link: "https://dev.to/ananyaneogi/how-to-be-a-good-mentee-3l92",
                    summary: "Guide on taking charge of sessions, being clear about goals, and seeking feedback."
                }
            ]
        }
    ];

    return (
        <div style={{ padding: '6rem 2rem 4rem', minHeight: '100vh', background: 'var(--background)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="animate-fade-in">
                    <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', background: 'var(--gradient-premium)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Helpful Resources
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '700px', margin: '0 auto' }}>
                        Curated articles and guides to help you navigate your career, improve your skills, and master the art of mentorship.
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '4rem' }}>
                    {resourceCategories.map((category, idx) => (
                        <section key={idx} className="animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'var(--glass)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid var(--border)'
                                }}>
                                    {category.icon}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{category.title}</h2>
                                    <p style={{ color: 'var(--text-muted)' }}>{category.description}</p>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {category.resources.map((resource, rIdx) => (
                                    <a
                                        key={rIdx}
                                        href={resource.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <div className="glass-card" style={{
                                            padding: '2rem',
                                            borderRadius: 'var(--radius-lg)',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'var(--transition)',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            border: '1px solid var(--border)',
                                            overflow: 'hidden'
                                        }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'translateY(-5px)';
                                                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                                                e.currentTarget.style.borderColor = 'var(--primary)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'translateY(0)';
                                                e.currentTarget.style.boxShadow = 'var(--shadow)';
                                                e.currentTarget.style.borderColor = 'var(--border)';
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    color: 'var(--primary)',
                                                    letterSpacing: '1px'
                                                }}>
                                                    {resource.source}
                                                </span>
                                                <ExternalLink size={16} style={{ opacity: 0.5 }} />
                                            </div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', lineHeight: 1.4 }}>
                                                {resource.title}
                                            </h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', flex: 1, marginBottom: '1.5rem' }}>
                                                {resource.summary}
                                            </p>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                color: 'var(--primary)'
                                            }}>
                                                Read Article <ExternalLink size={14} />
                                            </div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Resources;
