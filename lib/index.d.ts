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

declare const _default: (source: string, target: string, params: Partial<SharpifyParameters>) => Promise<unknown>;

declare function export_default(filePath: any): Promise<boolean>;

export { SharpifyParameters, export_default as isImage, _default as sharpify };
