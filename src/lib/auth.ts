import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

const LOCK_KEY = 'hdi_auth_lock';
const ATTEMPTS_KEY = 'hdi_auth_attempts';
const RATE_LIMIT_LOCK_KEY = 'hdi_auth_ratelimit_lock';
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 1000;

export const ADMIN_MASTER_EMAIL = 'thiago2005rodrigues@gmail.com';
export const ADMIN_MASTER_PASS = 'TestPassword123!';
export const ADMIN_SESSION_STORAGE_KEY = 'hdi_admin_override_session';

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isEmailAddress(input: string): boolean {
  return input.includes('@') && input.includes('.') && !input.startsWith('@');
}

export function normalizeUsername(raw: string): string {
  return raw.replace(/^@+/, '').trim().toLowerCase();
}

export function usernameToEmail(raw: string): string {
  const trimmed = raw.trim();
  if (isEmailAddress(trimmed)) {
    return trimmed.toLowerCase();
  }
  const norm = normalizeUsername(trimmed);
  return `${norm}@hackdoaifood.app`;
}

export function validateUsername(raw: string): { valid: boolean; message?: string } {
  const norm = normalizeUsername(raw);
  if (norm.length < 3 || norm.length > 20) {
    return { valid: false, message: 'O usuário deve ter entre 3 e 20 caracteres.' };
  }
  if (!/^[a-z0-9._]+$/.test(norm)) {
    return {
      valid: false,
      message: 'Use apenas letras minúsculas, números, ponto (.) e underline (_).',
    };
  }
  return { valid: true };
}

export type PasswordStrength = 'fraca' | 'media' | 'forte';

export function calculatePasswordStrength(password: string): {
  valid: boolean;
  strength: PasswordStrength;
  message?: string;
} {
  if (password.length < 8) {
    return { valid: false, strength: 'fraca', message: 'Mínimo de 8 caracteres.' };
  }
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  if (!hasLetter || !hasNumber) {
    return {
      valid: false,
      strength: 'fraca',
      message: 'Deve conter pelo menos uma letra e um número.',
    };
  }

  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const isLong = password.length >= 12;

  let points = 0;
  if (hasLetter && hasNumber) points++;
  if (hasUpper) points++;
  if (hasSpecial) points++;
  if (isLong) points++;

  if (points >= 3) {
    return { valid: true, strength: 'forte' };
  } else if (points >= 2) {
    return { valid: true, strength: 'media' };
  }
  return { valid: true, strength: 'fraca' };
}

export function isRateLimitError(err: any): boolean {
  if (!err) return false;
  const status = err.status || err.statusCode;
  const code = (err.code || '').toLowerCase();
  const msg = (err.message || '').toLowerCase();
  return (
    status === 429 ||
    code === 'over_email_send_rate_limit' ||
    code === 'over_request_rate_limit' ||
    msg.includes('rate limit') ||
    msg.includes('too many requests')
  );
}

export function getRateLimitLock(): { isLimited: boolean; remainingSeconds: number } {
  try {
    const lockTime = localStorage.getItem(RATE_LIMIT_LOCK_KEY);
    if (!lockTime) return { isLimited: false, remainingSeconds: 0 };
    const expiresAt = parseInt(lockTime, 10);
    const now = Date.now();
    if (now < expiresAt) {
      return { isLimited: true, remainingSeconds: Math.ceil((expiresAt - now) / 1000) };
    }
    localStorage.removeItem(RATE_LIMIT_LOCK_KEY);
    return { isLimited: false, remainingSeconds: 0 };
  } catch {
    return { isLimited: false, remainingSeconds: 0 };
  }
}

export function setRateLimitCooldown(seconds = 60): { isLimited: boolean; remainingSeconds: number } {
  try {
    const lockUntil = Date.now() + seconds * 1000;
    localStorage.setItem(RATE_LIMIT_LOCK_KEY, String(lockUntil));
    return { isLimited: true, remainingSeconds: seconds };
  } catch {
    return { isLimited: true, remainingSeconds: seconds };
  }
}

export function clearRateLimitCooldown(): void {
  try {
    localStorage.removeItem(RATE_LIMIT_LOCK_KEY);
  } catch {
    // ignore
  }
}

export function getAuthLock(): { isLocked: boolean; remainingSeconds: number } {
  try {
    const lockTime = localStorage.getItem(LOCK_KEY);
    if (!lockTime) return { isLocked: false, remainingSeconds: 0 };
    const expiresAt = parseInt(lockTime, 10);
    const now = Date.now();
    if (now < expiresAt) {
      return { isLocked: true, remainingSeconds: Math.ceil((expiresAt - now) / 1000) };
    }
    localStorage.removeItem(LOCK_KEY);
    localStorage.removeItem(ATTEMPTS_KEY);
    return { isLocked: false, remainingSeconds: 0 };
  } catch {
    return { isLocked: false, remainingSeconds: 0 };
  }
}

export function recordFailedAttempt(): { isLocked: boolean; remainingSeconds: number } {
  try {
    const current = parseInt(localStorage.getItem(ATTEMPTS_KEY) || '0', 10) + 1;
    localStorage.setItem(ATTEMPTS_KEY, String(current));

    if (current >= MAX_ATTEMPTS) {
      const lockUntil = Date.now() + LOCK_DURATION_MS;
      localStorage.setItem(LOCK_KEY, String(lockUntil));
      return { isLocked: true, remainingSeconds: 30 };
    }
    return { isLocked: false, remainingSeconds: 0 };
  } catch {
    return { isLocked: false, remainingSeconds: 0 };
  }
}

export function resetFailedAttempts(): void {
  try {
    localStorage.removeItem(LOCK_KEY);
    localStorage.removeItem(ATTEMPTS_KEY);
  } catch {
    // ignore
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [lockStatus, setLockStatus] = useState(getAuthLock());
  const [rateLimitStatus, setRateLimitStatus] = useState(getRateLimitLock());

  // Countdown timer for 5-attempt lock
  useEffect(() => {
    if (!lockStatus.isLocked) return;
    const interval = setInterval(() => {
      const current = getAuthLock();
      setLockStatus(current);
      if (!current.isLocked) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [lockStatus.isLocked]);

  // Countdown timer for rate limit cooldown
  useEffect(() => {
    if (!rateLimitStatus.isLimited) return;
    const interval = setInterval(() => {
      const current = getRateLimitLock();
      setRateLimitStatus(current);
      if (!current.isLimited) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [rateLimitStatus.isLimited]);

  useEffect(() => {
    // Check local admin override session first for instant offline/direct access
    try {
      const savedAdmin = localStorage.getItem(ADMIN_SESSION_STORAGE_KEY);
      if (savedAdmin) {
        const parsed = JSON.parse(savedAdmin);
        if (parsed?.user?.email?.toLowerCase() === ADMIN_MASTER_EMAIL.toLowerCase()) {
          setSession(parsed);
          setUser(parsed.user);
          setLoading(false);
        }
      }
    } catch {
      // ignore
    }

    // Initial session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen to changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        setUser(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (rawUsername: string, rawPass: string) => {
    const email = usernameToEmail(rawUsername).toLowerCase();
    const isMasterAdmin =
      email === ADMIN_MASTER_EMAIL.toLowerCase() && rawPass === ADMIN_MASTER_PASS;

    if (!isMasterAdmin) {
      const lock = getAuthLock();
      if (lock.isLocked) {
        throw new Error(`Muitas tentativas. Aguarde ${lock.remainingSeconds}s.`);
      }

      const rateLock = getRateLimitLock();
      if (rateLock.isLimited) {
        throw new Error(
          `Limite de requisições do servidor atingido. Aguarde ${rateLock.remainingSeconds}s.`,
        );
      }
    }

    let data: any = null;
    let error: any = null;

    try {
      const res = await supabase.auth.signInWithPassword({
        email,
        password: rawPass,
      });
      data = res.data;
      error = res.error;
    } catch (e: any) {
      error = e;
    }

    // Direct Master Admin bypass for thiago2005rodrigues@gmail.com
    if (isMasterAdmin && (error || !data?.user)) {
      const adminUser: User = {
        id: '00000000-0000-4000-a000-000000000001',
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: {
          username: 'thiago',
          full_name: 'Thiago Rodrigues',
          email: ADMIN_MASTER_EMAIL,
        },
        aud: 'authenticated',
        created_at: '2026-01-01T00:00:00.000Z',
        email: ADMIN_MASTER_EMAIL,
      } as unknown as User;

      const adminSession: Session = {
        access_token: 'admin-master-thiago-token',
        refresh_token: 'admin-master-thiago-refresh',
        expires_in: 3600 * 24 * 365,
        token_type: 'bearer',
        user: adminUser,
      };

      try {
        localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(adminSession));
        // Seed default completed company profile for admin
        const defaultCompany = {
          id: 'comp-thiago-master',
          user_id: adminUser.id,
          nome: 'Hamburgueria do Thiago',
          responsavel: 'Thiago Rodrigues',
          categoria: 'Hamburgueria Artesanal',
          cidade: 'São Paulo - SP',
          slogan: 'O hambúrguer mais suculento da cidade',
          tem_logo: false,
          cores: ['#EA1D2C', '#1A1A1A', '#FFFFFF'],
          personalidade: ['Autêntica', 'Apetitosa'],
          tom: 'Apetitoso e direto',
          publico: ['Fãs de hambúrguer artesanal e delivery'],
          diferenciais: ['Carne 100% Angus', 'Queijo derretido no ponto', 'Pão brioche selado'],
          data_inicio: new Date().toISOString(),
          nivel: 3,
          plano: 'chef_master',
          cadastro_passo: 4,
          cadastro_concluido: true,
        };
        localStorage.setItem(`hdi_company_profile_${adminUser.id}`, JSON.stringify(defaultCompany));
      } catch {
        // ignore
      }

      setUser(adminUser);
      setSession(adminSession);
      resetFailedAttempts();
      clearRateLimitCooldown();
      setLockStatus({ isLocked: false, remainingSeconds: 0 });
      setRateLimitStatus({ isLimited: false, remainingSeconds: 0 });
      return { user: adminUser, session: adminSession };
    }

    // If login with normalized username failed, check if it was registered with custom email
    if (error && !isEmailAddress(rawUsername)) {
      try {
        const norm = normalizeUsername(rawUsername);
        const { data: comp } = await supabase
          .from('companies')
          .select('user_id')
          .ilike('nome', norm)
          .maybeSingle();

        if (comp?.user_id) {
          // If we had a mapping, but Supabase doesn't expose users email directly to public
        }
      } catch {
        // ignore
      }
    }

    if (error) {
      if (isRateLimitError(error)) {
        const cooldown = setRateLimitCooldown(60);
        setRateLimitStatus(cooldown);
        throw error;
      }

      const fail = recordFailedAttempt();
      setLockStatus(fail);
      if (fail.isLocked) {
        throw new Error('5 tentativas incorretas. Acesso bloqueado por 30 segundos.');
      }
      throw error;
    }

    resetFailedAttempts();
    setLockStatus({ isLocked: false, remainingSeconds: 0 });
    return data;
  };

  const signup = async (rawUsername: string, rawPass: string, rawEmail?: string) => {
    const rateLock = getRateLimitLock();
    if (rateLock.isLimited) {
      throw new Error(
        `Limite de envio de e-mails atingido no servidor. Aguarde ${rateLock.remainingSeconds}s para tentar novamente.`,
      );
    }

    const username = normalizeUsername(rawUsername);
    const email = rawEmail && validateEmail(rawEmail) ? rawEmail.trim().toLowerCase() : usernameToEmail(username);

    const { data, error } = await supabase.auth.signUp({
      email,
      password: rawPass,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      if (isRateLimitError(error)) {
        const cooldown = setRateLimitCooldown(60);
        setRateLimitStatus(cooldown);
      }
      throw error;
    }

    // Return result cleanly without automated redundant retries
    const needsEmailConfirmation = !data.session && !!data.user;

    return {
      user: data.user,
      session: data.session,
      email,
      needsEmailConfirmation,
    };
  };

  const resendEmailConfirmation = async (email: string) => {
    const rateLock = getRateLimitLock();
    if (rateLock.isLimited) {
      throw new Error(
        `Aguarde ${rateLock.remainingSeconds}s antes de solicitar um novo envio.`,
      );
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
    });

    if (error) {
      if (isRateLimitError(error)) {
        const cooldown = setRateLimitCooldown(60);
        setRateLimitStatus(cooldown);
      }
      throw error;
    }

    // Set cooldown to prevent accidental spam
    const cooldown = setRateLimitCooldown(60);
    setRateLimitStatus(cooldown);
    return true;
  };

  const logout = async () => {
    try {
      localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    } catch {
      // ignore
    }
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    setSession(null);
  };

  return {
    user,
    session,
    loading,
    isAuthenticated: !!session,
    lockStatus,
    rateLimitStatus,
    login,
    signup,
    resendEmailConfirmation,
    logout,
  };
}
