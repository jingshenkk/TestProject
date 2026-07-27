import { useState } from 'react';
import { Plus, Sparkles, Zap, Wand2, Palette, Film, Bot, X, Check } from 'lucide-react';
import Modal from './Modal';
import {
  CONTENT_TYPE_OPTIONS,
  VISUAL_STYLE_OPTIONS,
  ASPECT_RATIO_OPTIONS,
  FORMAT_PRESETS,
  AI_MODEL_OPTIONS,
  type ContentTypeOption,
  type VisualStyleOption,
  type FormatPreset,
  type AIModelOption,
} from '@/lib/creationOptions';

export interface CreationInputOptions {
  type: string;
  typeKey: string;
  style: string;
  styleKey: string;
  format: string;
  aspectRatio: string;
  episodeCount: number;
  duration: number;
  model: string;
  modelKey: string;
}

interface CreationInputProps {
  defaultValue?: string;
  options?: CreationInputOptions;
  containerClassName?: string;
  onGenerate?: (options: CreationInputOptions, prompt: string) => void;
  isGenerating?: boolean;
}

const DEFAULT_OPTIONS: CreationInputOptions = {
  type: 'AI短剧',
  typeKey: 'ai_short_drama',
  style: '电影感写实',
  styleKey: 'cinematic_realism',
  format: '竖屏 (9:16) 12集 · 120s',
  aspectRatio: '9:16',
  episodeCount: 12,
  duration: 120,
  model: 'Claude 4.8',
  modelKey: 'claude',
};

const optionConfig = [
  { key: 'type', icon: Film, color: 'var(--accent-primary)', label: '内容类型' },
  { key: 'style', icon: Palette, color: 'var(--accent-secondary)', label: '视觉风格' },
  { key: 'format', icon: Zap, color: 'var(--accent-tertiary)', label: '规格配置' },
  { key: 'model', icon: Bot, color: 'var(--color-info)', label: 'AI模型' },
] as const;

export default function CreationInput({
  defaultValue = '',
  options: propOptions,
  containerClassName = 'mb-6 lg:mb-8',
  onGenerate,
  isGenerating = false,
}: CreationInputProps) {
  const [inputText, setInputText] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);

  // 选项状态
  const [options, setOptions] = useState<CreationInputOptions>(propOptions || DEFAULT_OPTIONS);

  // 弹窗状态
  const [activeModal, setActiveModal] = useState<'type' | 'style' | 'format' | 'model' | null>(null);

  // 临时状态（用于弹窗内编辑）
  const [tempFormat, setTempFormat] = useState({
    aspectRatio: options.aspectRatio,
    episodeCount: options.episodeCount,
    duration: options.duration,
  });

  // 类型选择分类
  const openModal = (modal: typeof activeModal) => {
    setActiveModal(modal);
    if (modal === 'format') {
      setTempFormat({
        aspectRatio: options.aspectRatio,
        episodeCount: options.episodeCount,
        duration: options.duration,
      });
    }
  };

  // 关闭弹窗
  const closeModal = () => setActiveModal(null);

  // 选择内容类型
  const selectContentType = (type: ContentTypeOption) => {
    setOptions(prev => ({
      ...prev,
      type: type.label,
      typeKey: type.key,
      // 同步更新相关默认配置
      aspectRatio: type.defaultAspectRatio,
      episodeCount: type.defaultEpisodeCount,
      duration: type.defaultDuration,
      style: type.defaultVisualStyle,
      styleKey: VISUAL_STYLE_OPTIONS.find(s => s.label === type.defaultVisualStyle)?.key || prev.styleKey,
    }));
    closeModal();
  };

  // 选择视觉风格
  const selectVisualStyle = (style: VisualStyleOption) => {
    setOptions(prev => ({
      ...prev,
      style: style.label,
      styleKey: style.key,
    }));
    closeModal();
  };

  // 选择格式预设
  const selectFormatPreset = (preset: FormatPreset) => {
    setOptions(prev => ({
      ...prev,
      format: preset.label,
      aspectRatio: preset.aspectRatio,
      episodeCount: preset.episodeCount,
      duration: preset.duration,
    }));
    closeModal();
  };

  // 应用自定义格式
  const applyCustomFormat = () => {
    const aspectLabel = ASPECT_RATIO_OPTIONS.find(a => a.value === tempFormat.aspectRatio)?.label || tempFormat.aspectRatio;
    setOptions(prev => ({
      ...prev,
      format: `${aspectLabel} ${tempFormat.aspectRatio} ${tempFormat.episodeCount}集 · ${tempFormat.duration}s`,
      aspectRatio: tempFormat.aspectRatio,
      episodeCount: tempFormat.episodeCount,
      duration: tempFormat.duration,
    }));
    closeModal();
  };

  // 选择AI模型
  const selectAIModel = (model: AIModelOption) => {
    setOptions(prev => ({
      ...prev,
      model: model.label,
      modelKey: model.key,
    }));
    closeModal();
  };

  // 处理生成
  const handleGenerate = () => {
    onGenerate?.(options, inputText);
  };

  const optionList = [
    { key: 'type' as const, label: options.type },
    { key: 'style' as const, label: options.style },
    { key: 'format' as const, label: options.format },
    { key: 'model' as const, label: options.model },
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
              onClick={() => openModal(opt.key)}
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
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="focus-ring relative overflow-hidden h-9 lg:h-11 px-5 lg:px-7 rounded-lg bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary-dim)] text-white text-sm lg:text-base font-semibold flex items-center gap-2 hover:shadow-xl hover:shadow-[var(--accent-primary)]/30 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300 whitespace-nowrap group/generate"
        >
          {/* 背景动画 */}
          <span className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary-dim)] via-[var(--accent-primary)] to-[var(--accent-primary-dim)] opacity-0 group-hover/generate:opacity-100 transition-opacity duration-500" />

          {/* 闪烁星星 */}
          <Sparkles size={16} className="relative z-10 animate-pulse" />
          <span className="relative z-10">{isGenerating ? '生成中...' : 'AI 生成'}</span>

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

      {/* ========== 1. 内容类型选择弹窗 ========== */}
      <Modal isOpen={activeModal === 'type'} onClose={closeModal} panelClassName="w-[95vw] max-w-6xl max-h-[80vh] bg-[var(--bg-surface)] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* 顶部区域 */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">选择内容类型</h3>
              <p className="text-xs text-[var(--text-muted)]">选择最适合你创作需求的内容品类</p>
            </div>
            <button
              onClick={closeModal}
              className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        {/* 内容区 - 可滚动 */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
            {CONTENT_TYPE_OPTIONS.map((type) => (
              <button
                key={type.key}
                onClick={() => selectContentType(type)}
                className={`p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer bg-[var(--bg-surface)] ${
                  options.typeKey === type.key
                    ? 'border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]/30'
                    : 'border-[var(--border-default)] hover:border-[var(--accent-primary)]/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm text-[var(--text-primary)] truncate">{type.label}</span>
                  {options.typeKey === type.key && <Check size={14} className="text-[var(--accent-primary)] flex-shrink-0 ml-1" />}
                </div>
                <div className="text-[10px] text-[var(--text-muted)] leading-tight">
                  <p>{type.defaultAspectRatio} · {type.defaultEpisodeCount}集</p>
                  <p className="text-[var(--accent-primary)]/60 truncate">{type.defaultVisualStyle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* ========== 2. 视觉风格选择弹窗 ========== */}
      <Modal isOpen={activeModal === 'style'} onClose={closeModal} panelClassName="w-[95vw] max-w-5xl max-h-[75vh] bg-[var(--bg-surface)] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* 顶部区域 */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">选择视觉风格</h3>
              <p className="text-xs text-[var(--text-muted)]">确定作品的视觉美学方向</p>
            </div>
            <button
              onClick={closeModal}
              className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        {/* 内容区 - 可滚动 */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            {VISUAL_STYLE_OPTIONS.map((style) => (
              <button
                key={style.key}
                onClick={() => selectVisualStyle(style)}
                className={`p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer bg-[var(--bg-surface)] ${
                  options.styleKey === style.key
                    ? 'border-[var(--accent-secondary)] ring-1 ring-[var(--accent-secondary)]/30'
                    : 'border-[var(--border-default)] hover:border-[var(--accent-secondary)]/50'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-medium text-sm text-[var(--text-primary)] truncate">{style.label}</span>
                  {options.styleKey === style.key && <Check size={14} className="text-[var(--accent-secondary)] flex-shrink-0 ml-1" />}
                </div>
                <p className="text-[10px] text-[var(--text-muted)] leading-tight line-clamp-2">{style.description}</p>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* ========== 3. 规格配置弹窗 ========== */}
      <Modal isOpen={activeModal === 'format'} onClose={closeModal} panelClassName="w-[95vw] max-w-4xl max-h-[75vh] bg-[var(--bg-surface)] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* 顶部区域 */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">配置规格参数</h3>
              <p className="text-xs text-[var(--text-muted)]">选择预设或自定义剧集规格</p>
            </div>
            <button
              onClick={closeModal}
              className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        {/* 内容区 - 可滚动 */}
        <div className="p-4 overflow-y-auto flex-1">
          {/* 两部分并排显示 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 左侧：快速预设 */}
            <div className="bg-[var(--bg-input)] rounded-lg p-4">
              <h4 className="text-xs font-medium text-[var(--text-secondary)] mb-3">快速预设</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {FORMAT_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => selectFormatPreset(preset)}
                    className={`p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer bg-[var(--bg-surface)] ${
                      options.format === preset.label
                        ? 'border-[var(--accent-tertiary)]'
                        : 'border-[var(--border-default)] hover:border-[var(--accent-tertiary)]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-[var(--text-primary)] truncate">{preset.label}</span>
                      {options.format === preset.label && <Check size={12} className="text-[var(--accent-tertiary)] flex-shrink-0 ml-1" />}
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5 truncate">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 右侧：自定义配置 */}
            <div className="bg-[var(--bg-input)] rounded-lg p-4">
              <h4 className="text-xs font-medium text-[var(--text-secondary)] mb-3">自定义配置</h4>
              <div className="space-y-4">
                {/* 画幅比例 */}
                <div>
                  <label className="text-xs font-medium text-[var(--text-primary)] mb-2 block">画面比例</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {ASPECT_RATIO_OPTIONS.map((ratio) => (
                      <button
                        key={ratio.value}
                        onClick={() => setTempFormat(prev => ({ ...prev, aspectRatio: ratio.value }))}
                        className={`py-2 px-2 rounded-lg border text-center transition-all duration-200 cursor-pointer bg-[var(--bg-surface)] ${
                          tempFormat.aspectRatio === ratio.value
                            ? 'border-[var(--accent-primary)]'
                            : 'border-[var(--border-default)] hover:border-[var(--border-subtle)]'
                        }`}
                      >
                        <span className="text-xs font-medium block text-[var(--text-primary)]">{ratio.value}</span>
                        <span className="text-[10px] text-[var(--text-muted)] truncate block">{ratio.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1.5 truncate">
                    {ASPECT_RATIO_OPTIONS.find(r => r.value === tempFormat.aspectRatio)?.usage}
                  </p>
                </div>

                {/* 集数和时长 并排 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--text-primary)] mb-2 block">集数</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={tempFormat.episodeCount}
                      onChange={(e) => setTempFormat(prev => ({ ...prev, episodeCount: Math.max(1, parseInt(e.target.value) || 1) }))}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:border-[var(--accent-primary)] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-primary)] mb-2 block">单集时长(秒)</label>
                    <input
                      type="number"
                      min={15}
                      max={3600}
                      step={10}
                      value={tempFormat.duration}
                      onChange={(e) => setTempFormat(prev => ({ ...prev, duration: Math.max(15, parseInt(e.target.value) || 15) }))}
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-sm focus:border-[var(--accent-primary)] focus:outline-none"
                    />
                  </div>
                </div>

                {/* 应用按钮 */}
                <button
                  onClick={applyCustomFormat}
                  className="w-full py-2.5 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Check size={14} />
                  应用自定义配置
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ========== 4. AI模型选择弹窗 ========== */}
      <Modal isOpen={activeModal === 'model'} onClose={closeModal} panelClassName="w-[95vw] max-w-3xl max-h-[60vh] bg-[var(--bg-surface)] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* 顶部区域 */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">选择AI模型</h3>
              <p className="text-xs text-[var(--text-muted)]">选择最适合创作的AI模型</p>
            </div>
            <button
              onClick={closeModal}
              className="p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        {/* 内容区 - 可滚动 */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AI_MODEL_OPTIONS.map((model) => (
              <button
                key={model.key}
                onClick={() => selectAIModel(model)}
                className={`p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer bg-[var(--bg-surface)] ${
                  options.modelKey === model.key
                    ? 'border-[var(--color-info)]'
                    : 'border-[var(--border-default)] hover:border-[var(--color-info)]/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-semibold text-sm text-[var(--text-primary)]">{model.label}</span>
                      {model.recommended && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-success)]/20 text-[var(--color-success)]">
                          推荐
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mb-1.5">{model.provider} · {model.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {model.features.slice(0, 3).map((feature) => (
                        <span key={feature} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-hover)] text-[var(--text-secondary)]">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  {options.modelKey === model.key && <Check size={16} className="text-[var(--color-info)] flex-shrink-0 ml-1.5" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}