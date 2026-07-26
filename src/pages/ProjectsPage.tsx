import { useState, useRef, useEffect } from 'react';
import { Plus, MoreHorizontal, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import Modal from '@/components/Modal';
import { sampleProjects, type Project } from '@/mocks/projects';

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
    navigate('/video'); // 点击进入视频模块
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
      className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] overflow-hidden cursor-pointer hover:border-[var(--accent-primary)] hover:shadow-lg transition-all duration-200 group"
    >
      {/* Cover Image */}
      <div className="aspect-[16/9] bg-[var(--bg-surface)] relative overflow-hidden">
        {project.coverImage && !coverFailed ? (
          <img
            src={project.coverImage}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setCoverFailed(true)}
          />
        ) : (
          /* 默认占位图（coverImage 缺失或加载失败时受控渲染，src 变更后可恢复） */
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 200 120" className="w-full h-full">
              <rect width="200" height="120" fill="var(--bg-surface)" />
              <line x1="0" y1="0" x2="200" y2="120" stroke="var(--border-default)" strokeWidth="1" />
              <line x1="200" y1="0" x2="0" y2="120" stroke="var(--border-default)" strokeWidth="1" />
            </svg>
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-medium text-[var(--text-primary)] truncate mb-1">
              {project.name}
            </h3>
            {project.code && (
              <p className="text-sm text-[var(--accent-primary)] mb-1">{project.code}</p>
            )}
            <p className="text-xs text-[var(--text-muted)]">
              最后更新：{project.lastUpdated}
            </p>
          </div>

          {/* Menu Button */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
            >
              <MoreHorizontal size={18} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)] shadow-lg py-1 min-w-[100px] z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRename(project);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)] transition-colors"
                >
                  重命名
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(project);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  删除
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
function CreateProjectCard() {
  const navigate = useNavigate();

  const handleClick = () => {
    // 创建新项目并进入视频模块
    navigate('/video');
  };

  return (
    <button
      onClick={handleClick}
      className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] aspect-[16/10] flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-[var(--accent-primary)] hover:shadow-lg transition-all duration-200 group"
    >
      <div className="w-16 h-16 rounded-full border-2 border-[var(--border-subtle)] flex items-center justify-center group-hover:border-[var(--accent-primary)] group-hover:bg-[var(--accent-primary)]/10 transition-all duration-200">
        <Plus size={32} className="text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors" />
      </div>
      <span className="text-base font-medium text-[var(--text-primary)]">创建项目</span>
    </button>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // 处理删除
  const handleDelete = (project: Project) => {
    setSelectedProject(project);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedProject) return;
    setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
    setDeleteModalOpen(false);
    setSelectedProject(null);
  };

  // 处理重命名
  const handleRename = (project: Project) => {
    setSelectedProject(project);
    setRenameModalOpen(true);
  };

  const confirmRename = (newName: string) => {
    if (!selectedProject) return;
    setProjects(prev => prev.map(p =>
      p.id === selectedProject.id ? { ...p, name: newName } : p
    ));
    setRenameModalOpen(false);
    setSelectedProject(null);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full">
      {/* Top Navigation */}
      <AppHeader title="项目管理" showBack={false} zIndex="z-40" />

      {/* Page Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-auto">
        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Create Project Card */}
          <CreateProjectCard />

          {/* Project Cards */}
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          ))}
        </div>
      </main>

      {/* Modals */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        projectName={selectedProject?.name || ''}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setSelectedProject(null);
        }}
      />

      <RenameModal
        isOpen={renameModalOpen}
        projectName={selectedProject?.name || ''}
        onConfirm={confirmRename}
        onCancel={() => {
          setRenameModalOpen(false);
          setSelectedProject(null);
        }}
      />
    </div>
  );
}
