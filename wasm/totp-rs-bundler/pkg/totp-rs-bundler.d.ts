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
