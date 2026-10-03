// Contenu de l'assistant d'aide. Pour ajouter une question : copie un bloc et modifie-le.
export type Sujet = {
  id: string;
  question: string;
  intro: string;
  etapes?: string[];
  astuce?: string;
  action?: { label: string; href: string };
};

export const SUJETS: Sujet[] = [
  {
    id: 'client',
    question: 'Comment ajouter un client ?',
    intro: 'Pour enregistrer un nouveau client :',
    etapes: [
      'Touchez « Clients » en bas de l’écran.',
      'Touchez « Ajouter un client ».',
      'Écrivez son nom, son téléphone, et choisissez Homme ou Femme.',
      'Touchez « Ajouter et prendre les mesures ».',
    ],
    astuce: 'Vous pouvez aussi créer le client directement en faisant une nouvelle commande.',
    action: { label: 'Aller aux clients', href: '/clients' },
  },
  {
    id: 'mesures',
    question: 'Comment prendre les mesures ?',
    intro: 'Les mesures sont sur la fiche de chaque client :',
    etapes: [
      'Touchez « Clients » en bas, puis le nom du client.',
      'Restez sur l’onglet « Mesures ».',
      'Touchez une case et tapez la mesure en centimètres.',
      'Touchez « Enregistrer les mesures » en bas.',
    ],
    astuce: 'Les mesures restent enregistrées : quand le client revient, vous les retrouvez tout de suite.',
    action: { label: 'Aller aux clients', href: '/clients' },
  },
  {
    id: 'commande',
    question: 'Comment créer une commande ?',
    intro: 'Quand un client vous apporte un tissu :',
    etapes: [
      'Touchez le bouton orange « + » en bas.',
      'Choisissez le client dans la liste (ou « Nouveau client »).',
      'Écrivez le modèle et ajoutez les photos du tissu et du modèle.',
      'Mettez la date de livraison, le prix et l’acompte reçu.',
      'Touchez « Enregistrer la commande ».',
    ],
    action: { label: 'Nouvelle commande', href: '/commandes/nouvelle' },
  },
  {
    id: 'statut',
    question: 'Comment changer l’étape d’une commande ?',
    intro: 'Pour dire où en est une tenue :',
    etapes: [
      'Sur l’accueil, touchez la commande.',
      'Touchez l’étape voulue : Coupe, Couture, Prête ou Livrée.',
    ],
    astuce: 'Vous pouvez sauter directement à « Prête », et revenir en arrière en cas d’erreur.',
    action: { label: 'Voir mes commandes', href: '/' },
  },
  {
    id: 'whatsapp',
    question: 'Comment prévenir mon client sur WhatsApp ?',
    intro: 'Quand la tenue est prête :',
    etapes: [
      'Ouvrez la commande et passez-la à « Prête ».',
      'Touchez le bouton vert « Prévenir sur WhatsApp ».',
      'WhatsApp s’ouvre avec le message déjà écrit : touchez Envoyer.',
    ],
    astuce: 'Le numéro du client doit être enregistré sur sa fiche.',
    action: { label: 'Voir mes commandes', href: '/' },
  },
  {
    id: 'argent',
    question: 'Comment encaisser le reste à payer ?',
    intro: 'Quand le client vous donne de l’argent :',
    etapes: [
      'Ouvrez la commande.',
      'Dans « Reste à payer », tapez le montant reçu.',
      'Touchez « Encaisser ».',
    ],
    astuce: 'Le reste se met à jour tout seul, et le total « Reste à encaisser » de l’accueil aussi.',
    action: { label: 'Voir mes commandes', href: '/' },
  },
  {
    id: 'retard',
    question: 'Que veut dire « En retard » ?',
    intro:
      'Une commande passe « En retard » toute seule quand sa date de livraison est dépassée et qu’elle n’est pas encore « Prête ». Dès que vous la passez à « Prête », l’alerte disparaît.',
    action: { label: 'Voir les retards', href: '/?filtre=retard' },
  },
  {
    id: 'photos',
    question: 'Comment ajouter une photo ?',
    intro: 'Dans une nouvelle commande, touchez « Photo du tissu » ou « Photo du modèle ». Vous pouvez prendre une photo ou en choisir une dans votre galerie.',
    astuce: 'Attendez le petit ✓ avant d’enregistrer la commande.',
  },
  {
    id: 'compte',
    question: 'Changer mon mot de passe ou mon numéro',
    intro: 'Touchez l’icône ronde en haut à droite de l’accueil pour ouvrir « Mon compte ». Vous pouvez y changer le nom de l’atelier, le téléphone, l’e-mail et le mot de passe.',
    action: { label: 'Ouvrir Mon compte', href: '/compte' },
  },
  {
    id: 'abonnement',
    question: 'Mon abonnement',
    intro: 'La date de fin de votre abonnement est dans « Mon compte ». Pour le renouveler, écrivez-nous sur WhatsApp : votre accès est prolongé dans la journée.',
    action: { label: 'Ouvrir Mon compte', href: '/compte' },
  },
  {
    id: 'installer',
    question: 'Mettre l’appli sur mon écran d’accueil',
    intro: 'Pour l’ouvrir comme une vraie application :',
    etapes: [
      'iPhone : dans Safari, touchez Partager puis « Sur l’écran d’accueil ».',
      'Android : dans Chrome, touchez ⋮ puis « Ajouter à l’écran d’accueil ».',
    ],
  },
];
