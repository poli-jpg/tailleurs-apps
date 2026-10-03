'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { SUJETS, type Sujet } from '@/lib/aide';
import { lienContact } from '@/lib/contact';

type Message = { de: 'moi' | 'aide'; sujet?: Sujet; texte?: string };

const BIENVENUE: Message = { de: 'aide', texte: 'Bonjour ! Je suis là pour vous aider. Touchez une question :' };

export function AideChat() {
  const [ouvert, setOuvert] = useState(false);
  const [messages, setMessages] = useState<Message[]>([BIENVENUE]);
  const [ecrit, setEcrit] = useState(false);
  const fil = useRef<HTMLDivElement>(null);
  const fermer = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fil.current?.scrollTo({ top: fil.current.scrollHeight, behavior: 'smooth' });
  }, [messages, ecrit]);

  useEffect(() => {
    if (!ouvert) return;
    fermer.current?.focus();
    const echap = (e: KeyboardEvent) => e.key === 'Escape' && setOuvert(false);
    window.addEventListener('keydown', echap);
    return () => window.removeEventListener('keydown', echap);
  }, [ouvert]);

  function demander(s: Sujet) {
    if (ecrit) return;
    setMessages((m) => [...m, { de: 'moi', texte: s.question }]);
    setEcrit(true);
    setTimeout(() => {
      setMessages((m) => [...m, { de: 'aide', sujet: s }]);
      setEcrit(false);
    }, 550);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        aria-label="Aide"
        className="fixed right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-encre text-white shadow-lg"
        style={{ bottom: 'calc(96px + env(safe-area-inset-bottom))' }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z" />
          <path d="M9.6 9.2a2.5 2.5 0 0 1 4.8 1c0 1.6-2.4 2-2.4 3.3" />
          <circle cx="12" cy="16.6" r=".6" fill="currentColor" />
        </svg>
      </button>

      {ouvert && (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-[rgba(20,26,51,0.45)]" onClick={() => setOuvert(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Aide"
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-fond"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="flex items-center justify-between bg-encre px-5 py-4 text-white">
              <div className="flex flex-col">
                <span className="font-titre text-lg font-bold">Aide</span>
                <span className="text-xs text-[#C9D0E8]">Réponses immédiates</span>
              </div>
              <button ref={fermer} type="button" onClick={() => setOuvert(false)} aria-label="Fermer l’aide" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#3A4778]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <div ref={fil} className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4" aria-live="polite">
              {messages.map((m, i) =>
                m.de === 'moi' ? (
                  <p key={i} className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-encre px-3.5 py-2.5 text-[15px] text-white">{m.texte}</p>
                ) : (
                  <div key={i} className="flex max-w-[92%] flex-col gap-2 self-start rounded-2xl rounded-bl-md border border-ligne bg-white px-3.5 py-3 text-[15px]">
                    {m.texte && <p>{m.texte}</p>}
                    {m.sujet && (
                      <>
                        <p>{m.sujet.intro}</p>
                        {m.sujet.etapes && (
                          <ol className="flex flex-col gap-1.5">
                            {m.sujet.etapes.map((e, k) => (
                              <li key={k} className="flex gap-2.5">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pale text-xs font-bold text-encre">{k + 1}</span>
                                <span>{e}</span>
                              </li>
                            ))}
                          </ol>
                        )}
                        {m.sujet.astuce && <p className="rounded-xl bg-fond px-3 py-2 text-sm text-doux">💡 {m.sujet.astuce}</p>}
                        {m.sujet.action && (
                          <Link href={m.sujet.action.href} onClick={() => setOuvert(false)} className="mt-1 flex h-11 items-center justify-center rounded-xl bg-accent text-sm font-semibold text-white">
                            {m.sujet.action.label}
                          </Link>
                        )}
                      </>
                    )}
                  </div>
                ),
              )}
              {ecrit && (
                <div className="self-start rounded-2xl rounded-bl-md border border-ligne bg-white px-4 py-3" aria-label="L’aide écrit">
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-doux [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-doux [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-doux" />
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-ligne bg-white px-4 pb-3 pt-3">
              <div className="flex max-h-[30dvh] flex-wrap gap-2 overflow-y-auto">
                {SUJETS.map((s) => (
                  <button key={s.id} type="button" onClick={() => demander(s)} className="rounded-full border border-[#D9DEEA] bg-white px-3.5 py-2 text-left text-sm text-texte active:bg-fond">
                    {s.question}
                  </button>
                ))}
              </div>
              <a
                href={lienContact('Bonjour, j’ai une question sur l’appli Atelier : ')}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 flex h-12 items-center justify-center gap-2 rounded-xl bg-vert text-sm font-semibold text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5z" /></svg>
                Pas trouvé ? Parler à quelqu’un
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
