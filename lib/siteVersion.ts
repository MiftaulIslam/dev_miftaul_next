/**
 * Wire codec for the active site version.
 *
 * This is OBFUSCATION, NOT SECURITY. The browser has to decode the token, so
 * the key and the entire transform ship inside the public bundle — anyone who
 * opens the sources can reverse it in a minute, and nothing here should ever be
 * relied on to keep a secret. The only goal is that the public config response
 * reads as meaningless noise in the Network tab and cannot be pattern-matched
 * across reloads, since a fresh nonce changes every byte on every request.
 *
 * Dependency-free and DOM-free on purpose: the route handler and the client
 * store both import this module.
 */

export type SiteVersion = "v1" | "v2";

export const SITE_VERSIONS: readonly SiteVersion[] = ["v1", "v2"];

export const DEFAULT_SITE_VERSION: SiteVersion = "v1";

/** Opaque path — nothing in the URL hints at what it answers. */
export const SITE_CONFIG_ENDPOINT = "/api/public/cfg";

/** Envelope key carrying the real token. Its siblings are decoys. */
const TOKEN_KEY = "sg";

/** Public by design — see the file header. */
const KEY_SEED = "9f4b2ac1-shell";

/** Stamps a decoded payload as ours so garbage decodes to the default. */
const MARKER = 0x5a;

/** Deliberately not 1 and 2 — the raw bytes should carry no meaning either. */
const CODES: Record<SiteVersion, number> = { v1: 0x37, v2: 0x9b };

const NONCE_BYTES = 4;
const FILLER_BYTES = 3;
/** marker + code + filler + checksum */
const PAYLOAD_BYTES = 2 + FILLER_BYTES + 1;
const TOKEN_BYTES = NONCE_BYTES + PAYLOAD_BYTES;

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

export function coerceSiteVersion(value: unknown): SiteVersion {
  return SITE_VERSIONS.includes(value as SiteVersion) ? (value as SiteVersion) : DEFAULT_SITE_VERSION;
}

function encodeBase64Url(bytes: Uint8Array): string {
  let out = "";

  for (let i = 0; i < bytes.length; i += 3) {
    const chunk = (bytes[i] << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    const remaining = bytes.length - i;

    out += ALPHABET[(chunk >> 18) & 63];
    out += ALPHABET[(chunk >> 12) & 63];
    if (remaining > 1) out += ALPHABET[(chunk >> 6) & 63];
    if (remaining > 2) out += ALPHABET[chunk & 63];
  }

  return out;
}

function decodeBase64Url(text: string): Uint8Array | null {
  const length = Math.floor((text.length * 3) / 4);
  const out = new Uint8Array(length);
  let buffer = 0;
  let bits = 0;
  let written = 0;

  for (let i = 0; i < text.length; i += 1) {
    const value = ALPHABET.indexOf(text[i]);
    if (value < 0) return null;

    buffer = (buffer << 6) | value;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      out[written] = (buffer >> bits) & 0xff;
      written += 1;
    }
  }

  return written === length ? out : null;
}

function mix(hash: number, byte: number): number {
  return Math.imul((hash ^ byte) >>> 0, 0x01000193) >>> 0;
}

/** FNV-1a walk over nonce + seed. Cheap and reversible-by-anyone, which is the point. */
function keystream(nonce: Uint8Array, length: number): Uint8Array {
  let hash = 0x811c9dc5;
  for (let i = 0; i < nonce.length; i += 1) hash = mix(hash, nonce[i]);
  for (let i = 0; i < KEY_SEED.length; i += 1) hash = mix(hash, KEY_SEED.charCodeAt(i) & 0xff);

  const out = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) {
    hash = mix(hash, i + 1);
    out[i] = (hash >>> 24) & 0xff;
  }

  return out;
}

/** Math.random is fine here: the nonce only has to vary, not to be unguessable. */
function randomBytes(length: number): Uint8Array {
  const out = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) out[i] = Math.floor(Math.random() * 256);
  return out;
}

/**
 * Pure: the same version and nonce always produce the same token, so tests can
 * pin the output. Production callers omit the nonce and get a fresh one.
 */
export function encodeVersion(version: SiteVersion, nonce?: Uint8Array): string {
  const seed = nonce && nonce.length === NONCE_BYTES ? nonce : randomBytes(NONCE_BYTES);
  const stream = keystream(seed, PAYLOAD_BYTES + FILLER_BYTES);

  const payload = new Uint8Array(PAYLOAD_BYTES);
  payload[0] = MARKER;
  payload[1] = CODES[coerceSiteVersion(version)];
  // Filler rides the same stream so the token stays a pure function of the nonce.
  for (let i = 0; i < FILLER_BYTES; i += 1) payload[2 + i] = stream[PAYLOAD_BYTES + i];

  let checksum = 0;
  for (let i = 0; i < PAYLOAD_BYTES - 1; i += 1) checksum = (checksum + payload[i]) & 0xff;
  payload[PAYLOAD_BYTES - 1] = checksum;

  const token = new Uint8Array(TOKEN_BYTES);
  token.set(seed, 0);
  for (let i = 0; i < PAYLOAD_BYTES; i += 1) token[NONCE_BYTES + i] = payload[i] ^ stream[i];

  return encodeBase64Url(token);
}

/** Total by contract: anything malformed resolves to the default version. */
export function decodeVersion(token: unknown): SiteVersion {
  if (typeof token !== "string" || !token) return DEFAULT_SITE_VERSION;

  const raw = decodeBase64Url(token);
  if (!raw || raw.length !== TOKEN_BYTES) return DEFAULT_SITE_VERSION;

  const stream = keystream(raw.subarray(0, NONCE_BYTES), PAYLOAD_BYTES + FILLER_BYTES);
  const payload = new Uint8Array(PAYLOAD_BYTES);
  for (let i = 0; i < PAYLOAD_BYTES; i += 1) payload[i] = raw[NONCE_BYTES + i] ^ stream[i];

  if (payload[0] !== MARKER) return DEFAULT_SITE_VERSION;

  let checksum = 0;
  for (let i = 0; i < PAYLOAD_BYTES - 1; i += 1) checksum = (checksum + payload[i]) & 0xff;
  if (checksum !== payload[PAYLOAD_BYTES - 1]) return DEFAULT_SITE_VERSION;

  const match = SITE_VERSIONS.find((candidate) => CODES[candidate] === payload[1]);
  return match ?? DEFAULT_SITE_VERSION;
}

/** Same length and alphabet as a real token, so shape gives nothing away. */
function decoyToken(): string {
  return encodeBase64Url(randomBytes(TOKEN_BYTES));
}

/**
 * The wire shape lives here rather than in the route so the two sides cannot
 * drift. Field order is shuffled per request so the real key is not simply the
 * middle one every time.
 */
export function buildSiteConfigEnvelope(version: SiteVersion): Record<string, unknown> {
  const slots: Array<[string, string]> = [
    ["ch", decoyToken()],
    [TOKEN_KEY, encodeVersion(version)],
    ["px", decoyToken()],
  ];

  for (let i = slots.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [slots[i], slots[j]] = [slots[j], slots[i]];
  }

  const envelope: Record<string, unknown> = { ts: Date.now(), ttl: 45 };
  for (const [key, value] of slots) envelope[key] = value;
  return envelope;
}

/** Total: an unexpected body resolves to the default version. */
export function readSiteConfigEnvelope(payload: unknown): SiteVersion {
  if (!payload || typeof payload !== "object") return DEFAULT_SITE_VERSION;
  return decodeVersion((payload as Record<string, unknown>)[TOKEN_KEY]);
}
