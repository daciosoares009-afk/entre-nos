import { FormEvent, useState } from 'react';
import { Loader2, LogIn } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export function StaffLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  if (!supabase) return <Navigate to="/" replace />;

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError('');
    const { error: signInError } = await supabase!.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) { setError('E-mail ou senha inválidos.'); return; }
    navigate('/equipe/check-in', { replace: true });
  }

  return (
    <section className="container-page py-10 sm:py-16">
      <form onSubmit={submit} className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-soft sm:p-8">
        <p className="text-sm font-bold uppercase tracking-wide text-primary">Área restrita</p>
        <h1 className="mt-2 text-3xl font-extrabold text-dark">Login da equipe</h1>
        <p className="mt-2 leading-6 text-muted">Acesso exclusivo para validação dos ingressos na entrada.</p>
        {error && <p className="mt-4 rounded-md border border-error/20 bg-error/5 p-3 text-sm text-error" role="alert">{error}</p>}
        <label className="mt-6 block"><span className="label">E-mail</span><input className="field mt-1" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label className="mt-4 block"><span className="label">Senha</span><input className="field mt-1" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        <button className="btn-primary mt-6 w-full" disabled={loading}>{loading ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />} Entrar</button>
      </form>
    </section>
  );
}
