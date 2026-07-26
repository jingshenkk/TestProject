export interface Project {
  id: number;
  name: string;
  coverImage?: string;
  lastUpdated: string;
  code?: string;
  status: string;
  currentPhase: number;
  contentType: string;
  aspectRatio: string;
  targetPlatform?: string | null;
  visualStyle?: string | null;
  episodeCount: number;
  episodeDurationSec: number;
}
