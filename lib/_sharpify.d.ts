import { FitEnum } from "sharp";
export type SharpifyParameters = {
    blur: number;
    brightness: number;
    fit: keyof FitEnum;
    height: number;
    rotate: number;
    saturation: number;
    width: number;
    withMetadata: boolean;
    withoutEnlargement: boolean;
};
export declare const sharpifyIt: (source: string, target: string, args: SharpifyParameters) => Promise<string>;
