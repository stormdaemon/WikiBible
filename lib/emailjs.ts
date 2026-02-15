import emailjs from '@emailjs/nodejs';
import { createPublicClient } from '@/utils/supabase/server';

export interface ContributionNotification {
  contribution_type: string;
  contributor_name: string;
  contributor_email: string;
  contribution_text: string;
  reference: string;
}

interface EmailTemplateParams {
  contribution_type: string;
  contributor_name: string;
  contributor_email: string;
  contribution_text: string;
  reference: string;
  submitted_at: string;
  moderation_url: string;
  to_email: string;
}

const MODERATION_URL = 'https://wikibible.fr/moderation';
const MAX_TEXT_LENGTH = 500;

export function buildTemplateParams(
  notification: ContributionNotification,
  toEmail: string
): EmailTemplateParams {
  const now = new Date();
  const submitted_at = now.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  let text = notification.contribution_text;
  if (text.length > MAX_TEXT_LENGTH) {
    text = text.slice(0, MAX_TEXT_LENGTH) + '...';
  }

  return {
    contribution_type: notification.contribution_type,
    contributor_name: notification.contributor_name || 'Anonyme',
    contributor_email: notification.contributor_email,
    contribution_text: text,
    reference: notification.reference,
    submitted_at,
    moderation_url: MODERATION_URL,
    to_email: toEmail,
  };
}

export async function getModeratorEmails(): Promise<string> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc('get_moderator_emails');

    if (error) {
      console.error('[EmailJS] RPC get_moderator_emails error:', error);
      return '';
    }

    return data || '';
  } catch (err) {
    console.error('[EmailJS] getModeratorEmails exception:', err);
    return '';
  }
}

export async function notifyAdminsNewContribution(
  notification: ContributionNotification
): Promise<void> {
  try {
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY;

    if (!serviceId || !templateId || !publicKey || !privateKey) {
      console.warn('[EmailJS] Variables d\'environnement manquantes, notification ignorée');
      return;
    }

    const toEmail = await getModeratorEmails();
    if (!toEmail) {
      console.warn('[EmailJS] Aucun modérateur trouvé, notification ignorée');
      return;
    }

    const templateParams = buildTemplateParams(notification, toEmail);

    await emailjs.send(serviceId, templateId, templateParams, {
      publicKey,
      privateKey,
    });

    console.log('[EmailJS] Notification envoyée aux modérateurs:', toEmail);
  } catch (error) {
    console.error('[EmailJS] Erreur lors de l\'envoi:', error);
    // Fire and forget: on ne bloque pas la contribution si l'email échoue
  }
}
