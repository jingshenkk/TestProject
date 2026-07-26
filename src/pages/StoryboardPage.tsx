import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { Shot } from '@/components/ShotCard';
import StoryboardTopBar from '@/components/StoryboardTopBar';
import ProcessStepBar from '@/components/ProcessStepBar';
import StoryboardSidebar from '@/components/StoryboardSidebar';
import ShotCard from '@/components/ShotCard';
import EmptyStoryboard from '@/components/EmptyStoryboard';
import ShotEditModal from '@/components/ShotEditModal';
import { fetchShotList, toStoryboardShot, updateStoryboardShot } from '@/api/script';
import { getSelectedProject } from '@/stores/selectedProject';
import { sampleShots } from '@/mocks/storyboardShots';

export default function StoryboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const project = getSelectedProject();
  const isMockProject = Boolean(project?.isMock);
  const [editingShot, setEditingShot] = useState<Shot | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [mockShots, setMockShots] = useState<Shot[]>(() => sampleShots.map((shot) => ({ ...shot, tags: shot.tags ? [...shot.tags] : [] })));
  const shotListQuery = useQuery({
    queryKey: ['shot-list', project?.id],
    queryFn: () => fetchShotList(project!.id),
    enabled: Boolean(project && !isMockProject),
  });
  const updateMutation = useMutation({
    mutationFn: updateStoryboardShot,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shot-list', project?.id] }),
  });
  const shots = isMockProject ? mockShots : (shotListQuery.data?.shots || []).map(toStoryboardShot);
  const totalSeconds = shots.reduce((sum, shot) => sum + (shot.durationSeconds ?? 0), 0);
  const errorMessage = (shotListQuery.error || updateMutation.error) instanceof Error
    ? (shotListQuery.error || updateMutation.error as Error).message
    : '';

  const handleEditShot = (shot: Shot) => { setEditingShot(shot); setIsEditModalOpen(true); };
  const handleCloseModal = () => { setIsEditModalOpen(false); setEditingShot(null); };
  const handleSaveShot = (shot: Shot) => {
    if (isMockProject) {
      setMockShots((currentShots) => currentShots.map((currentShot) => currentShot.id === shot.id ? shot : currentShot));
      handleCloseModal();
      return;
    }
    updateMutation.mutate(shot, { onSuccess: handleCloseModal });
  };

  if (!project) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <StoryboardTopBar />
        <main className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center space-y-3"><p className="text-[var(--text-secondary)]">请先在项目页选择一个项目，再进入分镜工作台。</p><button onClick={() => navigate('/projects')} className="btn btn-primary btn-sm">前往项目</button></div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <StoryboardTopBar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <ProcessStepBar />
        {isMockProject && <p className="mb-4 rounded-xl border border-[var(--accent-primary)]/25 bg-[var(--accent-primary-bg)] px-4 py-3 text-sm text-[var(--text-secondary)]">LOCAL MOCK · 分镜编辑仅保存在当前浏览器会话中，不会请求或修改后端镜头数据。</p>}
        {errorMessage && <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{errorMessage}</p>}
        <div className="flex gap-6">
          <StoryboardSidebar />
          <div className="flex-1 min-w-0">
            {!isMockProject && shotListQuery.isLoading ? <p className="text-sm text-[var(--text-secondary)]">正在加载分镜...</p> : shots.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4"><span className="text-lg font-medium text-[var(--text-primary)]">{shots.length} 镜</span><span className="text-[var(--text-muted)]">·</span><span className="text-lg font-medium text-[var(--text-primary)]">{Math.round(totalSeconds)}s</span></div>
                <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">{shots.map((shot) => <ShotCard key={shot.id} shot={shot} onEdit={handleEditShot} />)}</div>
              </div>
            ) : <EmptyStoryboard onCreate={() => navigate('/video')} />}
          </div>
        </div>
      </main>
      <ShotEditModal isOpen={isEditModalOpen} shot={editingShot} onClose={handleCloseModal} onSave={handleSaveShot} />
    </div>
  );
}
