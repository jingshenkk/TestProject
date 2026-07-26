import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Shot } from '@/components/ShotCard';
import Modal from '@/components/Modal';

interface ShotEditModalProps {
  isOpen: boolean;
  shot: Shot | null;
  onClose: () => void;
  onSave: (shot: Shot) => void;
}

// 下拉选项
const viewTypeOptions = ['中近景', '全景', '特写', '远景', '近景', '中景'];
const cameraMovementOptions = ['固定', '推', '拉', '摇', '移', '跟', '升降', '旋转'];
const cameraAngleOptions = ['平拍', '仰拍', '俯拍', '侧拍', '低角度仰拍', '高角度俯拍'];
const lensFocusOptions = ['人物', '背景', '道具', '环境', '细节'];
const motionIntensityOptions = ['低', '中', '高'];
const consistencyWeightOptions = ['低', '中', '高'];

// 对白 → 时长的只读估计参数（命名化，避免魔法数字）
const DIALOGUE_CHARS_PER_SEC = 4.3; // 朗读语速：字/秒
const DIALOGUE_PAUSE_SEC = 1.2;     // 对白前后停顿：秒

export default function ShotEditModal({ isOpen, shot, onClose, onSave }: ShotEditModalProps) {
  const [formData, setFormData] = useState<Shot | null>(shot);

  useEffect(() => {
    setFormData(shot);
  }, [shot]);

  if (!isOpen || !formData) return null;

  const handleChange = (field: keyof Shot, value: string | number) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
    }
  };

  // 时长依据：由对白只读派生（仅供参考，durationSeconds 输入框才是权威值）
  const dialogueLength = formData.dialogue?.length ?? 0;
  const estimatedSeconds = dialogueLength > 0
    ? dialogueLength / DIALOGUE_CHARS_PER_SEC + DIALOGUE_PAUSE_SEC
    : 0;
  const durationBasis = dialogueLength > 0
    ? `对白 ${dialogueLength} 字 · 预估约 ${estimatedSeconds.toFixed(1)}s`
    : '无对白';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      zIndex="z-[100]"
      panelClassName="relative bg-[var(--bg-card)] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-auto mx-4"
      ariaLabel="分镜编辑"
    >
      {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
          <h2 className="text-lg font-medium text-[var(--text-primary)]">分镜编辑</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 基本信息 - 灰色背景 */}
          <div className="bg-[var(--bg-surface)] rounded-lg p-4 grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-[var(--text-muted)]">镜号：</span>
              <span className="text-[var(--text-primary)]">{formData.code}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">场景编号：</span>
              <span className="text-[var(--text-primary)]">{formData.sceneNo || 'S01'}</span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">时长依据：</span>
              <span className="text-[var(--text-primary)]">{durationBasis}</span>
            </div>
          </div>

          {/* 第一行输入 */}
          <div className="bg-[var(--bg-surface)] rounded-lg p-4 grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">时长（s）</label>
              <input
                type="number"
                step="0.1"
                value={formData.durationSeconds || ''}
                onChange={(e) => handleChange('durationSeconds', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                placeholder="12.6"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">运动强度</label>
              <select
                value={formData.motionIntensity || '中'}
                onChange={(e) => handleChange('motionIntensity', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              >
                {motionIntensityOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">一致性权重</label>
              <select
                value={formData.consistencyWeight || '中'}
                onChange={(e) => handleChange('consistencyWeight', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              >
                {consistencyWeightOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 第二行 - 下拉选择 */}
          <div className="bg-[var(--bg-surface)] rounded-lg p-4 grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">别景</label>
              <select
                value={formData.viewType || formData.type || '中近景'}
                onChange={(e) => handleChange('viewType', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              >
                {viewTypeOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">运镜方式</label>
              <select
                value={formData.cameraMovement || formData.movement || '固定'}
                onChange={(e) => handleChange('cameraMovement', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              >
                {cameraMovementOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">拍摄角度</label>
              <select
                value={formData.cameraAngle || '平拍'}
                onChange={(e) => handleChange('cameraAngle', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              >
                {cameraAngleOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 第三行 - 镜头聚焦和叙事节拍 */}
          <div className="bg-[var(--bg-surface)] rounded-lg p-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">镜头聚焦</label>
              <select
                value={formData.lensFocus || '人物'}
                onChange={(e) => handleChange('lensFocus', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
              >
                {lensFocusOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">叙事节拍</label>
              <input
                type="text"
                value={formData.narrativeBeat || ''}
                onChange={(e) => handleChange('narrativeBeat', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
                placeholder="请输入叙事节拍..."
              />
            </div>
          </div>

          {/* 画面描述 */}
          <div className="bg-[var(--bg-surface)] rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">画面描述</label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] resize-none"
                placeholder="低角度仰拍，湘夫人侧脸，眼眸低垂，唇角微抿，身后壮丹化作模糊的红云。光线从她眉弓滑落至下颌。"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">机位描述</label>
              <textarea
                value={formData.cameraPosition || ''}
                onChange={(e) => handleChange('cameraPosition', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] resize-none"
                placeholder="H04机位：摄像机低位架设于花圃旁，仰角约20度，从下往上拍湘夫人侧脸特写。湘夫人位于画面中央偏右。"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">对白</label>
              <textarea
                value={formData.dialogue || ''}
                onChange={(e) => handleChange('dialogue', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] resize-none"
                placeholder="湘夫人：（沉默，别过脸去）"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-input)] transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-[var(--accent-primary)] hover:opacity-90 transition-opacity"
            >
              保存
            </button>
          </div>
        </form>
    </Modal>
  );
}
