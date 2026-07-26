import { useState, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { login, fetchCurrentUser } from '@/api/auth';

export default function AuthGate({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const currentUserQuery = useQuery({
    queryKey: ['current-user'],
    queryFn: fetchCurrentUser,
    retry: false,
  });
  const loginMutation = useMutation({
    mutationFn: () => login(username.trim(), password),
    onSuccess: (user) => queryClient.setQueryData(['current-user'], user),
  });

  if (currentUserQuery.isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-[var(--text-secondary)]">正在验证平台登录状态...</div>;
  }

  if (currentUserQuery.data) {
    return <>{children}</>;
  }

  const error = loginMutation.error || currentUserQuery.error;
  const errorMessage = error instanceof Error ? error.message : '';
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-root)]">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (username.trim() && password) loginMutation.mutate();
        }}
        className="w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-7 shadow-xl"
      >
        <p className="text-xs font-semibold tracking-[0.18em] text-[var(--accent-primary)] mb-2">ANT VISION</p>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">登录创作工作台</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-6">登录后可访问项目、剧本、图像资产与视频生成接口。</p>
        {errorMessage && <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-500">{errorMessage}</p>}
        <label className="block text-sm text-[var(--text-secondary)] mb-2">用户名</label>
        <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] mb-4" />
        <label className="block text-sm text-[var(--text-secondary)] mb-2">密码</label>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-input)] px-3 py-2.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-primary)] mb-6" />
        <button type="submit" disabled={loginMutation.isPending || !username.trim() || !password} className="w-full rounded-lg bg-[var(--accent-primary)] px-4 py-3 text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90 transition-opacity">
          {loginMutation.isPending ? '登录中...' : '登录'}
        </button>
      </form>
    </main>
  );
}
