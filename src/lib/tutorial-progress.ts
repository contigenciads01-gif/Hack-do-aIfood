import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';

const TUTORIAL_KEY_PREFIX = 'hdi_tutorial_completed_';

export function useTutorialProgress() {
  const { user } = useAuth();
  const userId = user?.id || 'guest';
  const storageKey = `${TUTORIAL_KEY_PREFIX}${userId}`;

  const [isCompleted, setIsCompleted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      setIsCompleted(localStorage.getItem(storageKey) === 'true');
    } catch {
      setIsCompleted(false);
    }
  }, [storageKey]);

  const markCompleted = () => {
    try {
      localStorage.setItem(storageKey, 'true');
      setIsCompleted(true);
    } catch (e) {
      console.warn(e);
    }
  };

  const resetProgress = () => {
    try {
      localStorage.removeItem(storageKey);
      setIsCompleted(false);
    } catch (e) {
      console.warn(e);
    }
  };

  return { isCompleted, markCompleted, resetProgress };
}
