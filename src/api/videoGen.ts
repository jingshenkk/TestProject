import { sampleShots, videoVersions, imageAssets, type VideoGenShot, type VideoVersion, type ImageAsset } from '@/mocks/videoGen';

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function fetchVideoGenShots(): Promise<VideoGenShot[]> {
  return delay(sampleShots);
}

export function fetchVideoVersions(): Promise<VideoVersion[]> {
  return delay(videoVersions);
}

export function fetchImageAssets(): Promise<ImageAsset[]> {
  return delay(imageAssets);
}