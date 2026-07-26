import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Edit3 } from 'lucide-react';
import ProcessStepBar from '@/components/ProcessStepBar';
import ImageAssetCard from '@/components/ImageAssetCard';
import AppHeader from '@/components/AppHeader';
import { fetchProjectImages, imageAssetUrl } from '@/api/imageAssets';
import { fetchShotList } from '@/api/script';
import { getSelectedProject } from '@/stores/selectedProject';
import type { Character, Prop, Scene } from '@/types/asset';

type TabType = 'character' | 'scene' | 'prop';
const tabs = [{ key: 'character', label: '角色' }, { key: 'scene', label: '场景' }, { key: 'prop', label: '道具' }] as const;

export default function ImageCreationPage() {
  const [activeTab, setActiveTab] = useState<TabType>('character');
  const project = getSelectedProject();
  const shotListQuery = useQuery({ queryKey: ['shot-list', project?.id], queryFn: () => fetchShotList(project!.id), enabled: Boolean(project) });
  const imageQuery = useQuery({ queryKey: ['images', project?.id], queryFn: () => fetchProjectImages(project!.id), enabled: Boolean(project) });
  const assets = useMemo(() => {
    const images = imageQuery.data || [];
    const completeImage = (predicate: (asset: typeof images[number]) => boolean) => images.find((asset) => predicate(asset) && asset.effective_status === 'completed' && asset.file_exists);
    if (activeTab === 'character') {
      return (shotListQuery.data?.characters || []).map((character): Character => {
        const versions = images.filter((asset) => asset.character_id === character.char_id);
        const latest = completeImage((asset) => asset.character_id === character.char_id);
        return {
          id: String(character.id), code: character.char_id, kind: 'character', name: character.name,
          description: [character.role, character.character_type, character.gender, character.age_range].filter(Boolean).join(' · ') || '待补充角色设定',
          imageUrl: latest ? imageAssetUrl(latest) : undefined, hasImage: Boolean(latest), totalVersions: versions.length, currentVersion: latest?.version_number || 0,
          details: { intro: character.character_arc || character.role || '待补充角色简介', relatedShots: [], fields: { type: character.character_type || '', name: character.name, function: character.role || '', gender: character.gender || '', age: Number.parseInt(character.age_range || '', 10) || 0, height: character.height_cm || 0, bodyType: character.build || '', arc: character.character_arc || '', hairstyle: character.hair || '' }, images: versions.map((asset) => ({ id: String(asset.id), name: asset.name, hasImage: asset.effective_status === 'completed' && asset.file_exists })), versions: versions.map((asset, index) => ({ id: String(asset.id), name: `V${String(asset.version_number || index + 1).padStart(2, '0')}`, isCurrent: asset.is_current_version ?? index === 0 })) },
        };
      });
    }
    if (activeTab === 'scene') {
      return (shotListQuery.data?.scenes || []).map((scene): Scene => {
        const versions = images.filter((asset) => asset.scene_id === scene.scene_id);
        const latest = completeImage((asset) => asset.scene_id === scene.scene_id);
        return { id: String(scene.id), code: scene.scene_id, kind: 'scene', name: scene.name || scene.location || scene.scene_id, description: [scene.location, scene.time_of_day, scene.mood].filter(Boolean).join(' · ') || '待补充场景设定', imageUrl: latest ? imageAssetUrl(latest) : undefined, hasImage: Boolean(latest), totalVersions: versions.length, currentVersion: latest?.version_number || 0 };
      });
    }
    return images.filter((asset) => asset.asset_type === 'prop_reference').map((asset, index): Prop => ({ id: String(asset.id), code: `P${String(index + 1).padStart(2, '0')}`, kind: 'prop', name: asset.name || '未命名道具', description: '道具参考资产', imageUrl: imageAssetUrl(asset), hasImage: asset.effective_status === 'completed' && asset.file_exists, totalVersions: asset.version_count || 1, currentVersion: asset.version_number || 1 }));
  }, [activeTab, imageQuery.data, shotListQuery.data]);
  const error = shotListQuery.error || imageQuery.error;
  const errorMessage = error instanceof Error ? error.message : '';

  if (!project) return <div className="flex-1 flex items-center justify-center text-sm text-[var(--text-secondary)]">请先在项目页选择一个项目。</div>;
  return (
    <div className="flex-1 flex flex-col min-w-0">
      <AppHeader title={project.name} subtitle="图像创作" extraLeft={<button className="w-7 h-7 rounded flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors"><Edit3 size={14} /></button>} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <ProcessStepBar />
        {errorMessage && <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{errorMessage}</p>}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)]"><span>项目资产</span><ChevronDown size={16} className="text-[var(--text-muted)]" /></button>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-surface)]">{tabs.map((tab) => <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === tab.key ? 'bg-[var(--accent-primary)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'}`}>{tab.label}</button>)}</div>
        </div>
        {shotListQuery.isLoading || imageQuery.isLoading ? <p className="text-sm text-[var(--text-secondary)]">正在加载项目资产...</p> : assets.length ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{assets.map((asset) => <ImageAssetCard key={asset.id} asset={asset} />)}</div> : <div className="rounded-xl border border-dashed border-[var(--border-default)] p-10 text-center text-sm text-[var(--text-secondary)]">当前没有可展示的{tabs.find((tab) => tab.key === activeTab)?.label}资产。</div>}
      </main>
    </div>
  );
}
