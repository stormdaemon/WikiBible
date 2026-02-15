import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoisted mocks to avoid "Cannot access before initialization"
const { mockSend, mockRpc } = vi.hoisted(() => {
  const mockSend = vi.fn().mockResolvedValue({ status: 200, text: 'OK' });
  const mockRpc = vi.fn();
  return { mockSend, mockRpc };
});

vi.mock('@emailjs/nodejs', () => ({
  default: { send: mockSend },
}));

vi.mock('@/utils/supabase/server', () => ({
  createPublicClient: () => ({ rpc: mockRpc }),
}));

import {
  notifyAdminsNewContribution,
  buildTemplateParams,
  getModeratorEmails,
  type ContributionNotification,
} from '../emailjs';

beforeEach(() => {
  vi.clearAllMocks();
  mockSend.mockResolvedValue({ status: 200, text: 'OK' });
  mockRpc.mockResolvedValue({
    data: 'admin1@wikibible.fr, admin2@wikibible.fr',
    error: null,
  });

  vi.stubEnv('EMAILJS_SERVICE_ID', 'service_test');
  vi.stubEnv('EMAILJS_TEMPLATE_ID', 'template_test');
  vi.stubEnv('EMAILJS_PUBLIC_KEY', 'pk_test');
  vi.stubEnv('EMAILJS_PRIVATE_KEY', 'sk_test');
});

// --- buildTemplateParams ---

describe('buildTemplateParams', () => {
  it('should build correct template params from a contribution notification', () => {
    const notification: ContributionNotification = {
      contribution_type: 'Traduction de verset',
      contributor_name: 'Jean Dupont',
      contributor_email: 'jean@example.com',
      contribution_text: 'Au commencement, Dieu créa le ciel et la terre.',
      reference: 'Genèse 1:1 (Crampon)',
    };

    const params = buildTemplateParams(notification, 'admin1@wikibible.fr, admin2@wikibible.fr');

    expect(params).toEqual({
      contribution_type: 'Traduction de verset',
      contributor_name: 'Jean Dupont',
      contributor_email: 'jean@example.com',
      contribution_text: 'Au commencement, Dieu créa le ciel et la terre.',
      reference: 'Genèse 1:1 (Crampon)',
      submitted_at: expect.stringMatching(/^\d{2}\/\d{2}\/\d{4}/),
      moderation_url: 'https://wikibible.fr/moderation',
      to_email: 'admin1@wikibible.fr, admin2@wikibible.fr',
    });
  });

  it('should truncate contribution_text if longer than 500 chars', () => {
    const longText = 'A'.repeat(600);
    const notification: ContributionNotification = {
      contribution_type: 'Annotation',
      contributor_name: 'Marie',
      contributor_email: 'marie@example.com',
      contribution_text: longText,
      reference: 'Jean 3:16',
    };

    const params = buildTemplateParams(notification, 'admin@test.fr');

    expect(params.contribution_text.length).toBeLessThanOrEqual(503);
    expect(params.contribution_text.endsWith('...')).toBe(true);
  });

  it('should use "Anonyme" when contributor_name is empty', () => {
    const notification: ContributionNotification = {
      contribution_type: 'Renvoi biblique',
      contributor_name: '',
      contributor_email: 'anon@example.com',
      contribution_text: 'Lien parallèle',
      reference: 'Mt 5:1 → Lc 6:20',
    };

    const params = buildTemplateParams(notification, 'admin@test.fr');

    expect(params.contributor_name).toBe('Anonyme');
  });
});

// --- getModeratorEmails ---

describe('getModeratorEmails', () => {
  it('should call RPC get_moderator_emails', async () => {
    const emails = await getModeratorEmails();

    expect(mockRpc).toHaveBeenCalledWith('get_moderator_emails');
    expect(emails).toBe('admin1@wikibible.fr, admin2@wikibible.fr');
  });

  it('should return empty string when RPC returns empty', async () => {
    mockRpc.mockResolvedValue({ data: '', error: null });

    const emails = await getModeratorEmails();

    expect(emails).toBe('');
  });

  it('should return empty string on supabase error', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'DB error' } });

    const emails = await getModeratorEmails();

    expect(emails).toBe('');
  });

  it('should return empty string when data is null', async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });

    const emails = await getModeratorEmails();

    expect(emails).toBe('');
  });
});

// --- notifyAdminsNewContribution ---

describe('notifyAdminsNewContribution', () => {
  it('should send email via emailjs with correct params', async () => {
    const notification: ContributionNotification = {
      contribution_type: 'Article wiki',
      contributor_name: 'Paul Martin',
      contributor_email: 'paul@example.com',
      contribution_text: 'Nouvel article sur Saint Augustin',
      reference: 'Article: Saint Augustin',
    };

    await notifyAdminsNewContribution(notification);

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(
      'service_test',
      'template_test',
      expect.objectContaining({
        contribution_type: 'Article wiki',
        contributor_name: 'Paul Martin',
        to_email: 'admin1@wikibible.fr, admin2@wikibible.fr',
        moderation_url: 'https://wikibible.fr/moderation',
      }),
      {
        publicKey: 'pk_test',
        privateKey: 'sk_test',
      }
    );
  });

  it('should not send email when no moderators found', async () => {
    mockRpc.mockResolvedValue({ data: '', error: null });

    const notification: ContributionNotification = {
      contribution_type: 'Annotation',
      contributor_name: 'Test',
      contributor_email: 'test@test.fr',
      contribution_text: 'Test',
      reference: 'Gn 1:1',
    };

    await notifyAdminsNewContribution(notification);

    expect(mockSend).not.toHaveBeenCalled();
  });

  it('should not throw when emailjs fails (fire and forget)', async () => {
    mockSend.mockRejectedValueOnce(new Error('EmailJS service down'));

    const notification: ContributionNotification = {
      contribution_type: 'Source externe',
      contributor_name: 'Pierre',
      contributor_email: 'pierre@test.fr',
      contribution_text: 'Citation des Pères',
      reference: 'Source: Saint Irénée',
    };

    await expect(notifyAdminsNewContribution(notification)).resolves.not.toThrow();
  });

  it('should not send when env vars are missing', async () => {
    vi.stubEnv('EMAILJS_SERVICE_ID', '');

    const notification: ContributionNotification = {
      contribution_type: 'Annotation',
      contributor_name: 'Test',
      contributor_email: 'test@test.fr',
      contribution_text: 'Test',
      reference: 'Gn 1:1',
    };

    await notifyAdminsNewContribution(notification);

    expect(mockSend).not.toHaveBeenCalled();
  });
});
