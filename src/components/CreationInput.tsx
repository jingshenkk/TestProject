import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';

export interface CreationInputOptions {
  type: string;
  style: string;
  format: string;
  model: string;
}

interface CreationInputProps {
  defaultValue?: string;
  options?: CreationInputOptions;
  containerClassName?: string;
}

const DEFAULT_OPTIONS: CreationInputOptions = {
  type: '短剧-神话故事',
  style: '视觉风格',
  format: '竖屏 (9:16) 12集 · 120s',
  model: 'Chatgpt',
};

export default function CreationInput({
  defaultValue = '',
  options = DEFAULT_OPTIONS,
  containerClassName = 'mb-6 lg:mb-8',
}: CreationInputProps) {
  const [inputText, setInputText] = useState(defaultValue);

  const optionList = [
    { key: 'type', label: options.type },
    { key: 'style', label: options.style },
    { key: 'format', label: options.format },
    { key: 'model', label: options.model },
  ];

  return (
    <div className={`glass-panel p-4 lg:p-6 ${containerClassName} animate-fade-in`}>
      {/* Input Row */}
      <div className="flex items-start gap-3 lg:gap-4 mb-4 lg:mb-5">
        {/* Upload Button */}
        <button className="w-10 h-10 lg:w-14 lg:h-14 rounded-lg lg:rounded-xl bg-[var(--bg-input)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-all duration-200 flex-shrink-0">
          <Plus size={20} className="lg:w-6 lg:h-6" />
        </button>

        {/* Text Input */}
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 h-10 lg:h-14 min-h-[40px] lg:min-h-[56px] bg-transparent text-[var(--text-primary)] text-sm lg:text-base resize-none outline-none placeholder:text-[var(--text-muted)]"
          placeholder="描述你想创作的内容..."
        />
      </div>

      {/* Options Row */}
      <div className="flex flex-wrap items-center gap-2 lg:gap-3">
        {optionList.map((opt) => (
          <button
            key={opt.key}
            className="h-7 lg:h-9 px-2 lg:px-4 rounded-md lg:rounded-lg bg-[var(--accent-primary)] text-white text-xs lg:text-sm font-medium hover:bg-[var(--accent-primary-dim)] transition-colors duration-200 whitespace-nowrap"
          >
            {opt.label}
          </button>
        ))}

        <div className="flex-1 min-w-[20px]" />

        {/* Generate Button */}
        <button className="h-7 lg:h-9 px-4 lg:px-6 rounded-md lg:rounded-lg bg-[var(--accent-primary)] text-white text-xs lg:text-sm font-medium flex items-center gap-1.5 lg:gap-2 hover:bg-[var(--accent-primary-dim)] transition-all duration-200 shadow-lg shadow-[var(--accent-primary-glow)] whitespace-nowrap">
          <Sparkles size={14} className="lg:w-4 lg:h-4" />
          生成
        </button>
      </div>
    </div>
  );
}