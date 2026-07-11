export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// One-time nonce cookie that binds an OAuth login to the browser that started
// it. The `__Host-` prefix forces the cookie host-only (Secure, Path=/, no
// Domain), so a sibling *.manus.space site cannot plant a matching value in a
// victim's browser.
export const OAUTH_STATE_COOKIE = "__Host-oauth_state";

// `state` carries the callback redirect URI (used at token exchange) plus the
// CSRF nonce. Defined here so the client encoder and server decoder never drift.
export type OAuthState = { redirectUri: string; nonce?: string };

export const encodeOAuthState = (state: OAuthState): string =>
  btoa(JSON.stringify(state));

export const decodeOAuthState = (state: string): OAuthState => {
  let decoded: string;
  try {
    decoded = atob(state);
  } catch {
    // Malformed base64 (e.g. attacker-supplied garbage). Return no nonce so the
    // callback's CSRF guard rejects it with 403 — never throw, since the caller
    // runs outside the request handler's try/catch.
    return { redirectUri: "" };
  }
  try {
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed.redirectUri === "string") return parsed;
  } catch {
    // Legacy links: `state` was a bare base64(redirectUri) with no nonce.
  }
  return { redirectUri: decoded };
};

export const HELMET_COLORS = [
  { id: "1", name: "Blanco", hex: "#FFFFFF" },
  { id: "2", name: "Amarillo", hex: "#FFFF00" },
  { id: "3", name: "Azul", hex: "#0000FF" },
  { id: "4", name: "Verde", hex: "#008000" },
  { id: "5", name: "Rojo", hex: "#FF0000" },
  { id: "6", name: "Naranja", hex: "#FFA500" },
  { id: "7", name: "Gris", hex: "#808080" },
  { id: "8", name: "Marrón", hex: "#A52A2A" },
  { id: "9", name: "Dorado", hex: "#FFD700" },
];

export const PRODUCT_NAMES = {
  JOCKEY: "Casco Jockey I",
  MINERO: "Casco Minero",
  MASCARILLA: "Mascarillas Tipo AS",
  ARANAS: "Arañas",
  CORREAS: "Correas",
};
