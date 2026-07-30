import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Check, CircleUserRound, Coins, Crown, Eye, EyeOff, LockKeyhole,
  LogOut, Menu, Pencil, Phone, ShieldCheck, UserRound, X,
} from 'lucide-react';
import { fetchCurrentUser, logout, type CurrentUser } from '@/api/auth';

type EditableField = 'displayName' | 'username' | null;
type AccountSection = 'orders' | 'usage' | 'profile' | 'team' | 'feedback';

interface ProfileDraft {
  displayName?: string;
  username?: string;
}

const PROFILE_DRAFT_KEY = 'ant_vision_profile_draft';
const TEXT = {
  accountCenter: '\u8d26\u6237\u4e2d\u5fc3',
  openMenu: '\u6253\u5f00\u8d26\u6237\u83dc\u5355',
  saveEdit: '\u4fdd\u5b58\u4fee\u6539',
  cancelEdit: '\u53d6\u6d88\u4fee\u6539',
  edit: '\u7f16\u8f91',
  nickname: '\u6635\u79f0',
  account: '\u8d26\u53f7',
  password: '\u5bc6\u7801',
  phone: '\u624b\u673a\u53f7',
  verified: '\u5df2\u9a8c\u8bc1\u8d26\u6237',
  unbound: '\u672a\u7ed1\u5b9a',
  passwordHidden: '\u5bc6\u7801\u7531\u767b\u5f55\u51ed\u8bc1\u4fdd\u62a4\uff0c\u65e0\u6cd5\u660e\u6587\u67e5\u770b',
  showPasswordHint: '\u67e5\u770b\u5bc6\u7801\u8bf4\u660e',
  hidePasswordHint: '\u9690\u85cf\u5bc6\u7801\u8bf4\u660e',
  browserStorage: '\u6635\u79f0\u4e0e\u8d26\u53f7\u7684\u4fee\u6539\u4f1a\u6682\u5b58\u5230\u5f53\u524d\u6d4f\u89c8\u5668\uff1b\u63a5\u5165\u8d26\u6237\u8d44\u6599\u63a5\u53e3\u540e\u5c06\u81ea\u52a8\u540c\u6b65\u81f3\u670d\u52a1\u7aef\u3002',
  logout: '\u9000\u51fa\u767b\u5f55',
  logoutConfirm: '\u786e\u8ba4\u9000\u51fa\u767b\u5f55\uff1f',
  logoutCopy: '\u9000\u51fa\u540e\u9700\u8981\u91cd\u65b0\u767b\u5f55\u624d\u80fd\u7ee7\u7eed\u8bbf\u95ee\u9879\u76ee\u4e0e\u8d44\u4ea7\u3002',
  cancel: '\u53d6\u6d88',
  confirmLogout: '\u786e\u8ba4\u9000\u51fa',
  loggingOut: '\u9000\u51fa\u4e2d\u2026',
  enterpriseMember: '\u4f01\u4e1a\u4f1a\u5458',
  flagshipMember: '\u65d7\u8230\u4f1a\u5458',
  premiumMember: '\u9ad8\u7ea7\u4f1a\u5458',
  standardMember: '\u6807\u51c6\u4f1a\u5458',
  user: '\u7528\u6237',
  coins: '\u91d1\u5e01',
  backToWorkbench: '\u8fd4\u56de\u5de5\u4f5c\u53f0',
};

const accountSections: Array<{ key: AccountSection; label: string; description: string }> = [
  { key: 'orders', label: '\u8ba2\u5355\u7ba1\u7406', description: '\u67e5\u770b\u5957\u9910\u8ba2\u8d2d\u3001\u5f00\u7968\u4e0e\u8ba2\u5355\u72b6\u6001\u3002' },
  { key: 'usage', label: '\u6d88\u8017\u8bb0\u5f55', description: '\u67e5\u770b\u521b\u4f5c\u79ef\u5206\u4e0e\u8d44\u4ea7\u751f\u6210\u7684\u6d88\u8017\u660e\u7ec6\u3002' },
  { key: 'profile', label: '\u4e2a\u4eba\u4fe1\u606f', description: '\u7ba1\u7406\u8d26\u6237\u57fa\u7840\u8d44\u6599\u4e0e\u767b\u5f55\u5b89\u5168\u3002' },
  { key: 'team', label: '\u56e2\u961f\u7ba1\u7406', description: '\u7ba1\u7406\u56e2\u961f\u6210\u5458\u3001\u89d2\u8272\u4e0e\u534f\u4f5c\u6743\u9650\u3002' },
  { key: 'feedback', label: '\u53cd\u9988\u5efa\u8bae', description: '\u5411\u4ea7\u54c1\u56e2\u961f\u63d0\u4ea4\u95ee\u9898\u548c\u4f7f\u7528\u5efa\u8bae\u3002' },
];

function readProfileDraft(): ProfileDraft {
  try {
    const stored = localStorage.getItem(PROFILE_DRAFT_KEY);
    return stored ? JSON.parse(stored) as ProfileDraft : {};
  } catch {
    return {};
  }
}

function formatCredits(user?: CurrentUser): string {
  const availableCents = user?.wallet?.available_cents;
  if (typeof availableCents !== 'number') return '10,000';
  return new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(availableCents / 100);
}

function formatMembership(user?: CurrentUser): string {
  const value = user?.membership_level?.trim();
  if (!value) return TEXT.enterpriseMember;
  const labels: Record<string, string> = {
    enterprise: TEXT.enterpriseMember,
    flagship: TEXT.flagshipMember,
    premium: TEXT.premiumMember,
    standard: TEXT.standardMember,
  };
  return labels[value.toLowerCase()] || value;
}

function initials(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return TEXT.user;
  return Array.from(trimmed).slice(0, 2).join('');
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUserQuery = useQuery({ queryKey: ['current-user'], queryFn: fetchCurrentUser, retry: false });
  const user = currentUserQuery.data;
  const section: AccountSection = 'profile';
  const currentSection = accountSections[2];
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuNotice, setMenuNotice] = useState('');
  const [editingField, setEditingField] = useState<EditableField>(null);
  const [showPasswordState, setShowPasswordState] = useState(false);
  const [confirmLogoutOpen, setConfirmLogoutOpen] = useState(false);
  const [draft, setDraft] = useState<ProfileDraft>(() => readProfileDraft());
  const [formValues, setFormValues] = useState({ displayName: '', username: '' });

  useEffect(() => {
    if (!user) return;
    setFormValues({
      displayName: draft.displayName ?? user.display_name ?? user.username,
      username: draft.username ?? user.username,
    });
  }, [draft.displayName, draft.username, user]);

  const profile = useMemo(() => ({
    displayName: formValues.displayName || user?.display_name || user?.username || TEXT.user,
    username: formValues.username || user?.username || '\u2014',
  }), [formValues.displayName, formValues.username, user?.display_name, user?.username]);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      localStorage.removeItem('platform_username');
      localStorage.removeItem(PROFILE_DRAFT_KEY);
      queryClient.setQueryData(['current-user'], null);
      navigate('/', { replace: true });
    },
  });

  const selectSection = (nextSection: AccountSection) => {
    setMenuOpen(false);
    if (nextSection === 'profile') {
      navigate('/profile');
      return;
    }
    const item = accountSections.find((candidate) => candidate.key === nextSection);
    setMenuNotice(`${item?.label ?? ''}\u529f\u80fd\u6682\u672a\u5f00\u653e`);
  };

  const cancelEdit = () => {
    const restoredDraft = readProfileDraft();
    setDraft(restoredDraft);
    setFormValues({
      displayName: restoredDraft.displayName ?? user?.display_name ?? user?.username ?? TEXT.user,
      username: restoredDraft.username ?? user?.username ?? '\u2014',
    });
    setEditingField(null);
  };

  const saveEdit = () => {
    const nextDraft: ProfileDraft = {
      displayName: formValues.displayName.trim() || user?.display_name || user?.username || TEXT.user,
      username: formValues.username.trim() || user?.username || '\u2014',
    };
    localStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(nextDraft));
    setDraft(nextDraft);
    setEditingField(null);
  };

  const renderEditableValue = (field: Exclude<EditableField, null>, value: string, ariaLabel: string) => {
    if (editingField === field) {
      return (
        <div className="profile-field-editor">
          <input
            autoFocus
            value={field === 'displayName' ? formValues.displayName : formValues.username}
            onChange={(event) => setFormValues((current) => ({ ...current, [field]: event.target.value }))}
            onKeyDown={(event) => {
              if (event.key === 'Enter') saveEdit();
              if (event.key === 'Escape') cancelEdit();
            }}
            aria-label={ariaLabel}
          />
          <button type="button" className="profile-icon-button is-confirm" onClick={saveEdit} aria-label={TEXT.saveEdit} title={TEXT.saveEdit}><Check size={16} /></button>
          <button type="button" className="profile-icon-button" onClick={cancelEdit} aria-label={TEXT.cancelEdit} title={TEXT.cancelEdit}><X size={16} /></button>
        </div>
      );
    }
    return (
      <div className="profile-value-action">
        <strong>{value}</strong>
        <button type="button" className="profile-icon-button" onClick={() => setEditingField(field)} aria-label={`${TEXT.edit}${ariaLabel}`} title={`${TEXT.edit}${ariaLabel}`}><Pencil size={15} /></button>
      </div>
    );
  };

  return (
    <main className="account-route-page" aria-label={TEXT.accountCenter}>
      <div className="account-route-backdrop" />
      <button type="button" className="account-back-button" onClick={() => navigate('/')} aria-label={TEXT.backToWorkbench} title={TEXT.backToWorkbench}><ArrowLeft size={18} /><span>{TEXT.backToWorkbench}</span></button>
      <div className="account-statusbar" aria-label="account status">
        <div className="account-credit-pill"><Coins size={15} /><strong>{formatCredits(user)}</strong><span>{TEXT.coins}</span></div>
        <div className="account-membership-pill"><Crown size={15} /><span>{formatMembership(user)}</span></div>
        <button type="button" className="account-avatar-button" onClick={() => selectSection('profile')} title={TEXT.nickname} aria-label={TEXT.nickname}>{initials(profile.displayName)}</button>
      </div>

      <section className="account-profile-card" aria-labelledby="account-card-title">
        <header className="account-profile-header">
          <div>
            <span className="account-eyebrow">ACCOUNT CENTER</span>
            <h1 id="account-card-title">{currentSection.label}</h1>
            <p>{currentSection.description}</p>
          </div>
          <div className="account-menu-wrap">
            <button type="button" className={`account-menu-trigger ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="account-route-menu" aria-label={TEXT.openMenu} title={TEXT.openMenu}><Menu size={21} /></button>
            {menuOpen && <nav id="account-route-menu" className="account-route-menu" aria-label={TEXT.openMenu}>
              {accountSections.map((item) => <button key={item.key} type="button" className={item.key === section ? 'is-active' : ''} onClick={() => selectSection(item.key)}><span>{item.label}</span>{item.key === section && <Check size={15} />}</button>)}
            </nav>}
            {menuNotice && <p className="account-route-menu-notice">{menuNotice}</p>}
          </div>
        </header>

        {section === 'profile' ? (
          <div className="profile-card-content">
            <div className="profile-avatar-block">
              <div className="profile-avatar" aria-label={`${profile.displayName} avatar`}>{initials(profile.displayName)}</div>
              <div><h2>{profile.displayName}</h2><p><ShieldCheck size={14} /> {TEXT.verified}</p></div>
            </div>
            <div className="profile-info-list">
              <div className="profile-info-row"><span className="profile-info-label"><UserRound size={16} />{TEXT.nickname}</span>{renderEditableValue('displayName', profile.displayName, TEXT.nickname)}</div>
              <div className="profile-info-row"><span className="profile-info-label"><CircleUserRound size={16} />{TEXT.account}</span>{renderEditableValue('username', profile.username, TEXT.account)}</div>
              <div className="profile-info-row">
                <span className="profile-info-label"><LockKeyhole size={16} />{TEXT.password}</span>
                <div className="profile-value-action">
                  <strong className={showPasswordState ? 'profile-password-note' : ''}>{showPasswordState ? TEXT.passwordHidden : '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}</strong>
                  <button type="button" className="profile-icon-button" onClick={() => setShowPasswordState((visible) => !visible)} aria-label={showPasswordState ? TEXT.hidePasswordHint : TEXT.showPasswordHint} title={showPasswordState ? TEXT.hidePasswordHint : TEXT.showPasswordHint}>{showPasswordState ? <EyeOff size={17} /> : <Eye size={17} />}</button>
                </div>
              </div>
              <div className="profile-info-row"><span className="profile-info-label"><Phone size={16} />{TEXT.phone}</span><div className="profile-value-action"><strong>{TEXT.unbound}</strong></div></div>
            </div>
            <p className="profile-storage-notice">{TEXT.browserStorage}</p>
            <footer className="profile-card-footer"><button type="button" className="profile-logout-button" onClick={() => setConfirmLogoutOpen(true)}><LogOut size={17} />{TEXT.logout}</button></footer>
          </div>
        ) : (
          <div className="account-coming-soon">
            <div><ShieldCheck size={24} /></div>
            <h2>{`${currentSection.label}\u6b63\u5728\u51c6\u5907\u4e2d`}</h2>
            <p>{'\u8d26\u6237\u4e2d\u5fc3\u7684\u5bfc\u822a\u4e0e\u8def\u7531\u5df2\u5c31\u7eea\uff1b\u8be5\u6a21\u5757\u5c06\u5728\u540e\u7eed\u8fed\u4ee3\u63a5\u5165\u771f\u5b9e\u6570\u636e\u3002'}</p>
            <button type="button" className="profile-return-button" onClick={() => selectSection('profile')}>{'\u8fd4\u56de\u4e2a\u4eba\u4fe1\u606f'}</button>
          </div>
        )}
      </section>

      {confirmLogoutOpen && <div className="profile-confirm-layer" role="presentation">
        <section className="profile-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="profile-logout-title">
          <div className="profile-confirm-icon"><LogOut size={22} /></div>
          <h2 id="profile-logout-title">{TEXT.logoutConfirm}</h2>
          <p>{TEXT.logoutCopy}</p>
          {logoutMutation.error instanceof Error && <p className="profile-confirm-error">{logoutMutation.error.message}</p>}
          <div className="profile-confirm-actions"><button type="button" onClick={() => setConfirmLogoutOpen(false)} disabled={logoutMutation.isPending}>{TEXT.cancel}</button><button type="button" className="is-danger" onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>{logoutMutation.isPending ? TEXT.loggingOut : TEXT.confirmLogout}</button></div>
        </section>
      </div>}
    </main>
  );
}
