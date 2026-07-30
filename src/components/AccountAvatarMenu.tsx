import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type AccountMenuKey = 'orders' | 'usage' | 'profile' | 'team' | 'feedback';

interface AccountAvatarMenuProps {
  buttonClassName: string;
  children: ReactNode;
}

const menuItems: Array<{ key: AccountMenuKey; label: string }> = [
  { key: 'orders', label: '\u8ba2\u5355\u7ba1\u7406' },
  { key: 'usage', label: '\u6d88\u8017\u8bb0\u5f55' },
  { key: 'profile', label: '\u4e2a\u4eba\u4fe1\u606f' },
  { key: 'team', label: '\u56e2\u961f\u7ba1\u7406' },
  { key: 'feedback', label: '\u53cd\u9988\u5efa\u8bae' },
];

export default function AccountAvatarMenu({ buttonClassName, children }: AccountAvatarMenuProps) {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const handleSelect = (key: AccountMenuKey) => {
    if (key === 'profile') {
      setOpen(false);
      navigate('/profile');
      return;
    }
    const item = menuItems.find((candidate) => candidate.key === key);
    setNotice(`${item?.label ?? ''}\u529f\u80fd\u6682\u672a\u5f00\u653e`);
  };

  return (
    <div className="avatar-account-menu-wrap" ref={wrapperRef}>
      <button
        type="button"
        className={buttonClassName}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="\u6253\u5f00\u8d26\u6237\u83dc\u5355"
        title="\u8d26\u6237\u83dc\u5355"
      >
        {children}
      </button>
      {open && (
        <div className="avatar-account-menu" role="menu" aria-label="\u8d26\u6237\u83dc\u5355">
          <div className="avatar-account-menu-title">ACCOUNT</div>
          {menuItems.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              className={item.key === 'profile' ? 'is-profile' : ''}
              onClick={() => handleSelect(item.key)}
            >
              <span>{item.label}</span>
              {item.key === 'profile' ? <Check size={15} /> : <ChevronRight size={15} />}
            </button>
          ))}
          <p className="avatar-account-menu-note">{notice || '\u4e2a\u4eba\u4fe1\u606f\u5df2\u63a5\u5165'}</p>
        </div>
      )}
    </div>
  );
}
