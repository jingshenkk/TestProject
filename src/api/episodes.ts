import { episodes, episodeContent, type Episode, type EpisodeContent } from '@/mocks/episodes';

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function fetchEpisodes(): Promise<Episode[]> {
  return delay(episodes);
}

export function fetchEpisodeContent(): Promise<EpisodeContent> {
  return delay(episodeContent);
}