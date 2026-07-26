import { useState } from 'react';

interface Character {
  name: string;
  type: string;
  visual: string;
  tags: string;
  background: string;
  growth: string;
  personality: string;
  relationships: string;
  arc: string;
}

export default function ScriptSettings() {
  const [activeTab, setActiveTab] = useState<'intro' | 'characters'>('intro');
  const [scriptContent, setScriptContent] = useState(`a.未来星际人类，回顾历史的时候，想起了地球，想通过时间穿越的方式把未来的AI机器人传送到大战前，帮助人类避免战争与地球的毁灭。
b.只把一个AI 医疗手环传送到了2015年。未来人以为失败了
c.肖然在图书馆备考研究生，意外发现桌子上有个小丝环，然后随手往手上带了带，丝环亮了下光，然后就跟手壁融入一体，肖然感到惊讶，但也没太在意
d.肖然陪室友打球拐脚去医院的时候，就诊时听医生说要做各种检查，肖然说了下自己的想法，意外激活医疗环，医疗环把详细的病情与治疗方案的告知肖然，检查的结果与肖然通过医疗环获取的信息一样，肖然开始感受到有个"东西"的存在
e.接下来就是肖然应用医疗环，经历各种生活波折，一步一步的向最终目的的发展`);

  const character: Character = {
    name: '肖然',
    type: '主角',
    visual: '男，中年，外表随性不羁，眼神藏着敏锐锋芒',
    tags: '被迫救世主+嘴贫伪装+智性博弈者',
    background: '大学社会学教授，被强行选为面壁者，核心动机从拒绝救世到主动承担文明存续责任',
    growth: '曾受叶文洁点拨，被突然推上神坛成为面壁者，初期装疯摆烂试探规则，与庄颜共同生活后因她被暴露软肋，逐渐逼近自己的核心秘密（三体忌惮的原因）',
    personality: '外表外向嘴贫、看似散漫，内心理性敏锐、擅长抓逻辑缝隙，抗拒责任却主动试探边界（反差）',
    relationships: '与庄颜：刻意挑选→真实依赖→因她转变；与萨伊：对立→有限信任；与史强：嫌弃→默契搭档',
    arc: '拒绝救世主身份→装疯试探寻找生路→承担责任走向答案',
  };

  return (
    <div className="glass-panel p-4 lg:p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base lg:text-lg font-medium text-[var(--text-primary)]">剧本设定</h2>
          <span className="text-xs text-[var(--text-muted)]">
            审阅剧本大纲，修改关键元素，更精准的创作剧本
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--text-muted)]">
            注意：变更剧本设定内容，提交后已生成的剧本将清空，请谨慎操作！
          </span>
          <button className="h-8 px-4 rounded-lg bg-[var(--accent-primary)] text-white text-sm font-medium hover:bg-[var(--accent-primary-dim)] transition-colors">
            保存
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b border-[var(--border-subtle)]">
        <button
          onClick={() => setActiveTab('intro')}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === 'intro'
              ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          剧本简介
        </button>
        <button
          onClick={() => setActiveTab('characters')}
          className={`pb-2 text-sm font-medium transition-colors ${
            activeTab === 'characters'
              ? 'text-[var(--accent-primary)] border-b-2 border-[var(--accent-primary)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
          }`}
        >
          角色设定
        </button>
      </div>

      {/* Content */}
      {activeTab === 'intro' ? (
        <textarea
          value={scriptContent}
          onChange={(e) => setScriptContent(e.target.value)}
          className="w-full h-48 bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-lg p-4 text-sm text-[var(--text-primary)] resize-none outline-none focus:border-[var(--accent-primary)] transition-colors"
        />
      ) : (
        <div className="space-y-4 text-sm">
          <div className="flex gap-2">
            <span className="text-[var(--text-muted)] w-16 flex-shrink-0">1、{character.name}</span>
          </div>
          <div className="pl-4 space-y-2">
            <div className="flex gap-2">
              <span className="text-[var(--text-muted)] w-20 flex-shrink-0">角色类型：</span>
              <span className="text-[var(--text-primary)]">{character.type}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[var(--text-muted)] w-20 flex-shrink-0">视觉形象：</span>
              <span className="text-[var(--text-primary)]">{character.visual}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[var(--text-muted)] w-20 flex-shrink-0">核心标签：</span>
              <span className="text-[var(--text-primary)]">{character.tags}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[var(--text-muted)] w-20 flex-shrink-0">身份背景：</span>
              <span className="text-[var(--text-primary)]">{character.background}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[var(--text-muted)] w-20 flex-shrink-0">成长经历：</span>
              <span className="text-[var(--text-primary)]">{character.growth}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[var(--text-muted)] w-20 flex-shrink-0">性格特点：</span>
              <span className="text-[var(--text-primary)]">{character.personality}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[var(--text-muted)] w-20 flex-shrink-0">角色关系：</span>
              <span className="text-[var(--text-primary)]">{character.relationships}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-[var(--text-muted)] w-20 flex-shrink-0">成长弧线：</span>
              <span className="text-[var(--text-primary)]">{character.arc}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
