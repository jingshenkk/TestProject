import { useState, type FormEvent, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchCurrentUser, login, register } from '@/api/auth';
import { showcaseMedia } from '@/mocks/showcaseMedia';

type AuthMode = 'login' | 'register';
const SHOWCASE_LAYOUTS = ['layout-a', 'layout-b', 'layout-c', 'layout-d'] as const;

function AntVisionLogo({ className = '' }: { className?: string }) {
  return (
    <svg className={`antvision-logo-symbol ${className}`} viewBox="0 0 112 76" aria-hidden="true">
      <path className="antvision-logo-eye" d="M18 36C31 20 54 14 76 23C88 28 96 37 100 45" />
      <path className="antvision-logo-arc" d="M13 58C36 47 77 47 99 58" />
      <g className="antvision-logo-ant">
        <ellipse className="antvision-ant-body" cx="35" cy="40" rx="13" ry="9" transform="rotate(-10 35 40)" />
        <circle className="antvision-ant-body" cx="53" cy="36" r="7.5" />
        <ellipse className="antvision-ant-body" cx="68" cy="30" rx="12.5" ry="9.5" transform="rotate(13 68 30)" />
        <circle className="antvision-ant-focus" cx="70" cy="29" r="3.2" />
        <path className="antvision-ant-line" d="M50 42C48 48 44 52 39 55" />
        <path className="antvision-ant-line" d="M59 42C62 48 63 53 61 58" />
        <path className="antvision-ant-line" d="M64 40C69 45 72 49 73 55" />
        <path className="antvision-ant-line" d="M63 20C65 12 71 8 78 8" />
        <path className="antvision-ant-line" d="M71 20C76 14 82 13 88 17" />
      </g>
    </svg>
  );
}

export default function AuthGate({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState(() => localStorage.getItem('platform_username') || '');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [mode, setMode] = useState<AuthMode>('login');
  const [layout] = useState(() => SHOWCASE_LAYOUTS[Math.floor(Math.random() * SHOWCASE_LAYOUTS.length)]);
  const currentUserQuery = useQuery({ queryKey: ['current-user'], queryFn: fetchCurrentUser, retry: false });
  const authMutation = useMutation({
    mutationFn: () => mode === 'register'
      ? register(username.trim(), password, displayName.trim())
      : login(username.trim(), password),
    onSuccess: (user) => {
      localStorage.setItem('platform_username', username.trim());
      queryClient.setQueryData(['current-user'], user);
    },
  });

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setPassword('');
    if (nextMode === 'register') {
      setUsername('');
      setDisplayName('');
    } else {
      setUsername(localStorage.getItem('platform_username') || '');
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (username.trim() && password) authMutation.mutate();
  };

  if (currentUserQuery.isLoading) {
    return <div className="auth-gate-page"><div className="auth-gate-card auth-gate-loading">正在验证平台登录状态...</div></div>;
  }
  if (currentUserQuery.data) return <>{children}</>;

  const errorMessage = authMutation.error instanceof Error ? authMutation.error.message : '';
  const tiles = Array.from({ length: 9 }, (_, index) => showcaseMedia[index % showcaseMedia.length]);
  const canSubmit = username.trim().length > 0 && password.length > 0 && (mode === 'login' || (username.trim().length >= 3 && password.length >= 6));

  return (
    <div className="auth-gate-page">
      <div className="auth-gate-shell">
        <section className="auth-showcase-panel" aria-label="作品展示区">
          <div className="auth-showcase-copy">
            <span>Ant Vision Showcase</span>
            <h2>让每一个灵感，都不止停留在想象。</h2>
            <p>从故事灵感到镜头画面，把创作想象沉淀为可看、可审、可交付的影像资产。</p>
          </div>
          <div className={`auth-showcase-grid ${layout} has-videos`}>
            {tiles.map((media, index) => (
              <div key={`${media.id}-${index}`} className={`auth-video-tile tile-${index + 1}`}>
                {media.kind === 'video' ? (
                  <video src={media.src} poster={media.poster} muted loop autoPlay playsInline preload="metadata" />
                ) : (
                  <img src={media.src} alt={media.title} loading="eager" />
                )}
              </div>
            ))}
          </div>
        </section>
        <section className="auth-gate-card auth-login-card">
          <div className="auth-brand-block">
            <div className="auth-logo-lockup">
              <div className="auth-logo-mark"><AntVisionLogo /></div>
              <div><span>ANT VISION</span><strong>蚂蚁视界</strong></div>
            </div>
            <p>影视级 AIGC 内容生产与资产管线工作台</p>
          </div>
          <div className="auth-mode-switch" role="tablist" aria-label="账户模式">
            <button type="button" className={mode === 'login' ? 'is-active' : ''} onClick={() => switchMode('login')}>登录</button>
            <button type="button" className={mode === 'register' ? 'is-active' : ''} onClick={() => switchMode('register')}>注册</button>
          </div>
          <form className="auth-login-form" onSubmit={submit}>
            {mode === 'register' && <label><span>显示名</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name" placeholder="可选，用于账户展示" /></label>}
            <label><span>账户</span><input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" placeholder={mode === 'register' ? '至少 3 位' : '请输入账户名'} /></label>
            <label><span>密码</span><input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} placeholder={mode === 'register' ? '至少 6 位密码' : '请输入登录密码'} /></label>
            {errorMessage && <div className="auth-error">{errorMessage}</div>}
            <button type="submit" disabled={authMutation.isPending || !canSubmit}>{authMutation.isPending ? (mode === 'register' ? '注册中…' : '登录中…') : (mode === 'register' ? '注册并进入平台' : '进入平台')}</button>
          </form>
        </section>
      </div>
    </div>
  );
}
