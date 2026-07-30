import { Sparkles } from 'lucide-react';
import AppHeader from '@/components/AppHeader';

interface StoryboardTopBarProps {
  title?: string;
  subtitle?: string;
  onGenerate?: () => void;
  isGenerating?: boolean;
}

export default function StoryboardTopBar({ title = '分镜创作', subtitle = 'Storyboard Workspace', onGenerate, isGenerating = false }: StoryboardTopBarProps) {
  return <AppHeader title={title} subtitle={subtitle} extraRight={onGenerate ? <button type="button" onClick={onGenerate} disabled={isGenerating} className="btn btn-primary btn-sm whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-55"><Sparkles size={14} />{isGenerating ? '生成中…' : '生成分镜'}</button> : undefined} />;
}
