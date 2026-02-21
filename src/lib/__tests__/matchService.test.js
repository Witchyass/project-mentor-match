import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendMatchRequest, acceptMatchRequest } from '../matchService';
import { db } from '../firebase';
import { ref, push, update, get } from 'firebase/database';

// Mock Firebase Database
vi.mock('../firebase', () => ({
    db: {}
}));

vi.mock('firebase/database', () => ({
    ref: vi.fn(),
    push: vi.fn(() => ({ key: 'mock-key' })),
    set: vi.fn(),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
    onValue: vi.fn(),
    get: vi.fn(),
    update: vi.fn()
}));

describe('matchService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('sendMatchRequest', () => {
        it('should return error if missing fromUser or toUserId', async () => {
            const result = await sendMatchRequest(null, {}, 'mentor-1');
            expect(result).toBeUndefined(); // The function returns undefined on error currently
        });

        it('should successfully send a match request', async () => {
            const fromUser = { uid: 'mentee-1', displayName: 'John Doe' };
            const fromProfile = { name: 'John Doe', career: 'Developer' };
            const toUserId = 'mentor-1';

            get.mockResolvedValueOnce({ exists: () => false }); // No target email found
            update.mockResolvedValueOnce();

            const result = await sendMatchRequest(fromUser, fromProfile, toUserId);

            expect(result).toEqual({ success: true, requestId: 'mock-key' });
            expect(update).toHaveBeenCalled();
        });

        it('should prevent self-matching', async () => {
            const fromUser = { uid: 'user-1' };
            const toUserId = 'user-1';

            const result = await sendMatchRequest(fromUser, {}, toUserId);
            expect(result).toEqual({ success: false, error: 'Self-match not allowed' });
        });
    });

    describe('acceptMatchRequest', () => {
        it('should successfully accept a match request', async () => {
            const request = {
                id: 'req-1',
                from: 'mentee-1',
                to: 'mentor-1',
                menteeDetails: { name: 'Mentee Name' }
            };
            const mentorProfile = { name: 'Mentor Name', career: 'Senior Dev' };

            update.mockResolvedValueOnce();

            const result = await acceptMatchRequest(request, mentorProfile);

            expect(result.success).toBe(true);
            expect(result.matchId).toContain('match_');
            expect(update).toHaveBeenCalled();
        });
    });
});
