import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../Navbar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import * as matchService from '../../lib/matchService';

// Mock contexts
vi.mock('../../context/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../../context/ThemeContext', () => ({
    useTheme: vi.fn(),
}));

// Mock matchService
vi.mock('../../lib/matchService', () => ({
    subscribeToNotifications: vi.fn(() => vi.fn()), // Returns a cleanup function
}));

// Mock Lucide icons to avoid rendering issues in tests
vi.mock('lucide-react', () => ({
    Sun: () => <div data-testid="sun-icon" />,
    Moon: () => <div data-testid="moon-icon" />,
    User: () => <div data-testid="user-icon" />,
    MessageCircle: () => <div data-testid="message-icon" />,
    Home: () => <div data-testid="home-icon" />,
    LogOut: () => <div data-testid="logout-icon" />,
    BarChart3: () => <div data-testid="barchart-icon" />,
    Search: () => <div data-testid="search-icon" />,
    Bell: () => <div data-testid="bell-icon" />,
}));

describe('Navbar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useTheme.mockReturnValue({ theme: 'light', toggleTheme: vi.fn() });
    });

    it('renders login and get started buttons when user is not logged in', () => {
        useAuth.mockReturnValue({ user: null, profile: null });

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        expect(screen.getByText(/Login/i)).toBeInTheDocument();
        expect(screen.getByText(/Get Started/i)).toBeInTheDocument();
    });

    it('renders dashboard button when user is logged in', () => {
        useAuth.mockReturnValue({
            user: { uid: '123' },
            profile: { name: 'Test User' }
        });

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        );

        expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
        expect(screen.queryByText(/Login/i)).not.toBeInTheDocument();
    });
});
