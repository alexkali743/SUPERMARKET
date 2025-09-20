let fromVite;
try {
  // σε CRA το import.meta δεν υπάρχει – οπότε try/catch
  fromVite = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE)
    ? import.meta.env.VITE_API_BASE
    : undefined;
} catch (_) {
  fromVite = undefined;
}

const fromCRA = process.env.REACT_APP_API_BASE;

export const API_BASE = fromVite || fromCRA || 'http://localhost:8000';

// Διαγνωστικό log ΜΙΑ φορά για να ξέρεις τι χρησιμοποιεί:
if (!window.__API_BASE_LOGGED__) {
  // eslint-disable-next-line no-console
  console.log('[apiBase] Using API_BASE =', API_BASE, { fromVite, fromCRA });
  window.__API_BASE_LOGGED__ = true;
}