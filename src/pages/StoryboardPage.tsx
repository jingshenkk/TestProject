import type { Shot } from '@/components/ShotCard';
import { useState } from 'react';
import StoryboardTopBar from '@/components/StoryboardTopBar';
import ProcessStepBar from '@/components/ProcessStepBar';
import StoryboardSidebar from '@/components/StoryboardSidebar';
import ShotCard from '@/components/ShotCard';
import EmptyStoryboard from '@/components/EmptyStoryboard';
import ShotEditModal from '@/components/ShotEditModal';
import { sampleShots } from '@/mocks/storyboardShots';

export default function StoryboardPage() {
  const [hasScript, setHasScript] = useState(true);
  const [shots, setShots] = useState<Shot[]>(sampleShots);
  const [editingShot, setEditingShot] = useState<Shot | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const totalShots = shots.length;
  const totalSeconds = shots.reduce((sum, s) => sum + (s.durationSeconds ?? 0), 0);
  const totalDuration = `${Math.round(totalSeconds)}s`;

  const handleCreateScript = () => {
    // TODO: 实现创建剧本逻辑
    setHasScript(true);
  };

  const handleEditShot = (shot: Shot) => {
    setEditingShot(shot);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingShot(null);
  };

  const handleSaveShot = (updatedShot: Shot) => {
    setShots((prev) =>
      prev.map((shot) => (shot.id === updatedShot.id ? updatedShot : shot))
    );
    handleCloseModal();
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Top Navigation */}
      <StoryboardTopBar />

      {/* Page Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        {/* Process Steps */}
        <ProcessStepBar />

        {/* Main Content Area */}
        <div className="flex gap-6">
          {/* Left Sidebar - Episode List */}
          <StoryboardSidebar />

          {/* Right Content */}
          <div className="flex-1 min-w-0">
            {hasScript ? (
              <div className="space-y-4">
                {/* Stats Header */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg font-medium text-[var(--text-primary)]">
                    {totalShots} 镜
                  </span>
                  <span className="text-[var(--text-muted)]">·</span>
                  <span className="text-lg font-medium text-[var(--text-primary)]">
                    {totalDuration}
                  </span>
                </div>

                {/* Shot Cards Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                  {shots.map((shot) => (
                    <ShotCard
                      key={shot.id}
                      shot={shot}
                      onEdit={handleEditShot}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyStoryboard onCreate={handleCreateScript} />
            )}
          </div>
        </div>
      </main>

      {/* Shot Edit Modal */}
      <ShotEditModal
        isOpen={isEditModalOpen}
        shot={editingShot}
        onClose={handleCloseModal}
        onSave={handleSaveShot}
      />
    </div>
  );
}
