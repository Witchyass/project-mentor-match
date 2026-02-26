import React, { useState, useEffect } from 'react';
import { ExternalLink, BookOpen, UserCheck, TrendingUp, Lightbulb } from 'lucide-react';

const Resources = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const resourceCategories = [
        {
            title: "Career Growth",
            icon: <TrendingUp size={24} color="#3b82f6" />,
            description: "Strategies to accelerate your professional journey.",
            resources: [
                { title: "12 Pieces of Advice", source: "DEV Community", link: "https://dev.to/sahsisunny/12-pieces-of-advice-for-your-career-growth-4j5g", summary: "Techniques to enhance career growth." },
                { title: "Practical Advice", source: "Medium", link: "https://tyahmadtaylor.medium.com/practical-advice-on-career-development-6a4a496c0d60", summary: "Cultivating a growth mindset." }
            ]
        },
        {
            title: "Performance",
            icon: <Lightbulb size={24} color="#f59e0b" />,
            description: "Mental models for better decision making.",
            resources: [
                { title: "Mental Models", source: "Farnam Street", link: "https://fs.blog/mental-models/", summary: "Understand how to think clearly." }
            ]
        }
    ];

    return (
        <div style={{ padding: isMobile ? '2rem 1rem' : '4rem 2rem', background: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: isMobile ? '2rem' : '4rem' }}>
                    <h1 style={{ fontSize: isMobile ? '1.8rem' : '2.8rem', fontWeight: 900, color: '#1e293b', letterSpacing: '-0.02em' }}>Resources</h1>
                    <p style={{ color: '#475569', fontSize: '1rem', marginTop: '0.5rem' }}>Curated guides to master your career and mentorship.</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                    {resourceCategories.map((cat, i) => (
                        <div key={i}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                {cat.icon}
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>{cat.title}</h2>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                                {cat.resources.map((res, j) => (
                                    <a key={j} href={res.link} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #f1f5f9', height: '100%', transition: '0.2s' }}>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1e3a8a', textTransform: 'uppercase' }}>{res.source}</span>
                                            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0.5rem 0', color: '#1e293b' }}>{res.title}</h3>
                                            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '1rem' }}>{res.summary}</p>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>Read More <ExternalLink size={14} /></div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Resources;
