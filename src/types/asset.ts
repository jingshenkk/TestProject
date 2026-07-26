// 资产领域类型（角色 / 场景 / 道具）
// 统一从本文件导入，解除组件层 → 页面层的反向依赖。
// 使用 `kind` 判别字段构成可区分联合，便于按类型安全收窄分发。

export type AssetKind = 'character' | 'scene' | 'prop';

export interface AssetImage {
  id: string;
  name: string;
  url?: string;
  hasImage: boolean;
}

export interface AssetVersion {
  id: string;
  name: string;
  isCurrent: boolean;
}

export interface AssetBase {
  id: string;
  code: string;
  name: string;
  description: string;
  imageUrl?: string;
  hasImage: boolean;
  totalVersions: number;
  currentVersion: number;
  kind: AssetKind;
}

export interface CharacterDetails {
  intro: string;
  relatedShots: string[];
  fields: {
    type: string;
    name: string;
    function: string;
    gender: string;
    age: number;
    height: number;
    bodyType: string;
    arc: string;
    hairstyle: string;
  };
  images: AssetImage[];
  versions: AssetVersion[];
}

export interface Character extends AssetBase {
  kind: 'character';
  details?: CharacterDetails;
}

export interface Scene extends AssetBase {
  kind: 'scene';
}

export interface Prop extends AssetBase {
  kind: 'prop';
}

export type Asset = Character | Scene | Prop;