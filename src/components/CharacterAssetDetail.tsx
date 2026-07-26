import { useState } from 'react';
import { User, Smile, Frown, Angry, Laugh, Meh, Lightbulb, Heart, Drama } from 'lucide-react';
import type { Character, CharacterDetails } from '@/types/asset';
import AssetDetailLayout, { type AssetSwitchItem } from '@/components/AssetDetailLayout';

interface CharacterAssetDetailProps {
  asset: Character;
  switchList: AssetSwitchItem[];
  selectedSwitchId: string;
  onSelectSwitchId: (id: string) => void;
  onBack?: () => void;
}

// 表情占位项：emoji 替换为 lucide 图标 + 中文 aria-label（避免读屏输出"笑脸"）
const EXPRESSIONS = [
  { icon: Smile, label: '喜' },
  { icon: Frown, label: '悲' },
  { icon: Angry, label: '怒' },
  { icon: Laugh, label: '乐' },
  { icon: Meh, label: '倦' },
  { icon: Lightbulb, label: '思' },
  { icon: Heart, label: '恋' },
  { icon: Drama, label: '酷' },
];

// 默认详情数据
const defaultDetails: CharacterDetails = {
  intro: '大学社会学教授，被强行选为面壁者，核心动机从拒绝救世到主动承担文明存续责任',
  relatedShots: ['E01_S01', 'E01_S02', 'E01_S03', 'E01_S04', 'E01_S05', 'E01_S06', 'E01_S07', 'E01_S08'],
  fields: {
    type: '人类',
    name: '湘夫人',
    function: '主角',
    gender: '女',
    age: 20,
    height: 165,
    bodyType: '苗条',
    arc: '从被动承受家族压力的淡然闺秀，到坚定选择所爱、主动反抗父权安排',
    hairstyle: '高髻云鬓，乌黑如墨，斜插一支白玉步摇，长及腰际',
  },
  images: [
    { id: '1', name: '三视图', hasImage: true },
    { id: '2', name: '情绪表', hasImage: false },
    { id: '3', name: '素白寝衣（闺阁）', hasImage: false },
    { id: '4', name: '朱红襦裙+墨绿大袖衫（日常）', hasImage: false },
  ],
  versions: [
    { id: 'v1', name: 'V01', isCurrent: false },
    { id: 'v2', name: 'V02', isCurrent: true },
    { id: 'v3', name: 'V03', isCurrent: false },
    { id: 'v4', name: 'V04', isCurrent: false },
    { id: 'v5', name: 'V05', isCurrent: false },
  ],
};

// 示例角色列表（顶部切换用）—— 由父级传入同类资产，见 ImageCreationPage

export default function CharacterAssetDetail({ asset, switchList, selectedSwitchId, onSelectSwitchId, onBack }: CharacterAssetDetailProps) {
  const details = asset.details || defaultDetails;
  const [selectedImageId, setSelectedImageId] = useState(details.images[0]?.id || '1');
  const [selectedVersionId, setSelectedVersionId] = useState('v2');

  const preview = (
    <>
      {/* Three Views Grid */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {['正面', '侧面', '背面'].map((view) => (
          <div key={view} className="aspect-[3/4] bg-white rounded-lg border border-[var(--border-subtle)] flex items-center justify-center overflow-hidden">
            <div className="text-center">
              <User size={40} className="text-[var(--text-muted)] mx-auto" />
              <span className="block text-xs text-[var(--text-muted)] mt-1">{view}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Expression Grid */}
      <div className="grid grid-cols-8 gap-2 flex-1">
        {EXPRESSIONS.map(({ icon: Icon, label }) => (
          <div
            key={label}
            role="img"
            aria-label={label}
            className="aspect-square bg-white rounded-lg border border-[var(--border-subtle)] flex items-center justify-center hover:border-[var(--accent-primary)] transition-colors cursor-pointer"
          >
            <Icon size={20} className="text-[var(--text-muted)]" />
          </div>
        ))}
      </div>
    </>
  );

  const rightPanel = (
    <>
      {/* Character Intro */}
      <div className="bg-[var(--bg-card)] rounded-xl p-4 border border-[var(--border-subtle)]">
        <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">角色简介</h4>
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
          {details.relatedShots.slice(0, 8).map((shot) => (
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
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-input)] text-[var(--text-muted)]">15</span>
          </div>
          <button className="text-xs text-[var(--accent-primary)] hover:underline">展开全部</button>
        </div>
        <div className="space-y-2">
          {[
            { label: '角色类型', value: details.fields.type },
            { label: '角色名', value: details.fields.name },
            { label: '角色功能', value: details.fields.function },
            { label: '性别', value: details.fields.gender },
            { label: '年龄', value: details.fields.age },
            { label: '身高', value: details.fields.height },
            { label: '体型', value: details.fields.bodyType },
          ].map((field) => (
            <div key={field.label} className="flex items-center justify-between py-1.5 border-b border-[var(--border-subtle)] last:border-0">
              <span className="text-xs text-[var(--text-muted)]">{field.label}</span>
              <span className="text-xs text-[var(--text-primary)] font-medium">{field.value}</span>
            </div>
          ))}
          <div className="pt-2">
            <span className="text-xs text-[var(--text-muted)] block mb-1">角色弧光</span>
            <p className="text-xs text-[var(--text-primary)] leading-relaxed bg-[var(--bg-input)] rounded-lg p-2 border border-[var(--border-subtle)]">
              {details.fields.arc}
            </p>
          </div>
          <div className="pt-2">
            <span className="text-xs text-[var(--text-muted)] block mb-1">发型</span>
            <p className="text-xs text-[var(--text-primary)] leading-relaxed bg-[var(--bg-input)] rounded-lg p-2 border border-[var(--border-subtle)]">
              {details.fields.hairstyle}
            </p>
          </div>
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
      title="角色详情"
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