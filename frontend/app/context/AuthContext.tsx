import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Models } from "appwrite";
import {
  account,
  getProfileByUserId,
  createProfile,
  updateProfile,
  uploadResumeFile,
  ID,
  type UserProfile,
} from "../services/appwrite";

export interface OnboardingData {
  targetRole: string;
  targetCareer: string;
  experienceLevel: string;
  strongSkills: string[];
  primaryGoals: string;
  resumeFile?: File;
}

export interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "signup";
  openAuthModal: (mode?: "login" | "signup") => void;
  closeAuthModal: () => void;
  isOnboardingModalOpen: boolean;
  openOnboardingModal: () => void;
  closeOnboardingModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  completeOnboarding: (data: OnboardingData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal triggers
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState<boolean>(false);

  // Load current session and profile on mount
  const checkSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await account.get();
      setUser(currentUser);

      const userProfile = await getProfileByUserId(currentUser.$id);
      if (userProfile) {
        setProfile(userProfile);
      } else {
        // Create initial default profile if not exists
        const newProfile = await createProfile({
          userId: currentUser.$id,
          name: currentUser.name || "CareerForge Learner",
          email: currentUser.email || "",
          onboardingCompleted: false,
        });
        setProfile(newProfile);
      }
    } catch {
      // Unauthenticated session
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const openAuthModal = (mode: "login" | "signup" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openOnboardingModal = () => {
    setIsOnboardingModalOpen(true);
  };

  const closeOnboardingModal = () => {
    setIsOnboardingModalOpen(false);
  };

  const login = async (email: string, password: string) => {
    // End any lingering session before creating a new one
    try {
      await account.deleteSession("current");
    } catch {
      // No active session
    }

    await account.createEmailPasswordSession(email, password);
    const currentUser = await account.get();
    setUser(currentUser);

    let userProfile = await getProfileByUserId(currentUser.$id);
    if (!userProfile) {
      userProfile = await createProfile({
        userId: currentUser.$id,
        name: currentUser.name || "Learner",
        email: currentUser.email || "",
        onboardingCompleted: false,
      });
    }
    setProfile(userProfile);
    setIsAuthModalOpen(false);

    // If user has not completed onboarding, trigger onboarding skeleton
    if (!userProfile.onboardingCompleted) {
      setIsOnboardingModalOpen(true);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      await account.deleteSession("current");
    } catch {
      // No active session
    }

    await account.create(ID.unique(), email, password, name);
    await account.createEmailPasswordSession(email, password);
    const currentUser = await account.get();
    setUser(currentUser);

    const newProfile = await createProfile({
      userId: currentUser.$id,
      name,
      email,
      onboardingCompleted: false,
    });
    setProfile(newProfile);
    setIsAuthModalOpen(false);

    // Prompt new user directly to onboarding flow
    setIsOnboardingModalOpen(true);
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
    } catch (err) {
      console.warn("Error deleting session:", err);
    }
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!user) return;
    const userProfile = await getProfileByUserId(user.$id);
    if (userProfile) {
      setProfile(userProfile);
    }
  };

  const completeOnboarding = async (data: OnboardingData) => {
    if (!user || !profile) {
      throw new Error("Cannot complete onboarding without an authenticated user profile.");
    }

    let uploadedFileId = profile.resumeFileId || "";
    if (data.resumeFile) {
      try {
        const fileObj = await uploadResumeFile(user.$id, data.resumeFile);
        uploadedFileId = fileObj.$id;
      } catch (uploadErr) {
        console.warn("Resume upload failed, continuing onboarding:", uploadErr);
      }
    }

    const updated = await updateProfile(profile.$id, user.$id, {
      onboardingCompleted: true,
      targetRole: data.targetRole,
      targetCareer: data.targetCareer,
      experienceLevel: data.experienceLevel,
      strongSkills: data.strongSkills,
      primaryGoals: data.primaryGoals,
      resumeFileId: uploadedFileId,
      assessmentStatus: "pending",
    });

    setProfile(updated);
    setIsOnboardingModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        isOnboardingModalOpen,
        openOnboardingModal,
        closeOnboardingModal,
        login,
        signUp,
        logout,
        refreshProfile,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
