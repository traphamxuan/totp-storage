/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const generate_secret: () => [number, number];
export const generate_token: (a: number, b: number) => [number, number, number, number];
export const generate_qr_code_base64: (a: number, b: number) => [number, number, number, number];
export const generate_totp_uri: (a: number, b: number, c: number, d: number, e: number, f: number) => [number, number];
export const decode_qr_code_base64: (a: number, b: number) => [number, number, number, number];
export const __wbindgen_exn_store: (a: number) => void;
export const __externref_table_alloc: () => number;
export const __wbindgen_externrefs: WebAssembly.Table;
export const __wbindgen_free: (a: number, b: number, c: number) => void;
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
export const __externref_table_dealloc: (a: number) => void;
export const __wbindgen_start: () => void;
