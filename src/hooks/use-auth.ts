"use client";

import { useDashboardStore, useUserStore, useSettingsStore } from "@/core/states";
import { handleSignIn, handleSignOut, handleSignUp } from "@/features/auth-features";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useAuth() {
  const { user, _setUser, _resetUser } = useUserStore();
  const { settings, _setSettings } = useSettingsStore();
  const { _setNotes, _setEdges } = useDashboardStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const signIn = async () => {
    setLoading(true);
    try {
      const {
        data,
        error,
      } = await handleSignIn(email, password);
      const userData = data?.user;
      const settingsData = data?.settings;
      if (!userData || !settingsData) {
        throw new Error("User or settings data not found");
      }
      if (error) throw error;
      _setUser(userData!);
      _setSettings(settingsData!);
      router.push("/dashboard");
      toast("Signed in!");
    } catch (error) {
      setError(error as string);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (noToast?: boolean) => {
    setLoading(true);
    try {
      await handleSignOut();
      _resetUser();
      router.push("/sign-in");
      if (!noToast) toast("Signed out!");
    } catch (error) {
      setError(error as string);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async () => {
    setLoading(true);
    try {
      if (password !== confirmPassword) throw new Error("Passwords do not match");
      const { data, error } = await handleSignUp(email, password);
      if (error) throw error;
      _setUser(data!.user);
      _setNotes(data!.notes);
      _setEdges(data!.edges);
      router.push("/dashboard");
      toast("Signed up!");
    } catch (error) {
      setError(error as string);
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const isLoggedIn = user && Object.keys(user).length > 0;

  return {
    user,
    isLoggedIn,
    settings,
    loading,
    error,
    signIn,
    signOut,
    signUp,
    setEmail,
    setPassword,
    email,
    password,
    setConfirmPassword,
    confirmPassword,
  };
}
