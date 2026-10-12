import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  MessageCircle,
  UserPlus,
  ArrowLeft,
  Check,
  AlertCircle,
  Mail,
  Clock,
  Send,
  RefreshCw,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import loginBg from '@/assets/login-bg-clean.jpg';
import logoHack from '@/assets/logo-hack.png';
import { ValuePanel } from '@/components/login/ValuePanel';
import { FloatingTiles } from '@/components/login/FloatingTiles';
import { ArrowHint } from '@/components/login/ArrowHint';
import { SUPPORT_WHATSAPP } from '@/config';
import {
  useAuth,
  normalizeUsername,
  validateUsername,
  validateEmail,
  isEmailAddress,
  calculatePasswordStrength,
  isRateLimitError,
} from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'hack du ifood — Login' },
      {
        name: 'description',
        content: 'Acesse o hack du ifood: mais estratégias, mais entregas para o seu restaurante.',
      },
      { property: 'og:title', content: 'hack du ifood — Login' },
      {
        property: 'og:description',
        content: 'Mais estratégias. Mais entregas.',
      },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const {
    user,
    loading: authLoading,
    lockStatus,
    rateLimitStatus,
    login,
    signup,
    resendEmailConfirmation,
  } = useAuth();

  const [modo, setModo] = useState<'login' | 'cadastro'>('login');
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [emailPendente, setEmailPendente] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');

  // Guard against duplicate concurrent submissions (double-clicks / double events)
  const isSubmittingRef = useRef(false);

  // Username validation state for registration
  const [usernameCheck, setUsernameCheck] = useState<{
    valid: boolean;
    available?: boolean;
    message?: string;
  }>({ valid: true });

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && user) {
      checkExistingCompanyAndRedirect(user.id);
    }
  }, [authLoading, user]);

  const checkExistingCompanyAndRedirect = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('companies')
        .select('cadastro_passo')
        .eq('user_id', userId)
        .maybeSingle();

      if (!data || (data.cadastro_passo ?? 1) < 4) {
        navigate({ to: '/cadastro' });
      } else {
        navigate({ to: '/dashboard' });
      }
    } catch {
      navigate({ to: '/dashboard' });
    }
  };

  // Real-time username check on registration (debounced)
  useEffect(() => {
    if (modo !== 'cadastro' || !usuario.trim()) {
      setUsernameCheck({ valid: true });
      return;
    }

    const norm = normalizeUsername(usuario);
    const validation = validateUsername(norm);
    if (!validation.valid) {
      setUsernameCheck({ valid: false, message: validation.message ?? '' });
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const { data } = await supabase
          .from('companies')
          .select('id')
          .ilike('nome', norm)
          .limit(1);

        if (data && data.length > 0) {
          setUsernameCheck({
            valid: true,
            available: false,
            message: 'Nome já em uso. Escolha outro.',
          });
        } else {
          setUsernameCheck({
            valid: true,
            available: true,
            message: '@' + norm + ' disponível',
          });
        }
      } catch {
        setUsernameCheck({ valid: true, available: true });
      }
    }, 450);

    return () => clearTimeout(timeout);
  }, [usuario, modo]);

  const passwordInfo = calculatePasswordStrength(senha);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate triggers
    if (isSubmittingRef.current || loading) return;

    if (lockStatus.isLocked) {
      toast.error(`Acesso bloqueado. Tente novamente em ${lockStatus.remainingSeconds}s.`);
      return;
    }

    if (rateLimitStatus.isLimited) {
      toast.error(
        `Limite de requisições atingido. Aguarde ${rateLimitStatus.remainingSeconds}s antes de tentar novamente.`,
      );
      return;
    }

    const userInput = usuario.trim();
    if (!userInput || !senha.trim()) {
      toast.error('Preencha seu e-mail (ou usuário) e a senha.');
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const data = await login(userInput, senha);
      toast.success('Login realizado com sucesso!');
      if (data?.user) {
        await checkExistingCompanyAndRedirect(data.user.id);
      } else {
        navigate({ to: '/dashboard' });
      }
    } catch (err: any) {
      if (isRateLimitError(err)) {
        toast.error(
          'Limite de requisições do servidor atingido. Aguarde alguns instantes antes de tentar novamente.',
        );
      } else {
        const msg = err?.message || '';
        if (msg.includes('tentativas') || msg.includes('bloqueado')) {
          toast.error(msg);
        } else if (msg.includes('Email not confirmed')) {
          setSentToEmail(userInput.includes('@') && !userInput.startsWith('@') ? userInput : `${normalizeUsername(userInput)}@hackdoaifood.app`);
          setEmailPendente(true);
          toast.error('E-mail ainda não confirmado. Verifique sua caixa de entrada.');
        } else {
          toast.error('E-mail/usuário ou senha incorretos.');
        }
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent duplicate triggers
    if (isSubmittingRef.current || loading) return;

    if (rateLimitStatus.isLimited) {
      toast.error(
        `Limite de envio de e-mails atingido. Aguarde ${rateLimitStatus.remainingSeconds}s para tentar novamente.`,
      );
      return;
    }

    const normUser = normalizeUsername(usuario);
    const userVal = validateUsername(normUser);
    if (!userVal.valid) {
      toast.error(userVal.message || 'Nome de usuário inválido.');
      return;
    }

    // Validate email if informed
    const emailTrim = email.trim();
    if (emailTrim && !validateEmail(emailTrim)) {
      toast.error('Formato de e-mail inválido. Exemplo: seu.nome@gmail.com');
      return;
    }

    const passVal = calculatePasswordStrength(senha);
    if (!passVal.valid) {
      toast.error(passVal.message || 'Senha fraca.');
      return;
    }

    if (senha !== confirmar) {
      toast.error('As senhas não coincidem.');
      return;
    }

    if (!aceitouTermos) {
      toast.error('Você precisa aceitar os termos para criar a conta.');
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const result = await signup(normUser, senha, emailTrim || undefined);
      const targetEmail = result.email || emailTrim || `${normUser}@hackdoaifood.app`;
      setSentToEmail(targetEmail);

      if (result.needsEmailConfirmation) {
        setEmailPendente(true);
        toast.info(
          'Conta cadastrada! Um link de confirmação foi enviado para o seu e-mail.',
        );
      } else {
        toast.success('Conta criada com sucesso! Complete o cadastro da sua loja.');
        navigate({ to: '/cadastro' });
      }
    } catch (err: any) {
      if (isRateLimitError(err)) {
        toast.error(
          'Limite de envio de e-mails do servidor atingido (máx. por hora do serviço padrão). Aguarde 60 segundos antes de tentar novamente.',
        );
      } else {
        const msg = err?.message || '';
        if (msg.includes('already registered') || msg.includes('already exists')) {
          toast.error('Este usuário ou e-mail já está cadastrado. Faça login.');
        } else if (msg.includes('email_provider_disabled')) {
          toast.error(
            'O provedor de e-mail do Supabase precisa ser ativado no painel (Authentication > Providers > Email).',
          );
        } else {
          toast.error(msg || 'Erro ao criar conta. Tente novamente.');
        }
      }
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const handleResendConfirmation = async () => {
    if (!sentToEmail || resending) return;
    if (rateLimitStatus.isLimited) {
      toast.error(`Aguarde ${rateLimitStatus.remainingSeconds}s antes de reenviar.`);
      return;
    }
    setResending(true);
    try {
      await resendEmailConfirmation(sentToEmail);
      toast.success('E-mail de confirmação reenviado com sucesso! Verifique sua caixa de entrada e spam.');
    } catch (err: any) {
      if (isRateLimitError(err)) {
        toast.error('Limite de envio atingido. Aguarde 60 segundos.');
      } else {
        toast.error(err?.message || 'Erro ao reenviar confirmação.');
      }
    } finally {
      setResending(false);
    }
  };

  const isFormBlocked = loading || lockStatus.isLocked || rateLimitStatus.isLimited;

  return (
    <div className="relative min-h-svh w-full bg-[#080808] font-sans text-white overflow-x-hidden flex flex-col justify-between">
      {/* Background Chef photo — face clearly visible in upper right corner */}
      <img
        src={loginBg}
        alt="Chef"
        className="absolute inset-0 h-full w-full object-cover object-[right_top] select-none pointer-events-none opacity-85 z-0"
      />

      {/* Dark gradient for optimal contrast and readability while keeping chef face visible */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/98 via-[#080808]/85 to-[#080808]/25 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/95 via-transparent to-[#080808]/40 z-0 pointer-events-none" />

      {/* Floating glass tiles at varying depths */}
      <FloatingTiles variant="desktop" />
      <FloatingTiles variant="mobile" />

      {/* Main Content Area: Responsive Grid (3 columns on Desktop >=1024px, stacked on mobile) */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row lg:items-center px-6 py-8 sm:px-10 lg:px-10 xl:px-14 lg:gap-10 xl:gap-14 max-w-[1600px] w-full mx-auto my-auto">
        {/* Coluna 1: Esquerda (360px no desktop) */}
        <div className="w-full lg:w-[360px] lg:shrink-0 flex flex-col relative z-20">
          {/* Logo Original (PNG transparente com sorriso-seta e faíscas) */}
          <div className="flex items-center">
            <img
              src={logoHack}
              alt="hack du ifood"
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>

          <p className="mt-4 text-base font-light text-white/90 sm:text-lg leading-snug">
            Mais estratégias.
            <br />
            Mais entregas.
          </p>

          <div className="mt-3 h-1 w-14 bg-[#EA1D2C] rounded-sm" />

          {/* Rate-limit warning banner */}
          {rateLimitStatus.isLimited && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/15 p-4 text-amber-300">
              <Clock className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="text-sm">
                <strong className="block font-bold">Limite de e-mails atingido</strong>
                <p className="mt-0.5 text-xs text-amber-200/90">
                  O serviço de e-mail do servidor atingiu o limite de segurança por hora. Aguarde{' '}
                  <span className="font-bold underline">{rateLimitStatus.remainingSeconds}s</span>{' '}
                  antes de tentar novamente.
                </p>
              </div>
            </div>
          )}

          {/* 5-failed-attempts lock banner */}
          {lockStatus.isLocked && !rateLimitStatus.isLimited && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <div className="text-sm">
                <strong>Acesso temporariamente bloqueado</strong>
                <p>
                  Muitas tentativas incorretas. Aguarde {lockStatus.remainingSeconds}s para tentar
                  novamente.
                </p>
              </div>
            </div>
          )}

          {/* Email Confirmation Pending Screen — Digna, Moderna & Polida */}
          {emailPendente ? (
            <div className="mt-8 overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-white/[0.12] to-white/[0.04] p-7 shadow-2xl backdrop-blur-2xl text-white">
              {/* Badge com ícone animado */}
              <div className="flex items-center gap-3">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#EA1D2C] to-[#ff5967] text-white shadow-lg shadow-[#EA1D2C]/40">
                  <Mail className="h-7 w-7" />
                  <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500 text-[10px] text-white shadow">
                    <Sparkles className="h-3 w-3" />
                  </div>
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Conta registrada
                  </span>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight text-white">
                    Confirme seu e-mail
                  </h3>
                </div>
              </div>

              {/* Card com o e-mail destacado */}
              <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-white/50">
                  Enviamos o link de ativação para:
                </p>
                <p className="mt-1 flex items-center gap-2 font-mono text-base font-bold text-white break-all">
                  <span className="text-[#EA1D2C]">✉</span>
                  {sentToEmail || (usuario ? (isEmailAddress(usuario) ? usuario : `${normalizeUsername(usuario)}@hackdoaifood.app`) : 'seu e-mail')}
                </p>
              </div>

              <div className="mt-4 space-y-2 text-sm text-white/80">
                <p>
                  1. Abra seu aplicativo de e-mail e clique no botão de validação.
                </p>
                <p className="text-xs text-white/50">
                  Caso não encontre na caixa de entrada, verifique na pasta de <strong>Spam</strong> ou <strong>Promoções</strong>.
                </p>
              </div>

              {/* Botões de Ação */}
              <div className="mt-6 space-y-3">
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resending || rateLimitStatus.isLimited}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {resending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Reenviando link...
                    </>
                  ) : rateLimitStatus.isLimited ? (
                    <>
                      <Clock className="h-4 w-4 text-amber-400" />
                      Reenviar em {rateLimitStatus.remainingSeconds}s
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 text-white/80" />
                      Reenviar e-mail de confirmação
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmailPendente(false);
                    setModo('login');
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EA1D2C] py-3.5 text-base font-bold text-white shadow-lg shadow-[#EA1D2C]/30 transition hover:bg-[#ff3b4b] active:scale-[0.99]"
                >
                  <ArrowRight className="h-5 w-5" />
                  Ir para o Login
                </button>
              </div>
            </div>
          ) : modo === 'login' ? (
            /* Form de login */
            <form onSubmit={handleLogin} className="mt-8 space-y-4">
              <label className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md transition-colors focus-within:border-[#EA1D2C]">
                <Mail className="h-5 w-5 shrink-0 text-white/80" />
                <span className="flex w-full flex-col">
                  <span className="text-xs font-medium text-white/60">E-mail ou Usuário</span>
                  <input
                    type="text"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    placeholder="voce@restaurante.com ou @usuario"
                    autoComplete="username"
                    disabled={isFormBlocked}
                    className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/40 disabled:opacity-50"
                  />
                </span>
              </label>

              <label className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md transition-colors focus-within:border-[#EA1D2C]">
                <Lock className="h-5 w-5 shrink-0 text-white/80" />
                <span className="flex w-full flex-col">
                  <span className="text-xs font-medium text-white/60">Senha</span>
                  <input
                    type={showSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isFormBlocked}
                    className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/40 disabled:opacity-50"
                  />
                </span>
                <button
                  type="button"
                  onClick={() => setShowSenha((v) => !v)}
                  aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  className="shrink-0 text-white/80 transition-colors hover:text-white"
                >
                  {showSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </label>

              <div className="flex justify-end">
                <a
                  href={SUPPORT_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-medium text-[#25D366] transition-colors hover:text-[#4be57f]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Esqueci a senha — falar com suporte
                </a>
              </div>

              <button
                type="submit"
                disabled={isFormBlocked}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EA1D2C] py-4 text-base font-semibold text-white transition-colors hover:bg-[#d01926] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? 'Entrando...'
                  : lockStatus.isLocked
                    ? `Aguarde (${lockStatus.remainingSeconds}s)`
                    : rateLimitStatus.isLimited
                      ? `Aguarde (${rateLimitStatus.remainingSeconds}s)`
                      : 'Entrar'}
                {!loading && !lockStatus.isLocked && !rateLimitStatus.isLimited && (
                  <ArrowRight className="h-5 w-5" />
                )}
              </button>

              <div className="relative">
                <button
                  type="button"
                  id="btn-primeiro-acesso"
                  disabled={loading}
                  onClick={() => {
                    setUsuario('');
                    setEmail('');
                    setSenha('');
                    setConfirmar('');
                    setModo('cadastro');
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
                >
                  <UserPlus className="h-5 w-5" />
                  Primeiro acesso
                </button>
                <ArrowHint className="absolute -right-32 top-1/2 -translate-y-1/2 z-30" />
              </div>
            </form>
          ) : (
            /* Form de primeiro acesso */
            <form onSubmit={handleCadastro} className="mt-8 space-y-4">
              <p className="text-sm text-white/70">
                Crie seu acesso com suas credenciais para gerenciar seus metaprompts.
              </p>

              {/* Campo de E-mail Real */}
              <div>
                <label className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md transition-colors focus-within:border-[#EA1D2C]">
                  <Mail className="h-5 w-5 shrink-0 text-white/80" />
                  <span className="flex w-full flex-col">
                    <span className="text-xs font-medium text-white/60">Seu e-mail corporativo / pessoal</span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seunome@restaurante.com"
                      autoComplete="email"
                      disabled={isFormBlocked}
                      className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/40 disabled:opacity-50"
                    />
                  </span>
                  {email.trim() && validateEmail(email) && (
                    <Check className="h-5 w-5 text-emerald-400" />
                  )}
                </label>
                <p className="mt-1 px-2 text-[11px] text-white/40">
                  O link de confirmação e recuperação de acesso será enviado para este e-mail.
                </p>
              </div>

              {/* Campo de Usuário (@loja) */}
              <div>
                <label className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md transition-colors focus-within:border-[#EA1D2C]">
                  <User className="h-5 w-5 shrink-0 text-white/80" />
                  <span className="flex w-full flex-col">
                    <span className="text-xs font-medium text-white/60">Identificador da loja (@usuario)</span>
                    <input
                      type="text"
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                      placeholder="@sualoja"
                      autoComplete="username"
                      disabled={isFormBlocked}
                      className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/40 disabled:opacity-50"
                    />
                  </span>
                  {usuario.trim() && usernameCheck.available && (
                    <Check className="h-5 w-5 text-emerald-400" />
                  )}
                </label>
                {usuario.trim() && usernameCheck.message && (
                  <p
                    className={`mt-1.5 px-2 text-xs ${
                      usernameCheck.valid && usernameCheck.available !== false
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {usernameCheck.message}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md transition-colors focus-within:border-[#EA1D2C]">
                  <Lock className="h-5 w-5 shrink-0 text-white/80" />
                  <span className="flex w-full flex-col">
                    <span className="text-xs font-medium text-white/60">
                      Criar senha (mínimo 8 caracteres, letra e número)
                    </span>
                    <input
                      type={showSenha ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      disabled={isFormBlocked}
                      className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/40 disabled:opacity-50"
                    />
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSenha((v) => !v)}
                    aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    className="shrink-0 text-white/80 transition-colors hover:text-white"
                  >
                    {showSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </label>

                {/* Password strength meter */}
                {senha.length > 0 && (
                  <div className="mt-2 px-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/60">Força da senha:</span>
                      <span
                        className={`font-semibold capitalize ${
                          passwordInfo.strength === 'forte'
                            ? 'text-emerald-400'
                            : passwordInfo.strength === 'media'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                        }`}
                      >
                        {passwordInfo.strength}
                      </span>
                    </div>
                    <div className="mt-1.5 flex h-1.5 gap-1.5 overflow-hidden">
                      <div
                        className={`h-full flex-1 rounded-sm ${
                          passwordInfo.strength === 'fraca'
                            ? 'bg-rose-500'
                            : passwordInfo.strength === 'media'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                        }`}
                      />
                      <div
                        className={`h-full flex-1 rounded-sm ${
                          passwordInfo.strength === 'media'
                            ? 'bg-amber-500'
                            : passwordInfo.strength === 'forte'
                              ? 'bg-emerald-500'
                              : 'bg-white/10'
                        }`}
                      />
                      <div
                        className={`h-full flex-1 rounded-sm ${
                          passwordInfo.strength === 'forte' ? 'bg-emerald-500' : 'bg-white/10'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md transition-colors focus-within:border-[#EA1D2C]">
                <Lock className="h-5 w-5 shrink-0 text-white/80" />
                <span className="flex w-full flex-col">
                  <span className="text-xs font-medium text-white/60">Confirmar senha</span>
                  <input
                    type={showSenha ? 'text' : 'password'}
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={isFormBlocked}
                    className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/40 disabled:opacity-50"
                  />
                </span>
              </label>

              {/* Checkbox terms */}
              <label className="flex cursor-pointer items-start gap-3 px-1 pt-1 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={aceitouTermos}
                  onChange={(e) => setAceitouTermos(e.target.checked)}
                  disabled={isFormBlocked}
                  className="mt-1 h-5 w-5 rounded border-white/30 accent-[#EA1D2C]"
                />
                <span>
                  Li e aceito os termos de uso e política de privacidade do hack du ifood.
                </span>
              </label>

              <button
                type="submit"
                disabled={isFormBlocked}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EA1D2C] py-4 text-base font-semibold text-white transition-colors hover:bg-[#d01926] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? 'Criando conta...'
                  : rateLimitStatus.isLimited
                    ? `Aguarde (${rateLimitStatus.remainingSeconds}s)`
                    : 'Criar acesso'}
                {!loading && !rateLimitStatus.isLimited && <ArrowRight className="h-5 w-5" />}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setUsuario('');
                  setEmail('');
                  setSenha('');
                  setConfirmar('');
                  setModo('login');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10 disabled:opacity-50"
              >
                <ArrowLeft className="h-5 w-5" />
                Voltar ao login
              </button>
            </form>
          )}
        </div>

        {/* Coluna 2: Central — ValuePanel (Desktop ao centro; Mobile abaixo do form) */}
        <div className="w-full lg:max-w-[520px] lg:shrink-0 mt-8 lg:mt-0 relative z-10">
          {/* Desktop ValuePanel */}
          <div className="hidden lg:block">
            <ValuePanel variant="desktop" />
          </div>
          {/* Mobile ValuePanel (exibido abaixo do formulário) */}
          {!emailPendente && (
            <div className="block lg:hidden pt-4 border-t border-[#2A2A2A]/80">
              <ValuePanel variant="mobile" />
            </div>
          )}
        </div>

        {/* Coluna 3: Direita — Área aberta mantendo o rosto do chef no canto superior direito */}
        <div className="hidden lg:flex flex-1 min-h-[360px] pointer-events-none select-none" aria-hidden="true" />
      </div>

      {/* Rodapé Pequeno: "Hack do aiFood não é afiliado ao iFood." */}
      <footer className="relative z-10 px-6 py-4 sm:px-10 lg:px-14 text-center lg:text-left text-sm text-white/50 border-t border-white/5">
        Hack do aiFood não é afiliado ao iFood.
      </footer>
    </div>
  );
}
