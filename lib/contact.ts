// Ton numéro WhatsApp, format international sans + ni espaces (ex. 221771234567)
export const CONTACT_WHATSAPP = '221784653251';

// Prix affiché aux tailleurs
export const PRIX_MENSUEL = '5 000 F / mois';

export function lienContact(message: string) {
  return `https://wa.me/${CONTACT_WHATSAPP}?text=${encodeURIComponent(message)}`;
}
