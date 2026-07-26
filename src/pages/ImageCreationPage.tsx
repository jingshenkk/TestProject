import { useState } from 'react';
import { ChevronDown, Edit3 } from 'lucide-react';
import ProcessStepBar from '@/components/ProcessStepBar';
import ImageAssetCard from '@/components/ImageAssetCard';
import CharacterAssetDetail from '@/components/CharacterAssetDetail';
import SceneAssetDetail from '@/components/SceneAssetDetail';
import PropAssetDetail from '@/components/PropAssetDetail';
import AppHeader from '@/components/AppHeader';
import type { Asset } from '@/types/asset';
import { sampleCharacters, sampleScenes, sampleProps } from '@/mocks/assets';

type TabType = 'character' | 'scene' | 'prop';

const tabs = [
  { key: 'character', label: '角色' },
  { key: 'scene', label: '场景' },
  { key: 'prop', label: '道具' },
] as const;

export default function ImageCreationPage() {
  const [activeTab, setActiveTab] = useState<TabType>('character');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedEpisode] = useState('第一集：被迫封神');

  const getAssets = (): Asset[] => {
    switch (activeTab) {
      case 'character':
        return sampleCharacters;
      case 'scene':
        return sampleScenes;
      case 'prop':
        return sampleProps;
      default:
        return [];
    }
  };

  const handleCardClick = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleBackToGrid = () => {
    setSelectedAsset(null);
  };

  // 顶部"同类切换 tab"的数据与回调（P2-4：选中 ID 上提到父级，切换即更换下传 asset）
  const switchList = getAssets().map(a => ({
    id: a.id,
    code: a.code,
    name: a.name,
    current: a.currentVersion,
    total: a.totalVersions,
  }));

  const handleSwitchAsset = (id: string) => {
    const next = getAssets().find(a => a.id === id);
    if (next) setSelectedAsset(next);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Top Navigation */}
      <AppHeader
        title="三体2 终极之战"
        subtitle="图像创作"
        extraLeft={
          <button className="w-7 h-7 rounded flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] transition-colors">
            <Edit3 size={14} />
          </button>
        }
      />

      {/* Page Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        {/* Process Steps */}
        <ProcessStepBar />

        {selectedAsset ? (
          <div className="h-[calc(100vh-140px)] min-h-[600px]">
            {selectedAsset.kind === 'character' && (
              <CharacterAssetDetail
                asset={selectedAsset}
                switchList={switchList}
                selectedSwitchId={selectedAsset.id}
                onSelectSwitchId={handleSwitchAsset}
                onBack={handleBackToGrid}
              />
            )}
            {selectedAsset.kind === 'scene' && (
              <SceneAssetDetail
                asset={selectedAsset}
                switchList={switchList}
                selectedSwitchId={selectedAsset.id}
                onSelectSwitchId={handleSwitchAsset}
                onBack={handleBackToGrid}
              />
            )}
            {selectedAsset.kind === 'prop' && (
              <PropAssetDetail
                asset={selectedAsset}
                switchList={switchList}
                selectedSwitchId={selectedAsset.id}
                onSelectSwitchId={handleSwitchAsset}
                onBack={handleBackToGrid}
              />
            )}
          </div>
        ) : (
          <>
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              {/* Episode Selector */}
              <div className="relative">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] text-sm text-[var(--text-primary)] hover:border-[var(--accent-primary)] transition-colors">
                  <span>{selectedEpisode}</span>
                  <ChevronDown size={16} className="text-[var(--text-muted)]" />
                </button>
              </div>

              {/* Tab Switcher */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-[var(--bg-surface)]">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.key
                        ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Asset Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {getAssets().map((asset) => (
                <ImageAssetCard
                  key={asset.id}
                  asset={asset}
                  onClick={() => handleCardClick(asset)}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}