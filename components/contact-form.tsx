'use client';

import React, { useState, useTransition } from 'react';

interface ContactFormProps {
  userEmail: string;
  userName: string;
}

export function ContactForm({ userEmail, userName }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: userName,
    email: userEmail,
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitResult({ success: true, message: 'Message envoyé avec succès ! Nous vous répondrons rapidement.' });
        setFormData({ ...formData, subject: '', message: '' });
      } else {
        setSubmitResult({ success: false, message: result.error || 'Erreur lors de l\'envoi du message.' });
      }
    } catch (error) {
      setSubmitResult({ success: false, message: 'Erreur de connexion. Veuillez réessayer.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nom */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      {/* Sujet */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Sujet
        </label>
        <select
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        >
          <option value="">Sélectionnez un sujet</option>
          <option value="bug">🐛 Signaler un bug</option>
          <option value="suggestion">💡 Suggestion d'amélioration</option>
          <option value="question">❓ Question</option>
          <option value="contribution">📝 Proposition de contribution</option>
          <option value="other">📧 Autre</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message
        </label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Décrivez votre question, suggestion ou le bug rencontré..."
          required
        />
      </div>

      {/* Submit button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium text-lg"
      >
        {isSubmitting ? 'Envoi en cours...' : '📤 Envoyer le message'}
      </button>

      {/* Result message */}
      {submitResult && (
        <div
          className={`p-4 rounded-lg ${
            submitResult.success
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {submitResult.message}
        </div>
      )}
    </form>
  );
}
