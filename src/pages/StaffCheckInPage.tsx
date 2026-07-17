import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, LogOut, Search, ShieldX } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { checkInTicket, type CheckInResult } from '../services/checkInService';
import { supabase } from '../services/supabase';

export function StaffCheckInPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { void supabase?.auth.getSession().then(({ data }) => { setAuthenticated(Boolean(data.session)); setCheckingSession(false); }); }, []);
  if (!supabase) return <Navigate to="/" replace />;
  if (checkingSession) return <div className="container-page flex min-h-[50vh] items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!authenticated) return <Navigate to="/equipe/login" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError(''); setResult(null);
    try { setResult(await checkInTicket(code)); } catch (submitError) { setError(submitError instanceof Error ? submitError.message : 'Falha no check-in.'); }
    finally { setLoading(false); }
  }
  const accepted = result?.result === 'accepted';
  const messages = { accepted: 'ENTRADA AUTORIZADA', already_used: 'INGRESSO JÁ UTILIZADO', unpaid: 'PAGAMENTO NÃO CONFIRMADO', not_found: 'INGRESSO NÃO ENCONTRADO' };
  return (
    <section className="container-page py-8 sm:py-12">
      <div className="mx-auto max-w-xl rounded-lg bg-white p-5 shadow-soft sm:p-8">
        <div className="flex items-start justify-between gap-4"><div><p className="text-sm font-bold uppercase text-primary">Equipe</p><h1 className="mt-1 text-3xl font-extrabold text-dark">Validar ingresso</h1></div><button className="btn-secondary !px-3" onClick={() => void supabase!.auth.signOut().then(() => setAuthenticated(false))} aria-label="Sair"><LogOut size={18} /></button></div>
        <p className="mt-3 leading-6 text-muted">Leia o código no ingresso ou cole o código informado abaixo.</p>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row"><input className="field flex-1 uppercase" value={code} onChange={(event) => setCode(event.target.value)} placeholder="EN-..." required autoFocus /><button className="btn-primary" disabled={loading}>{loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />} Validar</button></form>
        {error && <p className="mt-5 rounded-md border border-error/20 bg-error/5 p-4 text-error" role="alert">{error}</p>}
        {result && <div className={`mt-6 rounded-lg border-2 p-6 text-center ${accepted ? 'border-success bg-success/10 text-success' : 'border-error bg-error/5 text-error'}`} role="status">{accepted ? <CheckCircle2 className="mx-auto" size={56} /> : <ShieldX className="mx-auto" size={56} />}<p className="mt-3 text-2xl font-extrabold">{messages[result.result]}</p>{result.holder_name && <p className="mt-2 text-lg font-bold">{result.holder_name}</p>}{result.checked_in_at && result.result === 'already_used' && <p className="mt-2 text-sm">Uso anterior: {new Date(result.checked_in_at).toLocaleString('pt-BR')}</p>}</div>}
      </div>
    </section>
  );
}
