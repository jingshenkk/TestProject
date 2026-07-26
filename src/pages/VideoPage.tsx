import VideoTopBar from '@/components/VideoTopBar';
import ProcessStepBar from '@/components/ProcessStepBar';
import CreationInput from '@/components/CreationInput';
import ScriptSettings from '@/components/ScriptSettings';
import GenerateButtons from '@/components/GenerateButtons';
import EpisodeList from '@/components/EpisodeList';

export default function VideoPage() {
  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Top Navigation - Video Page Version */}
      <VideoTopBar
        title="三体2 终极之战"
        progress={14}
        subtitle="角色三视图"
      />

      {/* Page Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        {/* Process Steps */}
        <ProcessStepBar />

        {/* Creation Input Area */}
        <CreationInput
          options={{
            type: '短剧-神话故事',
            style: '视觉风格',
            format: '竖屏（9:16）12集 · 120s',
            model: 'ChatGPT',
          }}
          containerClassName="mb-6"
        />

        {/* Script Settings */}
        <ScriptSettings />

        {/* Generate Buttons */}
        <GenerateButtons />

        {/* Episode List */}
        <EpisodeList />
      </main>
    </div>
  );
}
