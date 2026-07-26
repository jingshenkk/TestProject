import { useState } from 'react';
import { Building2 } from 'lucide-react';
import type { Scene } from '@/types/asset';
import AssetDetailLayout, { type AssetSwitchItem } from '@/components/AssetDetailLayout';

interface SceneDetails {
  intro: string;
  relatedShots: string[];
  fields: {
    type: string;
    name: string;
    period: string;
    time: string;
    location: string;
    mood: string;
    weather: string;
    lighting: string;
    architecture: string;
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

interface SceneAssetDetailProps {
  asset: Scene;
  switchList: AssetSwitchItem[];
  selectedSwitchId: string;
  onSelectSwitchId: (id: string) => void;
  onBack?: () => void;
}

const defaultDetails: SceneDetails = {
  intro: '这是一处重要的场景，承载着剧情的关键转折。场景设计需要突出氛围感和故事性，空间布局要符合剧情需求。',
  relatedShots: ['E01_S01', 'E01_S03', 'E02_S05'],
  fields: {
    type: '内景',
    name: '林深家·客厅',
    period: '现代',
    time: '日',
    location: '林深家客厅',
    mood: '温馨舒适',
    weather: '-',
    lighting: '室内暖光',
    architecture: '现代简约',
  },
  images: [
    { id: '1', name: '主场景', hasImage: true },
    { id: '2', name: '局部特写1', hasImage: true },
    { id: '3', name: '局部特写2', hasImage: false },
    { id: '4', name: '时间变化-黄昏', hasImage: false },
    { id: '5', name: '时间变化-夜晚', hasImage: false },
  ],
  versions: [
    { id: 'v1', name: 'V01', isCurrent: true },
    { id: 'v2', name: 'V02', isCurrent: false },
    { id: 'v3', name: 'V03', isCurrent: false },
  ],
};

export default function SceneAssetDetail({ asset, switchList, selectedSwitchId, onSelectSwitchId, onBack }: SceneAssetDetailProps) {
  const details = defaultDetails;
  const [selectedImageId, setSelectedImageId] = useState(details.images[0]?.id || '1');
  const [selectedVersionId, setSelectedVersionId] = useState('v1');

  const preview = (
    <div className="flex-1 bg-white rounded-lg border border-[var(--border-subtle)] flex items-center justify-center overflow-hidden">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[var(--bg-input)] flex items-center justify-center">
          <Building2 size={32} className="text-[var(--text-muted)]" />
        </div>
        <span className="block text-sm text-[var(--text-muted)] mt-4">场景预览</span>
      </div>
    </div>
  );

  const rightPanel = (
    <>
      {/* Scene Intro */}
      <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-subtle)]">
        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">场景简介</h4>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          {details.intro}
        </p>
      </div>

      {/* Related Shots */}
      <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-subtle)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">关联分镜</h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-input)] text-[var(--text-muted)]">{details.relatedShots.length}</span>
          </div>
          <button className="text-xs text-[var(--accent-primary)] hover:underline">展开全部</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {details.relatedShots.map((shot) => (
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
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-input)] text-[var(--text-muted)]">9</span>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { label: '场景类型', value: details.fields.type },
            { label: '场景名', value: details.fields.name },
            { label: '时代背景', value: details.fields.period },
            { label: '时段', value: details.fields.time },
            { label: '具体地点', value: details.fields.location },
            { label: '氛围', value: details.fields.mood },
            { label: '天气', value: details.fields.weather },
            { label: '光线', value: details.fields.lighting },
            { label: '建筑风格', value: details.fields.architecture },
          ].map((field) => (
            <div key={field.label} className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)] last:border-0">
              <span className="text-xs text-[var(--text-muted)]">{field.label}</span>
              <span className="text-xs text-[var(--text-primary)] font-medium">{field.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button className="w-full py-3 rounded-xl text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity">
        修改生图 5币
      </button>
    </>
  );

  return (
    <AssetDetailLayout
      title="场景详情"
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