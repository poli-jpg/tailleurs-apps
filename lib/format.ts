export function fcfa(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n).replace(/\u202f|\u00a0/g, ' ') + ' F';
}

/** Date du jour au format AAAA-MM-JJ (Dakar = UTC) */
export function aujourdhui() {
  return new Date().toISOString().slice(0, 10);
}

export function dansNJours(n: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function dateCourte(iso: string | null) {
  if (!iso) return 'Sans date';
  const d = new Date(iso + 'T12:00:00Z');
  return new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(d);
}

export function joursRestants(iso: string | null, ref: string) {
  if (!iso) return null;
  const diff = (Date.parse(iso) - Date.parse(ref)) / 86_400_000;
  return Math.round(diff);
}

export function initiales(nom: string) {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0]!.toUpperCase())
    .join('');
}

/** Numéro sénégalais → format international pour wa.me */
export function numeroInternational(tel: string | null) {
  if (!tel) return null;
  let n = tel.replace(/\D/g, '');
  if (n.startsWith('00')) n = n.slice(2);
  if (n.length === 9) n = '221' + n;
  return n.length >= 11 ? n : null;
}

export function lienWhatsApp(tel: string | null, message: string) {
  const n = numeroInternational(tel);
  if (!n) return null;
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

export function entier(v: FormDataEntryValue | null) {
  const n = parseInt(String(v ?? '').replace(/\D/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
}

export function texte(v: FormDataEntryValue | null) {
  const s = String(v ?? '').trim();
  return s.length ? s : null;
}
