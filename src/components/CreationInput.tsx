import { useState } from 'react';
import { Plus, Sparkles, Zap, Wand2, Palette, Film, Bot } from 'lucide-react';

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

const optionConfig = [
  { key: 'type', icon: Film, color: 'var(--accent-primary)' },
  { key: 'style', icon: Palette, color: 'var(--accent-secondary)' },
  { key: 'format', icon: Zap, color: 'var(--accent-tertiary)' },
  { key: 'model', icon: Bot, color: 'var(--color-info)' },
] as const;

export default function CreationInput({
  defaultValue = '',
  options = DEFAULT_OPTIONS,
  containerClassName = 'mb-6 lg:mb-8',
}: CreationInputProps) {
  const [inputText, setInputText] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);

  const optionList = [
    { key: 'type', label: options.type },
    { key: 'style', label: options.style },
    { key: 'format', label: options.format },
    { key: 'model', label: options.model },
  ];

  return (
    <div className={`glass-panel p-4 lg:p-6 ${containerClassName} animate-fade-in relative overflow-hidden group`}>
      {/* 聚焦时辉光效果 */}
      <div className={`
        absolute inset-0 pointer-events-none transition-opacity duration-500
        ${isFocused ? 'opacity-100' : 'opacity-0'}
      `}
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, rgba(59,164,255,0.1) 0%, transparent 60%)'
      }}
      />

      {/* Input Row */}
      <div className="flex items-start gap-3 lg:gap-4 mb-4 lg:mb-5 relative">
        {/* Upload Button */}
        <button className="focus-ring w-10 h-10 lg:w-14 lg:h-14 rounded-xl bg-[var(--bg-input)] border border-[var(--border-default)] flex items-center justify-center text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] hover:bg-[var(--accent-primary-bg)] transition-all duration-300 flex-shrink-0 group/upload relative overflow-hidden">
          <Plus size={20} className="lg:w-6 lg:h-6 relative z-10 transition-transform duration-300 group-hover/upload:rotate-90" />
          <span className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/10 to-transparent opacity-0 group-hover/upload:opacity-100 transition-opacity" />
        </button>

        {/* Text Input */}
        <div className="flex-1 relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="focus-ring w-full h-10 lg:h-14 min-h-[40px] lg:min-h-[56px] bg-transparent text-[var(--text-primary)] text-sm lg:text-base resize-none outline-none caret-[var(--accent-primary)] placeholder:text-[var(--text-muted)] transition-all duration-300 py-2"
            placeholder="描述你想创作的内容..."
          />
          {/* 底部动态线 */}
          <div className={`
            absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]
            transition-all duration-500 ease-out
            ${isFocused ? 'w-full opacity-100' : 'w-0 opacity-0'}
          `} />
        </div>
      </div>

      {/* Options Row */}
      <div className="flex flex-wrap items-center gap-2 lg:gap-3 relative">
        {optionList.map((opt) => {
          const config = optionConfig.find(c => c.key === opt.key);
          const Icon = config?.icon || Wand2;
          return (
            <button
              key={opt.key}
              className="focus-ring h-8 lg:h-10 px-3 lg:px-4 rounded-lg bg-transparent border border-[var(--border-default)] text-[var(--text-secondary)] text-xs lg:text-sm font-medium hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)] hover:bg-[var(--accent-primary-bg)] transition-all duration-300 whitespace-nowrap flex items-center gap-2 group/opt"
            >
              <Icon
                size={14}
                className="transition-all duration-300"
                style={{ color: config?.color }}
              />
              <span>{opt.label}</span>
            </button>
          );
        })}

        <div className="flex-1 min-w-[20px]" />

        {/* Generate Button - 主操作 */}
        <button className="focus-ring relative overflow-hidden h-9 lg:h-11 px-5 lg:px-7 rounded-lg bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary-dim)] text-white text-sm lg:text-base font-semibold flex items-center gap-2 hover:shadow-xl hover:shadow-[var(--accent-primary)]/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 whitespace-nowrap group/generate">
          {/* 背景动画 */}
          <span className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary-dim)] via-[var(--accent-primary)] to-[var(--accent-primary-dim)] opacity-0 group-hover/generate:opacity-100 transition-opacity duration-500" />

          {/* 闪烁星星 */}
          <Sparkles size={16} className="relative z-10 animate-pulse" />
          <span className="relative z-10">AI 生成</span>

          {/* 高光扫过 */}
          <span
            className="absolute inset-0 -translate-x-full group-hover/generate:translate-x-full transition-transform duration-700 ease-out"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              transform: 'skewX(-20deg) translateX(-100%)'
            }}
          />

          {/* 底部辉光 */}
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-[var(--accent-primary)] blur-xl opacity-30" />
        </button>
      </div>

      {/* 快捷提示 */}
      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center gap-4 text-xs text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-success)]" />
          AI 已就绪
        </span>
        <span className="hidden sm:inline">提示: 按 Enter 发送，Shift+Enter 换行</span>
      </div>
    </div>
  );
}