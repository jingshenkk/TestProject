import { Edit3 } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

interface StoryboardTopBarProps {
  title?: string;
  subtitle?: string;
}

export default function StoryboardTopBar({
  title = '三体2 终极之战',
  subtitle = '分镜创作',
}: StoryboardTopBarProps) {
  return (
    <AppHeader
      title={title}
      subtitle={subtitle}
      extraLeft={
        <button className="w-7 h-7 rounded flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors">
          <Edit3 size={14} />
        </button>
      }
    />
  );
}