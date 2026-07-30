import { useState } from 'react';
import { Gem } from 'lucide-react';
import type { Prop } from '@/types/asset';
import AssetDetailLayout, { type AssetSwitchItem } from '@/components/AssetDetailLayout';

interface PropDetails {
  intro: string;
  relatedShots: string[];
  usage: string;
  fields: {
    name: string;
    type: string;
    period: string;
    material: string;
    size: string;
    color: string;
    owner: string;
    importance: string;
    description: string;
  };
  images: {
    id: string;
    name: string;
    hasImage: boolean;
  }[];
  versions: {
    id: string;
    name: string;
    isCurrent: boolean;
  }[];
}

interface PropAssetDetailProps {
  asset: Prop;
  switchList: AssetSwitchItem[];
  selectedSwitchId: string;
  onSelectSwitchId: (id: string) => void;
  onBack?: () => void;
}

const defaultDetails: PropDetails = {
  intro: '这是一把重要的道具，在多个场景中出现。道具设计需要精致且富有个性，能够体现主人的身份地位。',
  relatedShots: ['E01_S01', 'E02_S03', 'E03_S05'],
  usage: '主角随身佩戴的饰品，象征身份与地位。\n\n主要用途：\n- 装饰用途：佩戴于腰间\n- 剧情道具：多次作为剧情触发点使用\n- 特写镜头：需要在多个分镜中展示细节',
  fields: {
    name: '白玉步摇',
    type: '饰品',
    period: '古代',
    material: '白玉/金丝',
    size: '长约15cm',
    color: '乳白色/金色',
    owner: '湘夫人',
    importance: '重要',
    description: '步摇顶部雕刻祥云纹饰，下垂三缕金丝流苏，行走时轻盈摇曳',
  },
  images: [
    { id: '1', name: '三视图', hasImage: true },
    { id: '2', name: '细节特写', hasImage: true },
    { id: '3', name: '佩戴效果', hasImage: false },
  ],
  versions: [
    { id: 'v1', name: 'V01', isCurrent: true },
    { id: 'v2', name: 'V02', isCurrent: false },
    { id: 'v3', name: 'V03', isCurrent: false },
    { id: 'v4', name: 'V04', isCurrent: false },
  ],
};

export default function PropAssetDetail({ asset, switchList, selectedSwitchId, onSelectSwitchId, onBack }: PropAssetDetailProps) {
  const details = defaultDetails;
  const [selectedImageId, setSelectedImageId] = useState(details.images[0]?.id || '1');
  const [selectedVersionId, setSelectedVersionId] = useState('v1');
  const [showAllRelatedShots, setShowAllRelatedShots] = useState(false);

  const preview = (
    <div className="grid grid-cols-3 gap-3 h-full">
      {['正面', '侧面', '背面'].map((view) => (
        <div key={view} className="bg-white rounded-lg border border-[var(--border-subtle)] flex items-center justify-center overflow-hidden">
          <div className="text-center">
            <div className="w-14 h-14 mx-auto mb-2 rounded-full bg-[var(--bg-input)] flex items-center justify-center">
              <Gem size={28} className="text-[var(--text-muted)]" />
            </div>
            <span className="block text-xs text-[var(--text-muted)] mt-2">{view}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const rightPanel = (
    <>
      {/* Prop Intro */}
      <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-subtle)]">
        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">道具简介</h4>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{details.intro}</p>
      </div>

      {/* Usage Info */}
      <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-subtle)]">
        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">用途说明</h4>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">{details.usage}</p>
      </div>

      {/* Related Shots */}
      <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">关联分镜</h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-input)] text-[var(--text-muted)]">{details.relatedShots.length}</span>
          </div>
          {details.relatedShots.length > 8 && <button type="button" onClick={() => setShowAllRelatedShots((value) => !value)} aria-expanded={showAllRelatedShots} className="rounded-md px-2 py-1 text-xs font-medium text-[var(--accent-primary)] hover:bg-[var(--accent-primary-bg)]">{showAllRelatedShots ? '收起分镜' : '展开全部'}</button>}
        </div>
        <div className="flex flex-wrap gap-2">
          {details.relatedShots.slice(0, showAllRelatedShots ? undefined : 8).map((shot) => (
            <span key={shot} className="px-2 py-1 rounded bg-[var(--bg-input)] text-xs text-[var(--text-secondary)] border border-[var(--border-subtle)]">
              {shot}
            </span>
          ))}
        </div>
      </div>

      {/* Structured Fields */}
      <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-subtle)] flex-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">图像结构化字段</h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-input)] text-[var(--text-muted)]">8</span>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { label: '道具名称', value: details.fields.name },
            { label: '道具类型', value: details.fields.type },
            { label: '时代背景', value: details.fields.period },
            { label: '材质', value: details.fields.material },
            { label: '尺寸', value: details.fields.size },
            { label: '颜色', value: details.fields.color },
            { label: '所属角色', value: details.fields.owner },
            { label: '重要性', value: details.fields.importance },
          ].map((field) => (
            <div key={field.label} className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)] last:border-0">
              <span className="text-xs text-[var(--text-muted)]">{field.label}</span>
              <span className="text-xs text-[var(--text-primary)] font-medium">{field.value}</span>
            </div>
          ))}
          <div className="pt-2">
            <span className="text-xs text-[var(--text-muted)] block mb-1">详细描述</span>
            <p className="text-xs text-[var(--text-primary)] leading-relaxed bg-[var(--bg-input)] rounded-lg p-2 border border-[var(--border-subtle)]">
              {details.fields.description}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <AssetDetailLayout
      title="道具详情"
      asset={asset}
      switchList={switchList}
      selectedSwitchId={selectedSwitchId}
      onSelectSwitchId={onSelectSwitchId}
      images={details.images}
      selectedImageId={selectedImageId}
      onSelectImageId={setSelectedImageId}
      versions={details.versions}
      selectedVersionId={selectedVersionId}
      onSelectVersionId={setSelectedVersionId}
      preview={preview}
      rightPanel={rightPanel}
      onBack={onBack}
    />
  );
}