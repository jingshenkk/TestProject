import { sampleShots } from '@/mocks/storyboardShots';
import type { Shot } from '@/components/ShotCard';

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function fetchStoryboardShots(): Promise<Shot[]> {
  return delay(sampleShots);
}