"use client";

import AuthPaper from "@/components/auth/auth-paper";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";

export default function SignInForm() {
  const { loading, signIn, setEmail, setPassword, email, password } = useAuth();
  const { t } = useTranslation('common');

  return (
    <AuthPaper
      title={t('auth.welcomeBack')}
      cta={{
        text: t('auth.signIn'),
        onClick: signIn,
        disabled: !email || !password,
        loading,
      }}
    >
      <div className="flex flex-col gap-5">
        <Input placeholder={t('auth.enterEmail')} label={t('auth.email')} onChange={setEmail} value={email} onEnter={signIn} />
        <Input
          placeholder={t('auth.enterPassword')}
          label={t('auth.password')}
          type="password"
          onChange={setPassword}
          value={password}
          onEnter={signIn}
        />
      </div>
    </AuthPaper>
  );
}
