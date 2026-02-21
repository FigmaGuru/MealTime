const FIREBASE_AUTH_ERRORS: Record<string, string> = {
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/popup-closed-by-user": "Sign-in popup was closed.",
  "auth/network-request-failed": "Network error. Please check your connection.",
  "auth/operation-not-allowed": "This sign-in method is not enabled. Enable it in the Firebase console under Authentication → Sign-in method.",
  "auth/invalid-api-key": "Invalid Firebase API key. Check your NEXT_PUBLIC_FIREBASE_API_KEY environment variable.",
  "auth/unauthorized-domain": "This domain is not authorized for Firebase Authentication. Add it in the Firebase console under Authentication → Settings → Authorized domains.",
  "auth/popup-blocked": "Sign-in popup was blocked by the browser. Allow popups for this site.",
  "auth/cancelled-popup-request": "Another sign-in is already in progress.",
  "auth/internal-error": "A Firebase internal error occurred. Check your Firebase project configuration.",
  "auth/configuration-not-found": "Firebase project configuration not found. Verify your project ID.",
  "auth/user-disabled": "This account has been disabled.",
};

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === "Firebase not initialized") {
    return "Firebase is not configured. Set up your .env.local file with the required NEXT_PUBLIC_FIREBASE_* variables.";
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    const code = (error as { code: string }).code;
    return FIREBASE_AUTH_ERRORS[code] ?? `Sign-in failed (${code}). Check the browser console for details.`;
  }
  return "An unexpected error occurred. Please try again.";
}
