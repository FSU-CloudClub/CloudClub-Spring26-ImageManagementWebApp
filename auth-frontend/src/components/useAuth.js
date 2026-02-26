// Cognito Authentication Hook
import { useState, useEffect, useCallback } from "react";
import { signIn, fetchAuthSession, signOut, getCurrentUser } from "aws-amplify/auth";

/* 
useState: to manage user, loading, and error states.
useEffect: to restore the user session on page load.
useCallback: to prevent functions from being recreated on every render.

Cognito API calls:
signIn: takes email and password, attempts to sign in, and updates state accordingly.
signOut: signs the user out and clears the user state.
getCurrentUser: to check if a user session already exists.
*/

// parseAuthError: translates Cognito error codes into message for users.
function parseAuthError(err) {
  const code = err?.name || err?.code || "";    // Extract error code from Cognito error object
  const messages = {
    NotAuthorizedException:       "Incorrect credentials.",
    UserNotFoundException:        "No account found with that email.",
    TooManyRequestsException:     "Too many attempts. Please wait and try again.",
    PasswordResetRequiredException: "A password reset is required.",
  };
  return messages[code] || "Something went wrong. Please try again.";  // Default message for unhandled errors
}

// useAuth: custom hook to manage authentication state and actions.
export function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Restore session on page load
  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const handleSignIn = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      await signIn({ username: email.trim().toLowerCase(), password });
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return { success: true };
    } catch (err) {
      const message = parseAuthError(err);
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
}