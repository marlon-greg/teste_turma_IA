import { useState, useEffect, FormEvent } from 'react';
import { 
  Lock, 
  User as UserIcon, 
  Eye, 
  EyeOff, 
  Sparkles, 
  ArrowRight,
  UserPlus,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Github
} from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Login input fields
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign up fields
  const [signUpName, setSignUpName] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');

  // Alerts states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Auto-fill template advice default credentials
  useEffect(() => {
    // Generate default local user in localStorage if none exists, so they have an instant log in demo
    const existingUsers = localStorage.getItem('local_users');
    if (!existingUsers) {
      const defaultUsers = [
        {
          name: 'Marlon Fanger',
          username: 'marlon',
          password: '123'
        }
      ];
      localStorage.setItem('local_users', JSON.stringify(defaultUsers));
    }
  }, []);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const normalisedUsername = username.trim().toLowerCase();
    if (!normalisedUsername || !password) {
      setErrorMsg('Por favor, informe seu usuário e senha.');
      return;
    }

    // Retrieve local users
    const usersStr = localStorage.getItem('local_users');
    const usersList = usersStr ? JSON.parse(usersStr) : [];

    const foundUser = usersList.find((u: any) => u.username.toLowerCase() === normalisedUsername && u.password === password);

    if (foundUser) {
      // Create session user structure
      const sessionUser: User = {
        username: foundUser.username,
        name: foundUser.name,
        avatarSeed: foundUser.avatarSeed || foundUser.name.charAt(0).toUpperCase(),
        joinedAt: foundUser.joinedAt || new Date().toLocaleDateString('pt-BR')
      };
      
      localStorage.setItem('current_user', JSON.stringify(sessionUser));
      onLoginSuccess(sessionUser);
    } else {
      setErrorMsg('Usuário ou senha incorretos. Tente "marlon" e senha "123" ou cadastre um novo!');
    }
  };

  const handleSignUp = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const normalisedUser = signUpUsername.trim().toLowerCase();

    if (!signUpName.trim() || !normalisedUser || !signUpPassword) {
      setErrorMsg('Preencha todos os campos obrigatórios para o cadastro.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMsg('As senhas digitadas não coincidem.');
      return;
    }

    // Check availability
    const usersStr = localStorage.getItem('local_users');
    const usersList = usersStr ? JSON.parse(usersStr) : [];

    const userExists = usersList.some((u: any) => u.username.toLowerCase() === normalisedUser);
    if (userExists) {
      setErrorMsg('Este nome de usuário já está sendo utilizado.');
      return;
    }

    // Register user
    const newUser = {
      name: signUpName.trim(),
      username: normalisedUser,
      password: signUpPassword,
      avatarSeed: signUpName.trim().charAt(0).toUpperCase(),
      joinedAt: new Date().toLocaleDateString('pt-BR')
    };

    const updatedUsers = [...usersList, newUser];
    localStorage.setItem('local_users', JSON.stringify(updatedUsers));

    setSuccessMsg('Conta criada com sucesso! Faça login abaixo para acessar seu painel.');
    setIsSignUp(false);

    // Fill in sign in fields automatically for convenience
    setUsername(normalisedUser);
    setPassword(signUpPassword);

    // Clear register fields
    setSignUpName('');
    setSignUpUsername('');
    setSignUpPassword('');
    setSignUpConfirmPassword('');
  };

  // Quick autofill for easier validation/evaluation
  const fillAutofillDemo = () => {
    setUsername('marlon');
    setPassword('123');
    setErrorMsg('');
  };

  return (
    <div id="login-screen-parent" className="min-h-screen flex items-center justify-center glass-background px-4 py-12 relative overflow-hidden">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-fuchsia-600/20 blur-3xl pointer-events-none"></div>

      {/* Main Container Card */}
      <div 
        id="login-main-card" 
        className="w-full max-w-md glass-card rounded-3xl p-6 md:p-8 relative z-10 transition-all"
      >
        {/* Decorative Top Accent Tag */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest glass-badge text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            100% Offline e Seguro
          </div>
        </div>

        {/* Head Titles */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
            Workspace Hub
          </h1>
          <p className="text-slate-400 mt-2 text-xs md:text-sm">
            {isSignUp 
              ? 'Registre sua credencial local de forma privada e instantânea.' 
              : 'Faça login para gerenciar suas metas e finanças no navegador.'}
          </p>
        </div>

        {/* Dynamic Warning Alert Messages */}
        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/25 text-xs text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/25 text-xs text-emerald-300 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>{successMsg}</div>
          </div>
        )}

        {/* RENDER LOGIN / REGISTER FORM */}
        {!isSignUp ? (
          /* SIGN IN FORM VIEW */
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label htmlFor="signin-user" className="block text-[10px] font-bold text-slate-350 uppercase tracking-wider">
                Nome de Usuário
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  id="signin-user"
                  type="text"
                  placeholder="Seu nome de usuário (Ex: marlon)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label htmlFor="signin-pass" className="block text-[10px] font-bold text-slate-350 uppercase tracking-wider">
                Senha secreta
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="signin-pass"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha secreta (Ex: 123)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl glass-input text-sm placeholder-slate-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer p-1 rounded"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 mt-2 rounded-xl glass-button-primary text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              Acessar Workspace
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Autofill helper advice panel */}
            <div className="mt-4 p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 flex items-start justify-between gap-2">
              <div className="flex gap-2">
                <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
                <p className="leading-relaxed">
                  Dica: Use as credenciais de teste<br />
                  Usuário: <strong className="font-mono text-white">marlon</strong> | Senha: <strong className="font-mono text-white">123</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={fillAutofillDemo}
                className="px-2 py-1 rounded bg-indigo-500/30 hover:bg-indigo-500/50 border border-indigo-500/30 text-[10px] uppercase font-bold text-white transition-colors cursor-pointer"
              >
                Preencher
              </button>
            </div>
          </form>
        ) : (
          /* SIGN UP REGISTER FORM VIEW */
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="signup-name" className="block text-[10px] font-bold text-slate-350 uppercase tracking-wider">
                Nome Completo / Exibição
              </label>
              <input
                id="signup-name"
                type="text"
                placeholder="Ex. de exibição: Marlon Fanger"
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl glass-input text-sm placeholder-slate-500 focus:outline-none"
                required
              />
            </div>

            {/* Username Selection */}
            <div className="space-y-1.5">
              <label htmlFor="signup-user" className="block text-[10px] font-bold text-slate-350 uppercase tracking-wider">
                Defina o Usuário de Login
              </label>
              <input
                id="signup-user"
                type="text"
                placeholder="Ex: marlon98 (sem espaços)"
                value={signUpUsername}
                onChange={(e) => setSignUpUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-xl glass-input text-sm placeholder-slate-500 focus:outline-none"
                required
              />
            </div>

            {/* Password and confirmation code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="signup-pass" className="block text-[10px] font-bold text-slate-350 uppercase tracking-wider">
                  Crie uma Senha
                </label>
                <input
                  id="signup-pass"
                  type="password"
                  placeholder="Sua senha"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl glass-input text-sm placeholder-slate-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="signup-pass-confirm" className="block text-[10px] font-bold text-slate-350 uppercase tracking-wider">
                  Confirme a Senha
                </label>
                <input
                  id="signup-pass-confirm"
                  type="password"
                  placeholder="Repita a senha"
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl glass-input text-sm placeholder-slate-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="w-full py-3 mt-2 rounded-xl glass-button-primary text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Concluir Cadastro Local
            </button>
          </form>
        )}

        {/* Footer Toggle between forms */}
        <div className="mt-6 pt-6 border-t border-slate-800/60 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline cursor-pointer transition-colors"
          >
            {isSignUp 
              ? 'Já tem cadastro? Voltar para login' 
              : 'Não possui conta? Cadastre-se gratuitamente'}
          </button>
        </div>
      </div>

      {/* Decorative Brand Details */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-medium font-mono text-center">
        Workspace Dashboard &copy; 2026 | Arquitetura 100% Client-Side protegida
      </div>
    </div>
  );
}
