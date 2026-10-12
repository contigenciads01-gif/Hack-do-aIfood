import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
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
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import loginBg from '@/assets/login-bg-clean.jpg';
import { SUPPORT_WHATSAPP } from '@/config';
import {
  useAuth,
  normalizeUsername,
  validateUsername,
  calculatePasswordStrength,
  type PasswordStrength,
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
  const { user, loading: authLoading, lockStatus, login, signup } = useAuth();

  const [modo, setModo] = useState<'login' | 'cadastro'>('login');
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);

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

  // Real-time username check on registration
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

    // Debounced check
    const timeout = setTimeout(async () => {
      try {
        // Query companies with that name or check auth
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
    }, 400);

    return () => clearTimeout(timeout);
  }, [usuario, modo]);

  const passwordInfo = calculatePasswordStrength(senha);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockStatus.isLocked) {
      toast.error(`Acesso bloqueado. Tente novamente em ${lockStatus.remainingSeconds}s.`);
      return;
    }

    const normUser = normalizeUsername(usuario);
    if (!normUser || !senha.trim()) {
      toast.error('Preencha o usuário e a senha.');
      return;
    }

    setLoading(true);
    try {
      const data = await login(normUser, senha);
      toast.success('Login realizado com sucesso!');
      if (data?.user) {
        await checkExistingCompanyAndRedirect(data.user.id);
      } else {
        navigate({ to: '/dashboard' });
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('email_provider_disabled')) {
        toast.error('Ative o provedor de Email no painel do Supabase (Authentication > Providers > Email).');
      } else if (msg.includes('tentativas') || msg.includes('bloqueado')) {
        toast.error(msg);
      } else {
        toast.error('Usuário ou senha incorretos.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    const normUser = normalizeUsername(usuario);
    const userVal = validateUsername(normUser);
    if (!userVal.valid) {
      toast.error(userVal.message || 'Nome de usuário inválido.');
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

    setLoading(true);
    try {
      await signup(normUser, senha);
      toast.success('Conta criada com sucesso! Complete o cadastro da sua loja.');
      navigate({ to: '/cadastro' });
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('already registered') || msg.includes('already exists')) {
        toast.error('Este usuário já está cadastrado. Faça login.');
      } else if (msg.includes('email_provider_disabled')) {
        toast.error('O provedor de e-mail do Supabase precisa ser ativado no painel do Supabase (Authentication > Providers > Email).');
      } else {
        toast.error(msg || 'Erro ao criar conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-black font-sans">
      {/* Background photo */}
      <img
        src={loginBg}
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-right"
      />
      {/* Dark gradient for legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-black/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />

      {/* Content */}
      <div className="relative z-10 flex min-h-svh items-center">
        <div className="w-full max-w-md px-8 py-12 sm:px-12">
          {/* Logo */}
          <h1 className="leading-[0.9]">
            <span className="block text-6xl font-black italic tracking-tight text-[#EA1D2C] sm:text-7xl">
              hack du
            </span>
            <span className="block text-7xl font-black italic tracking-tight text-[#EA1D2C] sm:text-8xl">
              ifood
            </span>
          </h1>

          <p className="mt-6 text-xl font-light text-white/90 sm:text-2xl">
            Mais estratégias.
            <br />
            Mais entregas.
          </p>

          <div className="mt-4 h-1 w-14 bg-[#EA1D2C]" />

          {/* Locked warning banner */}
          {lockStatus.isLocked && (
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-amber-300">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <div className="text-sm">
                <strong>Acesso temporariamente bloqueado</strong>
                <p>Muitas tentativas incorretas. Aguarde {lockStatus.remainingSeconds}s para tentar novamente.</p>
              </div>
            </div>
          )}

          {modo === 'login' ? (
            /* Form de login */
            <form onSubmit={handleLogin} className="mt-8 space-y-4">
              <label className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md transition-colors focus-within:border-[#EA1D2C]">
                <User className="h-5 w-5 shrink-0 text-white/80" />
                <span className="flex w-full flex-col">
                  <span className="text-xs font-medium text-white/60">Usuário</span>
                  <input
                    type="text"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    placeholder="@seurestaurante"
                    autoComplete="username"
                    disabled={lockStatus.isLocked || loading}
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
                    disabled={lockStatus.isLocked || loading}
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
                disabled={loading || lockStatus.isLocked}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EA1D2C] py-4 text-lg font-semibold text-white shadow-lg shadow-[#EA1D2C]/30 transition-all hover:bg-[#ff3b4b] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Entrando...' : lockStatus.isLocked ? `Aguarde ${lockStatus.remainingSeconds}s` : 'Entrar'}
                {!loading && !lockStatus.isLocked && <ArrowRight className="h-5 w-5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setUsuario('');
                  setSenha('');
                  setConfirmar('');
                  setModo('cadastro');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 py-4 text-lg font-semibold text-white transition-colors hover:bg-white/10"
              >
                <UserPlus className="h-5 w-5" />
                Primeiro acesso
              </button>
            </form>
          ) : (
            /* Form de primeiro acesso */
            <form onSubmit={handleCadastro} className="mt-8 space-y-4">
              <p className="text-sm text-white/70">
                Crie seu acesso com um <strong>@usuario</strong> único e uma senha segura.
              </p>

              <div>
                <label className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md transition-colors focus-within:border-[#EA1D2C]">
                  <User className="h-5 w-5 shrink-0 text-white/80" />
                  <span className="flex w-full flex-col">
                    <span className="text-xs font-medium text-white/60">@usuario da loja</span>
                    <input
                      type="text"
                      value={usuario}
                      onChange={(e) => setUsuario(e.target.value)}
                      placeholder="@sualoja"
                      autoComplete="username"
                      className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/40"
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
                    <span className="text-xs font-medium text-white/60">Criar senha (mínimo 8 caracteres, letra e número)</span>
                    <input
                      type={showSenha ? 'text' : 'password'}
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/40"
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
                    className="w-full bg-transparent text-base text-white outline-none placeholder:text-white/40"
                  />
                </span>
              </label>

              {/* Checkbox terms */}
              <label className="flex cursor-pointer items-start gap-3 px-1 pt-1 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={aceitouTermos}
                  onChange={(e) => setAceitouTermos(e.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-white/30 accent-[#EA1D2C]"
                />
                <span>
                  Li e aceito os termos de uso e política de privacidade do hack du ifood.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#EA1D2C] py-4 text-lg font-semibold text-white shadow-lg shadow-[#EA1D2C]/30 transition-all hover:bg-[#ff3b4b] active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? 'Criando conta...' : 'Criar acesso'}
                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setUsuario('');
                  setSenha('');
                  setConfirmar('');
                  setModo('login');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 py-4 text-lg font-semibold text-white transition-colors hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
                Voltar ao login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
