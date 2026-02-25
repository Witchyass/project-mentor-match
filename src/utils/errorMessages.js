/**
 * Maps Firebase Auth error codes to user-friendly error messages.
 * @param {string} code - The Firebase Auth error code.
 * @returns {string} - A friendly error message.
 */
export const getFriendlyErrorMessage = (code) => {
    switch (code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Invalid email or password. Please try again.';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists. Try logging in instead.';
        case 'auth/weak-password':
            return 'Password is too weak. Please use at least 16 characters with uppercase, numbers, and special characters.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your internet connection and try again.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        case 'auth/user-disabled':
            return 'This account has been disabled. Please contact support.';
        case 'auth/operation-not-allowed':
            return 'Sign-in method not enabled. Please contact support.';
        case 'auth/popup-closed-by-user':
            return 'Login popup closed. Please try again.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
};
