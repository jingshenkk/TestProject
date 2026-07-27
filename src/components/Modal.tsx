import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
  zIndex?: string;
  closeOnBackdropClick?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  ariaLabel?: string;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * 统一模态框外壳：ESC 关闭、焦点陷阱、打开聚焦 / 关闭归还焦点、`role="dialog" aria-modal`。
 * 内容由 `children` 注入；初始聚焦元素可通过 `initialFocusRef` 指定，默认聚焦首个可交互元素。
 */
export default function Modal({
  isOpen,
  onClose,
  children,
  panelClassName,
  zIndex = 'z-50',
  closeOnBackdropClick = true,
  initialFocusRef,
  ariaLabel,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    document.addEventListener('keydown', handleKeyDown);

    const raf = requestAnimationFrame(() => {
      const target = initialFocusRef?.current ?? panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      target?.focus();
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(raf);
      previouslyFocused.current?.focus();
    };
  }, [isOpen, onClose, initialFocusRef]);

  if (!isOpen) return null;

  // 通过 Portal 渲染到 document.body，脱离父级 glass-panel 的
  // backdrop-filter / overflow-hidden 造成 fixed 定位被“困”在父容器内的副作用，
  // 使弹层在视口内居中并完整呈现（不再被裁剪到输入框区域）。
  return createPortal(
    <div
      className={`fixed inset-0 ${zIndex} flex items-center justify-center bg-black/60 backdrop-blur-lg transition-all duration-300 animate-fade-in`}
      style={{ animationDuration: '0.2s' }}
      onClick={(e) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) onClose();
      }}
    >
      {/* 背景辉光 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[var(--accent-primary)]/10 rounded-full blur-3xl" />
      </div>

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={`${panelClassName} relative animate-spring my-auto mx-auto`}
        style={{ animationDuration: '0.3s', maxHeight: 'calc(100vh - 40px)', marginTop: 'auto', marginBottom: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}