import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, MoreHorizontal, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import Modal from '@/components/Modal';
import { createProject, deleteProject, fetchProjects, updateProject } from '@/api/projects';
import { setSelectedProject as setCurrentProject } from '@/stores/selectedProject';
import type { Project } from '@/types/project';

// 删除确认弹窗
interface DeleteConfirmModalProps {
  isOpen: boolean;
  projectName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function DeleteConfirmModal({ isOpen, projectName, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      zIndex="z-50"
      closeOnBackdropClick={false}
      panelClassName="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-6 w-[400px] shadow-xl animate-fade-in"
      ariaLabel="删除项目"
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={24} className="text-red-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">删除项目</h3>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            删除后，无法恢复，请谨慎操作！
          </p>
          <p className="text-sm text-[var(--text-primary)] font-medium mb-6">
            确定要删除「{projectName}」吗？
          </p>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
            >
              取消
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              确认删除
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// 重命名弹窗
interface RenameModalProps {
  isOpen: boolean;
  projectName: string;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
}

function RenameModal({ isOpen, projectName, onConfirm, onCancel }: RenameModalProps) {
  const [newName, setNewName] = useState(projectName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setNewName(projectName);
    }
  }, [isOpen, projectName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onConfirm(newName.trim());
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      zIndex="z-50"
      closeOnBackdropClick={false}
      initialFocusRef={inputRef}
      panelClassName="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-6 w-[400px] shadow-xl animate-fade-in"
      ariaLabel="重命名项目"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">重命名项目</h3>
        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="输入项目名称"
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent-primary)] transition-colors mb-4"
        />
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity"
          >
            确认
          </button>
        </div>
      </form>
    </Modal>
  );
}

// 项目卡片组件
interface ProjectCardProps {
  project: Project;
  onDelete: (project: Project) => void;
  onRename: (project: Project) => void;
}

function ProjectCard({ project, onDelete, onRename }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCardClick = () => {
    // 点击进入视频模块，并携带当前 project，供 VideoPage 判定已选择项目
    setCurrentProject(project);
    navigate('/video', { state: { project } });
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="glass-card overflow-hidden cursor-pointer group relative"
    >
      {/* 悬停辉光边框 */}
      <div className={`absolute inset-0 rounded-xl border border-[var(--accent-primary)] transition-opacity duration-300 pointer-events-none ${isHovered ? 'opacity-40' : 'opacity-0'}`} />

      {/* Cover Image */}
      <div className="aspect-[16/9] bg-[var(--bg-surface)] relative overflow-hidden">
        {project.coverImage && !coverFailed ? (
          <img
            src={project.coverImage}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={() => setCoverFailed(true)}
          />
        ) : (
          /* 默认占位图 - 电影风格取景框 */
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-input)]">
            <svg viewBox="0 0 200 120" className="w-full h-full">
              <defs>
                <linearGradient id="frameGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--border-default)" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.2" />
                </linearGradient>
              </defs>
              <rect width="200" height="120" fill="url(#frameGrad)" />
              {/* 十字线 */}
              <line x1="100" y1="0" x2="100" y2="120" stroke="var(--border-default)" strokeWidth="0.5" />
              <line x1="0" y1="60" x2="200" y2="60" stroke="var(--border-default)" strokeWidth="0.5" />
              {/* 对角线 */}
              <line x1="0" y1="0" x2="200" y2="120" stroke="var(--border-default)" strokeWidth="0.5" opacity="0.3" />
              <line x1="200" y1="0" x2="0" y2="120" stroke="var(--border-default)" strokeWidth="0.5" opacity="0.3" />
              {/* 取景框四角 */}
              <path d="M10 25 L10 10 L25 10" stroke="var(--accent-primary)" strokeWidth="1" fill="none" opacity="0.5" />
              <path d="M175 10 L190 10 L190 25" stroke="var(--accent-primary)" strokeWidth="1" fill="none" opacity="0.5" />
              <path d="M10 95 L10 110 L25 110" stroke="var(--accent-primary)" strokeWidth="1" fill="none" opacity="0.5" />
              <path d="M175 110 L190 110 L190 95" stroke="var(--accent-primary)" strokeWidth="1" fill="none" opacity="0.5" />
            </svg>
          </div>
        )}

        {/* 悬停遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--accent-primary)]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Project Info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-[var(--text-primary)] truncate mb-1.5 group-hover:text-[var(--accent-primary)] transition-colors">
              {project.name}
            </h3>
            {project.code && (
              <p className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--accent-primary-bg)] text-[var(--accent-primary)] mb-2">
                {project.code}
              </p>
            )}
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
              更新于 {project.lastUpdated}
            </p>
          </div>

          {/* Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-all duration-200 hover:scale-105"
            >
              <MoreHorizontal size={18} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] shadow-xl py-1 min-w-[120px] z-10 animate-fade-in">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename(project);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors flex items-center gap-2"
                >
                  <span>✎</span> 重命名
                </button>
                <div className="mx-2 my-1 h-px bg-[var(--border-subtle)]" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(project);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                >
                  <span>🗑</span> 删除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 创建项目卡片
interface CreateProjectCardProps {
  onCreate: () => void;
}

function CreateProjectCard({ onCreate }: CreateProjectCardProps) {
  return (
    <button
      onClick={onCreate}
      className="glass-card aspect-[16/10] flex flex-col items-center justify-center gap-4 cursor-pointer group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/5 via-transparent to-[var(--accent-secondary)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-[var(--accent-primary)]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
        <div className="w-16 h-16 rounded-full border-2 border-dashed border-[var(--border-default)] flex items-center justify-center group-hover:border-[var(--accent-primary)] group-hover:bg-[var(--accent-primary)]/10 transition-all duration-300 relative">
          <Plus size={32} className="text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-all duration-300 group-hover:rotate-90" />
        </div>
      </div>
      <span className="text-base font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">创建项目</span>
      <span className="text-xs text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity duration-300">开始新的创作旅程</span>
    </button>
  );
}

interface CreateProjectModalProps {
  isOpen: boolean;
  isPending: boolean;
  onCreate: (name: string) => void;
  onCancel: () => void;
}

function CreateProjectModal({ isOpen, isPending, onCreate, onCancel }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) setName('');
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      zIndex="z-50"
      closeOnBackdropClick={!isPending}
      initialFocusRef={inputRef}
      panelClassName="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] p-6 w-[400px] shadow-xl animate-fade-in"
      ariaLabel="创建项目"
    >
      <form onSubmit={(event) => { event.preventDefault(); if (name.trim()) onCreate(name.trim()); }}>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">创建项目</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-4">新项目会使用默认短剧工作流；后续可在创作页补充题材、规格与视觉风格。</p>
        <input
          ref={inputRef}
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isPending}
          placeholder="输入项目名称"
          className="w-full px-4 py-3 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm outline-none focus:border-[var(--accent-primary)] transition-colors mb-4"
        />
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={isPending} className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors">取消</button>
          <button type="submit" disabled={isPending || !name.trim()} className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--accent-primary)] text-white disabled:opacity-50 hover:opacity-90 transition-opacity">{isPending ? '创建中...' : '创建并进入'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function ProjectsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: fetchProjects });

  const invalidateProjects = () => queryClient.invalidateQueries({ queryKey: ['projects'] });
  const deleteMutation = useMutation({ mutationFn: deleteProject, onSuccess: invalidateProjects });
  const renameMutation = useMutation({ mutationFn: ({ id, name }: { id: number; name: string }) => updateProject(id, { name }), onSuccess: invalidateProjects });
  const createMutation = useMutation({ mutationFn: createProject, onSuccess: (project) => {
    invalidateProjects();
    setCurrentProject(project);
    navigate('/video', { state: { project } });
  }});

  const handleDelete = (project: Project) => { setSelectedProject(project); setDeleteModalOpen(true); };
  const confirmDelete = () => {
    if (!selectedProject) return;
    deleteMutation.mutate(selectedProject.id, { onSuccess: () => { setDeleteModalOpen(false); setSelectedProject(null); } });
  };
  const handleRename = (project: Project) => { setSelectedProject(project); setRenameModalOpen(true); };
  const confirmRename = (name: string) => {
    if (!selectedProject) return;
    renameMutation.mutate({ id: selectedProject.id, name }, { onSuccess: () => { setRenameModalOpen(false); setSelectedProject(null); } });
  };
  const error = projectsQuery.error || deleteMutation.error || renameMutation.error || createMutation.error;
  const errorMessage = error instanceof Error ? error.message : '';

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      <AppHeader title="项目管理" showBack={false} zIndex="z-40" />
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        {errorMessage && <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{errorMessage}</p>}
        {projectsQuery.isLoading ? <p className="text-sm text-[var(--text-secondary)]">正在加载项目...</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <CreateProjectCard onCreate={() => setCreateModalOpen(true)} />
            {(projectsQuery.data || []).map((project) => <ProjectCard key={project.id} project={project} onDelete={handleDelete} onRename={handleRename} />)}
          </div>
        )}
      </main>
      <DeleteConfirmModal isOpen={deleteModalOpen} projectName={selectedProject?.name || ''} onConfirm={confirmDelete} onCancel={() => { setDeleteModalOpen(false); setSelectedProject(null); }} />
      <RenameModal isOpen={renameModalOpen} projectName={selectedProject?.name || ''} onConfirm={confirmRename} onCancel={() => { setRenameModalOpen(false); setSelectedProject(null); }} />
      <CreateProjectModal isOpen={createModalOpen} isPending={createMutation.isPending} onCreate={(name) => createMutation.mutate({ name })} onCancel={() => setCreateModalOpen(false)} />
    </div>
  );
}
