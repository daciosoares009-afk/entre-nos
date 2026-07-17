import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { env } from '../../config/env';

// eslint-disable-next-line no-unused-vars
type TurnstileApi = { render: (container: HTMLElement, options: Record<string, unknown>) => string; reset: (widgetId: string) => void; remove: (widgetId: string) => void };

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Não foi possível carregar a verificação de segurança.'));
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function TurnstileWidget({ action, onTokenChange, resetKey }: { action: 'registration' | 'sponsor'; onTokenChange: Dispatch<SetStateAction<string>>; resetKey: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string>();
  const callbackRef = useRef(onTokenChange);
  callbackRef.current = onTokenChange;

  useEffect(() => {
    let active = true;
    if (!env.turnstileSiteKey) return;
    void loadTurnstile().then(() => {
      if (!active || !containerRef.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: env.turnstileSiteKey,
        action,
        theme: 'light',
        callback: (token: string) => callbackRef.current(token),
        'expired-callback': () => callbackRef.current(''),
        'error-callback': () => callbackRef.current(''),
      });
    }).catch(() => callbackRef.current(''));
    return () => {
      active = false;
      if (widgetIdRef.current && window.turnstile) window.turnstile.remove(widgetIdRef.current);
    };
  }, [action]);

  useEffect(() => {
    if (widgetIdRef.current && window.turnstile) window.turnstile.reset(widgetIdRef.current);
    callbackRef.current('');
  }, [resetKey]);

  if (!env.turnstileSiteKey) return <p className="rounded-md border border-error/20 bg-error/5 p-3 text-sm text-error">Verificação de segurança não configurada.</p>;
  return <div ref={containerRef} className="min-h-[65px]" aria-label="Verificação de segurança Cloudflare Turnstile" />;
}
