import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

const Layout = ({ children }) => {
    const location = useLocation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Define paths that use the dashboard layout
    const dashboardPaths = [
        '/dashboard', '/discover', '/profile', '/messages',
        '/notifications', '/my-mentees', '/sessions', '/settings', '/availability'
    ];

    // Check if current path starts with any of the dashboard paths
    const isDashboard = dashboardPaths.some(path => location.pathname.startsWith(path));

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    if (isDashboard) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc', overflowX: 'hidden' }}>
                <Sidebar collapsed={sidebarCollapsed} />
                <div style={{
                    flex: 1,
                    marginLeft: sidebarCollapsed ? '80px' : '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    width: `calc(100% - ${sidebarCollapsed ? '80px' : '280px'})`
                }}>
                    <DashboardHeader onToggleSidebar={toggleSidebar} isSidebarCollapsed={sidebarCollapsed} />
                    <main style={{
                        flex: 1,
                        padding: '2.5rem 3rem',
                        maxWidth: '1600px',
                        width: '100%',
                        margin: '0 auto'
                    }}>
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    // Public / Landing Page Layout
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{
                flex: 1,
                padding: location.pathname === '/' ? '0' : '7rem 2rem 2rem 2rem',
                maxWidth: '1300px',
                width: '100%',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {children}
            </main>
        </div>
    );
};

export default Layout;
