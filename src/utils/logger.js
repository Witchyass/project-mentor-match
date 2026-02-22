/**
 * MentorMatch Logger Utility
 * Provides environment-aware logging to prevent sensitive data exposure in production.
 */

const isDev = import.meta.env.DEV;

const logger = {
    log: (...args) => {
        if (isDev) console.log(...args);
    },
    info: (...args) => {
        if (isDev) console.info(...args);
    },
    warn: (...args) => {
        if (isDev) console.warn(...args);
    },
    error: (...args) => {
        // Errors are usually safe to log in production for debugging, 
        // but can be silenced if needed.
        console.error(...args);
    },
    debug: (...args) => {
        if (isDev) console.debug(...args);
    },

    // Branded console message for production
    brand: () => {
        console.log(
            "%c%s",
            "color: #1e3a8a; font-size: 24px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);",
            "🚀 MentorMatch"
        );
        console.log(
            "%cSystem Status: %cOnline%c | Environment: %c%s",
            "color: #64748b; font-weight: bold;",
            "color: #10b981; font-weight: bold;",
            "color: #64748b;",
            `color: ${isDev ? '#f59e0b' : '#3b82f6'}; font-weight: bold;`,
            isDev ? "Development" : "Production"
        );
        console.log(
            "%cLooking for a career change? %cCheck out our open roles: %chttps://mentormatch.africa/careers",
            "color: #64748b;",
            "color: #1e3a8a; font-weight: bold;",
            "color: #2563eb; text-decoration: underline;"
        );
    }
};

export default logger;
