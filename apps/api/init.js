// Satori fix for Workers environment - MUST BE AT ABSOLUTE TOP
// @ts-ignore
globalThis.process = { env: { NODE_ENV: 'production' } };
