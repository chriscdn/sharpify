import { FitEnum } from 'sharp';

type SharpifyParameters = {
  blur: number
  brightness: number
  fit: keyof FitEnum
  height: number
  normalise: boolean
  rotate: number
  saturation: number
  width: number
  withMetadata: boolean
  withoutEnlargement: boolean
}

declare function export_default(filePath: any): Promise<boolean>;

declare const _default: {
    sharpify: (source: string, target: string, params: Partial<SharpifyParameters>) => Promise<unknown>;
    isImage: typeof export_default;
};

export { _default as default };
