import sharp, { FitEnum } from 'sharp';

type SharpifyParameters = {
    blur: number;
    brightness: number;
    fit: keyof FitEnum;
    rotate: number;
    saturation: number;
    height?: number;
    width?: number;
    withMetadata: boolean;
    withoutEnlargement: boolean;
};
declare const concurrency: typeof sharp.concurrency;

/**
 * @param source The source file path.
 * @param target The destination file path.
 * @param params Sharp parameters.
 * @returns
 */
declare const sharpify: (source: string, target: string, params: Partial<SharpifyParameters>) => Promise<string>;

declare const isImage: (filePath: string) => Promise<boolean>;

export { type SharpifyParameters, isImage, concurrency as sharpConcurrency, sharpify };
