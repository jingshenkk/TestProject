import { sampleCharacters, sampleScenes, sampleProps, getSampleAssets } from '@/mocks/assets';
import type { Asset, Character, Scene, Prop } from '@/types/asset';

function delay<T>(value: T, ms = 120): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function fetchCharacters(): Promise<Character[]> {
  return delay(sampleCharacters);
}

export function fetchScenes(): Promise<Scene[]> {
  return delay(sampleScenes);
}

export function fetchProps(): Promise<Prop[]> {
  return delay(sampleProps);
}

export function fetchAssets(kind: Asset['kind']): Promise<Asset[]> {
  return delay(getSampleAssets(kind));
}