import { Inbox } from 'lucide-react';

interface EmptyStoryboardProps {
  onCreate?: () => void;
}

export default function EmptyStoryboard({ onCreate }: EmptyStoryboardProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      {/* Empty Icon */}
      <div className="w-32 h-32 mb-6 text-[var(--text-muted)] opacity-50">
        <Inbox size={128} strokeWidth={1} />
      </div>

      {/* Message */}
      <p className="text-lg text-[var(--text-secondary)] mb-6">
        该集暂未生产剧本，请先创建剧本！
      </p>

      {/* Create Button */}
      <button
        onClick={onCreate}
        className="h-11 px-8 rounded-xl bg-[var(--accent-primary)] text-white text-sm font-medium
          hover:bg-[var(--accent-primary)]/90 active:scale-95
          transition-all duration-200 shadow-lg shadow-[var(--accent-primary)]/20"
      >
        智能创建
      </button>
    </div>
  );
}
