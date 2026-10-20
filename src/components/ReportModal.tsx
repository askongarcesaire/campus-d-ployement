import React, { useState } from 'react';
import { X, ShieldAlert, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const ReportModal: React.FC = () => {
  const { reportTarget, closeReportModal } = useAuth();
  const [reason, setReason] = useState('FAKE_SCHOLARSHIP');
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!reportTarget) return null;

  const reasons = [
    { id: 'FAKE_SCHOLARSHIP', label: 'Fausse bourse ou annonce trompeuse' },
    { id: 'FRAUD', label: 'Arnaque ou demande d\'argent illégitime' },
    { id: 'SPAM', label: 'Spam ou publicité non sollicitée' },
    { id: 'HARASSMENT', label: 'Harcèlement ou propos injurieux' },
    { id: 'IMPERSONATION', label: 'Usurpation d\'identité' },
    { id: 'INAPPROPRIATE', label: 'Contenu inapproprié ou offensant' },
    { id: 'COPYRIGHT', label: 'Violation de droits d\'auteur' },
    { id: 'OTHER', label: 'Autre motif' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await api.reports.submit({
        targetType: reportTarget.type,
        targetId: reportTarget.id,
        reason,
        details
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        closeReportModal();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi du signalement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        <div className="px-5 py-4 bg-red-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h3 className="font-bold text-sm">Signaler ce contenu</h3>
          </div>
          <button
            onClick={closeReportModal}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          {success ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
              <p className="font-bold text-slate-900 text-sm">Signalement enregistré</p>
              <p className="text-xs text-slate-500">
                Notre équipe de modération universitaire examinera ce contenu avec attention.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motif principal du signalement</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                >
                  {reasons.map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Précisions utiles (facultatif)</label>
                <textarea
                  rows={3}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Décrivez brièvement le problème constaté pour aider les modérateurs..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeReportModal}
                  className="w-1/3 py-2.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {isLoading ? 'Transmission...' : 'Envoyer le signalement'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
