"use client";

import AuthPaper from "@/components/auth/auth-paper";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { sendGAEvent } from "@next/third-parties/google";
import { useTranslation } from "react-i18next";
export default function SignUpForm() {
  const { signUp, loading, email, password, confirmPassword, setEmail, setPassword, setConfirmPassword } = useAuth();
  const { t } = useTranslation('common');

  const handleSignUp = async () => {
    sendGAEvent("sign_up");
    await signUp();
  };

  return (
    <AuthPaper
      title={t('auth.welcomeToSylva')}
      subtitle={t('auth.createBoardSubtitle')}
      cta={{
        text: t('auth.signUp'),
        onClick: handleSignUp,
        disabled: !email || !password || !confirmPassword,
        loading,
      }}
    >
      <div className="flex flex-col gap-5">
        <Input placeholder={t('auth.enterEmail')} label={t('auth.email')} onChange={setEmail} onEnter={signUp} />
        <Input placeholder={t('auth.enterPassword')} label={t('auth.password')} type="password" onChange={setPassword} onEnter={signUp} />
        <Input
          placeholder={t('auth.confirmPassword')}
          label={t('auth.confirmPasswordLabel')}
          type="password"
          onChange={setConfirmPassword}
          onEnter={signUp}
        />
      </div>
    </AuthPaper>
  );
}
