import { useNavigate } from 'react-router-dom';
import TopBar from '@/components/TopBar';
import ProjectCreationWizard from '@/components/ProjectStartWizardV3';
import RecentProjects from '@/components/RecentProjects';
import ReferenceVideos from '@/components/ReferenceVideos';
import { setSelectedProject } from '@/stores/selectedProject';

export default function UnifiedHomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <TopBar />
      <main className="home-main flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="home-content-frame">
          <ProjectCreationWizard onCreated={(project) => {
            setSelectedProject(project);
            navigate('/projects/' + project.id + '/script', { state: { project } });
          }} />
          <div className="mt-10">
            <RecentProjects />
            <ReferenceVideos />
          </div>
        </div>
      </main>
    </div>
  );
}
