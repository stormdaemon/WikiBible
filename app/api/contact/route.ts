import { NextRequest, NextResponse } from 'next/server';

const CONTACT_EMAIL = 'œuvrecatholiquefrance@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Mapping des sujets
    const subjectLabels: Record<string, string> = {
      bug: '🐛 Signalement de bug',
      suggestion: '💡 Suggestion',
      question: '❓ Question',
      contribution: '📝 Proposition de contribution',
      other: '📧 Autre demande',
    };

    const emailSubject = `[WikiCatholic] ${subjectLabels[subject] || subject} - de ${name}`;

    // Charger Resend uniquement si la clé API est disponible
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      console.error('RESEND_API_KEY non configurée');
      // En dev, on log seulement
      if (process.env.NODE_ENV === 'development') {
        console.log('=== EMAIL DE CONTACT ===');
        console.log('De:', email);
        console.log('Sujet:', emailSubject);
        console.log('Message:', message);
        return NextResponse.json({ success: true });
      }
      return NextResponse.json(
        { success: false, error: 'Service de messagerie non configuré' },
        { status: 500 }
      );
    }

    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          Nouveau message de contact
        </h2>

        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Nom :</strong> ${name}</p>
          <p><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Sujet :</strong> ${subjectLabels[subject] || subject}</p>
        </div>

        <h3 style="color: #1f2937;">Message :</h3>
        <div style="background: #ffffff; border: 1px solid #e5e7eb; padding: 15px; border-radius: 8px; white-space: pre-wrap;">
          ${message}
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
          <p>Ce message a été envoyé depuis le formulaire de contact de WikiCatholic</p>
        </div>
      </div>
    `;

    // Envoyer l'email
    await resend.emails.send({
      from: 'WikiCatholic <contact@wikibible.dev>',
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: emailSubject,
      html: emailHtml,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}
