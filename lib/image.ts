/**
 * Réduit une photo dans le navigateur avant l'envoi :
 * 1600 px maximum sur le plus grand côté, JPEG qualité 0,8.
 * Une photo de téléphone de 4 à 10 Mo passe à environ 200 à 400 Ko,
 * toujours bien nette pour voir un tissu ou un modèle.
 */
const COTE_MAX = 1600;
const QUALITE = 0.8;

async function decoder(fichier: File): Promise<{ source: CanvasImageSource; largeur: number; hauteur: number; liberer: () => void }> {
  // createImageBitmap respecte l'orientation de la photo (portrait / paysage)
  if ('createImageBitmap' in window) {
    try {
      const bmp = await createImageBitmap(fichier, { imageOrientation: 'from-image' });
      return { source: bmp, largeur: bmp.width, hauteur: bmp.height, liberer: () => bmp.close() };
    } catch {
      /* on essaie avec une balise image */
    }
  }
  const url = URL.createObjectURL(fichier);
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  await img.decode();
  return { source: img, largeur: img.naturalWidth, hauteur: img.naturalHeight, liberer: () => URL.revokeObjectURL(url) };
}

export async function compresserImage(fichier: File): Promise<{ blob: Blob; type: string; ext: string }> {
  try {
    const { source, largeur, hauteur, liberer } = await decoder(fichier);
    const ratio = Math.min(1, COTE_MAX / Math.max(largeur, hauteur));
    const w = Math.round(largeur * ratio);
    const h = Math.round(hauteur * ratio);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('canvas');
    ctx.fillStyle = '#ffffff'; // fond blanc pour les PNG transparents
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(source, 0, 0, w, h);
    liberer();

    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', QUALITE));
    if (blob && blob.size < fichier.size) return { blob, type: 'image/jpeg', ext: 'jpg' };
  } catch {
    /* format non lisible par le navigateur : on envoie l'original */
  }
  const ext = (fichier.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  return { blob: fichier, type: fichier.type || 'image/jpeg', ext };
}
