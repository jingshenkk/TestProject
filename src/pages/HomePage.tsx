import TopBar from '@/components/TopBar';
import CreationInput from '@/components/CreationInput';
import RecentProjects from '@/components/RecentProjects';
import ReferenceVideos from '@/components/ReferenceVideos';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Top Navigation */}
      <TopBar />

      {/* Page Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        {/* Creation Input Area */}
        <CreationInput defaultValue="我想做一部关于西游记二创的剧本故事，聚焦与师徒四人成佛后的故事" />

        {/* Recent Projects */}
        <RecentProjects />

        {/* Reference Videos */}
        <ReferenceVideos />
      </main>
    </div>
  );
}
