import { useState, useEffect, useRef, useCallback } from 'react';
import type { AgentePasso, AgenteOpcao } from '@/data/agente-fluxos';

// Normalize helper: strips accents, lowercases and removes punctuation
export function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s%]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Pure function: matches spoken transcript against step option keywords.
 * Returns pre-selected variable values for the flow without calling any external AI.
 */
export function matchKeywordsToOptions(
  transcript: string,
  passos: AgentePasso[],
): Record<string, any> {
  const normalized = normalizeText(transcript);
  if (!normalized) return {};

  const selections: Record<string, any> = {};

  for (const passo of passos) {
    if (!passo.opcoes || passo.opcoes.length === 0) continue;

    if (passo.tipo === 'unica') {
      let bestMatch: AgenteOpcao | null = null;
      let highestScore = 0;

      for (const opt of passo.opcoes) {
        let score = 0;
        for (const kw of opt.palavras) {
          const normKw = normalizeText(kw);
          if (normKw && normalized.includes(normKw)) {
            // Longer matching phrase gets higher priority
            score += normKw.split(' ').length;
          }
        }
        if (score > highestScore) {
          highestScore = score;
          bestMatch = opt;
        }
      }

      if (bestMatch && highestScore > 0) {
        selections[passo.variavel] = bestMatch.valorPrompt || bestMatch.rotulo;
      }
    } else if (passo.tipo === 'multipla') {
      const matchedOpts: string[] = [];
      for (const opt of passo.opcoes) {
        for (const kw of opt.palavras) {
          const normKw = normalizeText(kw);
          if (normKw && normalized.includes(normKw)) {
            matchedOpts.push(opt.valorPrompt || opt.rotulo);
            break;
          }
        }
      }
      if (matchedOpts.length > 0) {
        selections[passo.variavel] = matchedOpts;
      }
    }
  }

  return selections;
}

export function isSpeechSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

export interface UseSpeechProps {
  onTranscript?: (text: string) => void;
  onError?: (error: string) => void;
}

export function useSpeech({ onTranscript, onError }: UseSpeechProps = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const supported = isSpeechSupported();

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!supported) {
      const msg = 'Seu navegador não suporta voz; escolha as opções.';
      setError(msg);
      onError?.(msg);
      return;
    }

    try {
      setError(null);
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript + ' ';
        }
        const clean = current.trim();
        setTranscript(clean);
        onTranscript?.(clean);
      };

      recognition.onerror = (event: any) => {
        let msg = 'Erro no reconhecimento de voz.';
        if (event.error === 'not-allowed') {
          msg = 'Libere o microfone nas permissões do navegador.';
        } else if (event.error === 'no-speech') {
          msg = 'Nenhuma fala detectada. Toque no microfone e tente falar novamente.';
        } else if (event.error === 'network') {
          msg = 'Erro de rede na transcrição. Escolha as opções diretamente.';
        }
        setError(msg);
        onError?.(msg);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (e: any) {
      console.warn('Speech recognition error:', e);
      setIsListening(false);
      setError('Não foi possível iniciar o microfone.');
    }
  }, [supported, onTranscript, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    supported,
    isListening,
    transcript,
    setTranscript,
    error,
    startListening,
    stopListening,
    toggleListening,
  };
}
