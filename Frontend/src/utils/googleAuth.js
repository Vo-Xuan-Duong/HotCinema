/**
 * Google OAuth Utility
 * Handles Google authentication using Google Identity Services (GIS)
 * Flow: Frontend popup → Google returns authorization code → Send to backend → Backend exchanges for ID token and validates → Returns JWT
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

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

    googleScriptLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
            if (window.google && window.google.accounts) {
                resolve();
            } else {
                reject(new Error('Failed to load Google Identity Services'));
            }
        };
        script.onerror = () => {
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
export const signInWithGoogle = async () => {
    try {
        await loadGoogleScript();

        if (!GOOGLE_CLIENT_ID) {
            throw new Error('Google Client ID not configured. Please set VITE_GOOGLE_CLIENT_ID in .env file');
        }

        return new Promise((resolve, reject) => {
            const client = window.google.accounts.oauth2.initCodeClient({
                client_id: GOOGLE_CLIENT_ID,
                scope: 'openid email profile',
                ux_mode: 'popup',
                callback: (response) => {
                    if (response.error) {
                        reject(new Error(response.error || 'Google authentication failed'));
                        return;
                    }

                    if (response.code) {
                        resolve({
                            code: response.code
                        });
                    } else {
                        reject(new Error('No authorization code received from Google'));
                    }
                },
            });

            client.requestCode();
        });
    } catch (error) {
        throw error;
    }
};

/**
 * Alternative: Get ID Token directly using One Tap or Popup
 * Returns ID Token that can be sent directly to backend
 */
export const signInWithGoogleIdToken = async () => {
    try {
        await loadGoogleScript();

        if (!GOOGLE_CLIENT_ID) {
            throw new Error('Google Client ID not configured');
        }

        return new Promise((resolve, reject) => {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: (credentialResponse) => {
                    if (credentialResponse.credential) {
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

            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                    signInWithGoogle()
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    } catch (error) {
        throw error;
    }
};

export default {
    loadGoogleScript,
    signInWithGoogle,
    signInWithGoogleIdToken
};

