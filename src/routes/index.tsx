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
import cinematicBg from '@/assets/login-bg-cinematic.webp';
import logoHack from '@/assets/logo-hack.png';
import { AmbientLighting } from '@/components/login/AmbientLighting';
import { PhoneHero } from '@/components/login/PhoneHero';
import { ServicesSection } from '@/components/login/ServicesSection';
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
  const [lembrarMe, setLembrarMe] = useState(false);

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
    <div className="relative min-h-svh w-full bg-[#060606] font-sans text-white overflow-x-hidden flex flex-col justify-between">
      {/* Background Cinematográfico da Referência: mesa de ardósia, burger suculento e laptop ao fundo */}
      <img
        src={cinematicBg}
        alt="Ambiente Restaurante"
        className="absolute inset-0 h-full w-full object-cover object-right select-none pointer-events-none opacity-90 z-0"
      />

      {/* Gradientes de Fusão e Profundidade */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#060606] via-[#060606]/92 to-transparent z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#060606]/95 via-transparent to-[#060606]/50 z-0 pointer-events-none" />

      {/* Luzes Vermelhas Desfocadas, LEDs e Reflexos Animados */}
      <AmbientLighting />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col justify-between px-6 py-6 sm:px-10 lg:px-12 xl:px-16 max-w-[1720px] w-full mx-auto">
        <div className="my-auto flex flex-col lg:grid lg:grid-cols-[380px_minmax(360px,460px)_1fr] lg:gap-10 xl:gap-16 items-center">
          {/* Coluna 1: Esquerda (380px no desktop) */}
          <div className="w-full lg:w-[380px] lg:shrink-0 flex flex-col relative z-20">
            {/* Logo Original */}
            <div className="flex items-center">
              <img
                src={logoHack}
                alt="hack du ifood"
                className="h-14 sm:h-16 w-auto object-contain drop-shadow-[0_4px_16px_rgba(234,29,44,0.3)] animate-fade-in-up"
              />
            </div>

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
            /* Header com Boas-vindas da Referência */
            <div className="mt-7">
              <div className="animate-fade-in-up">
                <h2 className="text-2xl sm:text-[26px] font-bold tracking-tight text-white">
                  Bem-vindo de volta!
                </h2>
                <p className="mt-1 text-sm text-white/60">
                  Acesse sua conta e continue fazendo sua marca crescer.
                </p>
              </div>

              {/* Form de login */}
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                {/* Campo E-mail ou Usuário */}
                <label className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-[#121212]/90 px-4.5 py-3.5 backdrop-blur-md transition-all duration-200 focus-within:border-[#EA1D2C] focus-within:ring-2 focus-within:ring-[#EA1D2C]/20 hover:border-white/20">
                  <Mail className="h-5 w-5 shrink-0 text-white/50" />
                  <span className="flex w-full flex-col">
                    <span className="text-[11px] font-medium text-white/50">E-mail ou Usuário</span>
                    <input
                      type="text"
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                      placeholder="voce@restaurante.com ou @usuario"
                      autoComplete="username"
                      disabled={isFormBlocked}
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35 disabled:opacity-50"
                    />
                  </span>
                </label>

                {/* Campo Senha */}
                <label className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-[#121212]/90 px-4.5 py-3.5 backdrop-blur-md transition-all duration-200 focus-within:border-[#EA1D2C] focus-within:ring-2 focus-within:ring-[#EA1D2C]/20 hover:border-white/20">
                  <Lock className="h-5 w-5 shrink-0 text-white/50" />
                  <span className="flex w-full flex-col">
                    <span className="text-[11px] font-medium text-white/50">Senha</span>
                    <input
                      type={showSenha ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      disabled={isFormBlocked}
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35 disabled:opacity-50"
                    />
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSenha((v) => !v)}
                    aria-label={showSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    className="shrink-0 text-white/50 transition-colors hover:text-white p-1"
                  >
                    {showSenha ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </label>

                {/* Linha Esqueci minha senha com checkbox vermelho estilo referência */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs sm:text-sm text-white/70 hover:text-white transition-colors cursor-pointer select-none group/forgot">
                    <input
                      type="checkbox"
                      checked={lembrarMe}
                      onChange={(e) => setLembrarMe(e.target.checked)}
                      className="h-4 w-4 rounded border-white/20 bg-white/5 accent-[#EA1D2C] cursor-pointer"
                    />
                    <span className="group-hover/forgot:underline">Esqueci minha senha</span>
                  </label>
                  <a
                    href={SUPPORT_WHATSAPP}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white/40 hover:text-[#EA1D2C] transition-colors"
                  >
                    Suporte
                  </a>
                </div>

                {/* Botão Entrar com efeito de iluminação suave */}
                <button
                  type="submit"
                  disabled={isFormBlocked}
                  className="relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#EA1D2C] to-[#E31020] py-3.5 text-base font-bold text-white shadow-lg shadow-[#EA1D2C]/30 transition-all duration-300 hover:brightness-110 hover:shadow-[#EA1D2C]/50 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none animate-btn-shimmer" />

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

                {/* Botão Primeiro acesso com fundo escuro e borda discreta */}
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
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#121212]/80 py-3.5 text-sm sm:text-base font-semibold text-white/90 transition-all duration-200 hover:bg-white/[0.08] hover:border-white/25 hover:text-white active:scale-[0.99] disabled:opacity-50"
                >
                  <UserPlus className="h-4.5 w-4.5" />
                  Primeiro acesso
                </button>

                {/* Selo de Segurança */}
                <div className="pt-2 flex items-center gap-2 text-xs text-white/45">
                  <Lock className="h-3.5 w-3.5 shrink-0 text-white/40" />
                  <span>Seus dados estão seguros. Utilizamos as melhores práticas de segurança.</span>
                </div>
              </form>
            </div>
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

        {/* Coluna 2: Central — Serviços Informativos (Desktop) */}
        <div className="hidden lg:block w-full max-w-[460px] relative z-10 pl-2">
          <ServicesSection variant="desktop" />
        </div>

        {/* Coluna 3: Direita — Celular Flutuante com Badges iFood, 99 e Instagram (Desktop) */}
        <div className="hidden lg:flex flex-1 justify-center items-center relative z-10 min-h-[460px]">
          <PhoneHero variant="desktop" />
        </div>
      </div>

      {/* ÁREA MOBILE: Exibida em telas < 1024px abaixo do formulário de login */}
      <div className="block lg:hidden mt-8 space-y-8">
        {!emailPendente && (
          <>
            <PhoneHero variant="mobile" />
            <ServicesSection variant="mobile" className="border-t border-white/10 pt-8" />
          </>
        )}
      </div>

      {/* RODAPÉ DUPLO: Afiliado à esquerda, "Juntos vamos mais longe ✦" à direita */}
      <footer className="mt-8 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/45">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <span>Hack do aiFood não é afiliado ao iFood.</span>
        </div>

        {/* Frase da referência visual no canto inferior direito */}
        <div className="flex items-center gap-1.5 italic font-serif text-white/60 select-none">
          <span>Juntos vamos mais longe</span>
          <span className="text-[#EA1D2C] not-italic text-sm">✦</span>
        </div>
      </footer>
    </div>
  </div>
);
}
