/**
 * Google OAuth Utility
 * Handles Google authentication using Google Identity Services (GIS)
 * Flow: Frontend popup → Google returns authorization code → Send to backend → Backend exchanges for ID token and validates → Returns JWT
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

let googleScriptLoading = false;
let googleScriptLoadPromise = null;

/**
 * Load Google Identity Services script
 */
export const loadGoogleScript = () => {
    // Return existing promise if already loading
    if (googleScriptLoadPromise) {
        return googleScriptLoadPromise;
    }

    // Check if already loaded
    if (window.google && window.google.accounts) {
        return Promise.resolve();
    }

    googleScriptLoading = true;
    googleScriptLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            googleScriptLoading = false;
            if (window.google && window.google.accounts) {
                resolve();
            } else {
                reject(new Error('Failed to load Google Identity Services'));
            }
        };
        script.onerror = () => {
            googleScriptLoading = false;
            googleScriptLoadPromise = null;
            reject(new Error('Failed to load Google script'));
        };
        document.head.appendChild(script);
    });

    return googleScriptLoadPromise;
};

/**
 * Sign in with Google using authorization code flow
 * Opens popup, gets authorization code, returns code to be sent to backend
 * Backend will exchange code for ID token, validate, and return JWT
 */
export const signInWithGoogle = () => {
    return new Promise(async (resolve, reject) => {
        try {
            // Load Google script if not loaded
            await loadGoogleScript();

            if (!GOOGLE_CLIENT_ID) {
                reject(new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in .env file'));
                return;
            }

            // Use authorization code flow (more secure)
            // For popup flow in React, redirect_uri is automatically set to 'postmessage'
            // This allows Google to return the code via postMessage API
            const client = window.google.accounts.oauth2.initCodeClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: 'openid email profile',
                ux_mode: 'popup', // Opens popup window
                // redirect_uri is automatically 'postmessage' for popup mode
                // No need to specify it explicitly
                callback: (response) => {
                    if (response.error) {
                        reject(new Error(response.error || 'Google authentication failed'));
                        return;
                    }

                    if (response.code) {
                        // Return authorization code - backend will exchange for ID token
                        // Note: When backend exchanges code, it needs to use the same redirect_uri
                        // For popup flow: redirect_uri = 'postmessage' or origin (e.g., 'http://localhost:5173')
                        resolve({
                            code: response.code
                        });
                    } else {
                        reject(new Error('No authorization code received from Google'));
                    }
                },
            });

            // Request authorization code (opens popup)
            client.requestCode();
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Alternative: Get ID Token directly using One Tap or Popup
 * Returns ID Token that can be sent directly to backend
 */
export const signInWithGoogleIdToken = () => {
    return new Promise(async (resolve, reject) => {
        try {
            await loadGoogleScript();

            if (!GOOGLE_CLIENT_ID) {
                reject(new Error('Google Client ID not configured'));
                return;
            }

            // Initialize Google Sign-In
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: (credentialResponse) => {
                    if (credentialResponse.credential) {
                        // credential is the ID Token
                        resolve({
                            idToken: credentialResponse.credential
                        });
                    } else if (credentialResponse.error) {
                        reject(new Error(credentialResponse.error));
                    } else {
                        reject(new Error('No ID token received'));
                    }
                },
            });

            // Try One Tap first (non-blocking)
            window.google.accounts.id.prompt((notification) => {
                // If One Tap not available or skipped, use popup
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    // Use authorization code flow as fallback
                    signInWithGoogle()
                        .then(resolve)
                        .catch(reject);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
};

export default {
    loadGoogleScript,
    signInWithGoogle,
    signInWithGoogleIdToken
};

