/* tslint:disable */
/* eslint-disable */

/**
 * Sample position for subsampled chroma
 */
export enum ChromaSamplePosition {
  /**
   * The source video transfer function must be signaled
   * outside the AV1 bitstream.
   */
  Unknown = 0,
  /**
   * Horizontally co-located with (0, 0) luma sample, vertically positioned
   * in the middle between two luma samples.
   */
  Vertical = 1,
  /**
   * Co-located with (0, 0) luma sample.
   */
  Colocated = 2,
}

/**
 * Chroma subsampling format
 */
export enum ChromaSampling {
  /**
   * Both vertically and horizontally subsampled.
   */
  Cs420 = 0,
  /**
   * Horizontally subsampled.
   */
  Cs422 = 1,
  /**
   * Not subsampled.
   */
  Cs444 = 2,
  /**
   * Monochrome.
   */
  Cs400 = 3,
}

/**
 * Allowed pixel value range
 *
 * C.f. `VideoFullRangeFlag` variable specified in ISO/IEC 23091-4/ITU-T H.273
 */
export enum PixelRange {
  /**
   * Studio swing representation
   */
  Limited = 0,
  /**
   * Full swing representation
   */
  Full = 1,
}

export enum Tune {
  Psnr = 0,
  Psychovisual = 1,
}

/**
 * Decode a QR code from base64-encoded image data
 */
export function decode_qr_code_base64(image_data: string): string;

/**
 * Generate a QR code as a base64-encoded PNG data URL
 */
export function generate_qr_code_base64(data: string): string;

/**
 * Generate a random secret for TOTP
 */
export function generate_secret(): string;

/**
 * Generate a TOTP token from a secret
 */
export function generate_token(secret: string): string;

/**
 * Generate a TOTP URI for QR code generation
 */
export function generate_totp_uri(secret: string, label: string, issuer: string): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly generate_secret: () => [number, number];
  readonly generate_token: (a: number, b: number) => [number, number, number, number];
  readonly generate_qr_code_base64: (a: number, b: number) => [number, number, number, number];
  readonly generate_totp_uri: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
  readonly decode_qr_code_base64: (a: number, b: number) => [number, number, number, number];
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
