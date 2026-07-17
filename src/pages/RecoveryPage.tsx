import { FormEvent, useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { recoverRegistration } from '../services/registrationService';

export function RecoveryPage() {
  const navigate = useNavigate();
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [recoveryToken, setRecoveryToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const summary = await recoverRegistration(registrationNumber, recoveryToken);
      localStorage.setItem('entre-nos-registration', JSON.stringify(summary));
      sessionStorage.setItem('entre-nos-registration', JSON.stringify(summary));
      navigate('/sucesso');
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : 'Não foi possível recuperar.'); }
    finally { setLoading(false); }
  }
  return <section className="container-page py-10 sm:py-16"><form onSubmit={submit} className="mx-auto max-w-lg rounded-lg bg-white p-6 shadow-soft sm:p-8"><KeyRound className="text-primary" size={36} /><h1 className="mt-4 text-3xl font-extrabold text-dark">Recuperar inscrição</h1><p className="mt-2 leading-6 text-muted">Informe o número da compra e o código de recuperação recebido ao finalizar a inscrição.</p>{error && <p className="mt-5 rounded-md border border-error/20 bg-error/5 p-3 text-error" role="alert">{error}</p>}<label className="mt-6 block"><span className="label">Número da inscrição</span><input className="field mt-1 uppercase" value={registrationNumber} onChange={(event) => setRegistrationNumber(event.target.value)} placeholder="EN-..." required /></label><label className="mt-4 block"><span className="label">Código de recuperação</span><input className="field mt-1 uppercase" value={recoveryToken} onChange={(event) => setRecoveryToken(event.target.value)} required /></label><button className="btn-primary mt-6 w-full" disabled={loading}>{loading && <Loader2 className="animate-spin" size={18} />} Recuperar meus ingressos</button></form></section>;
}
