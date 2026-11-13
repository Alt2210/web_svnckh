import { useCallback, useRef, useState, type MouseEvent } from 'react';
import { actionDialogs } from '../data/dialogs';
import type { DialogContent } from '../types/dialog';

export function useLandingActions(resetSearch: () => void) {
  const [dialog, setDialog] = useState<DialogContent | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const closeDialog = useCallback(() => setDialog(null), []);

  function handleAction(event: MouseEvent<HTMLElement>) {
    if (!(event.target instanceof Element)) return;
    const trigger = event.target.closest<HTMLElement>('[data-action]');
    if (!trigger) return;
    event.preventDefault();
    const action = trigger.dataset.action ?? 'info';
    if (action === 'all-clubs') {
      resetSearch();
      document.getElementById('tra-cuu-danh-ba')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    triggerRef.current = trigger;
    const content = actionDialogs[action] ?? actionDialogs.info;
    setDialog({ ...content, title: trigger.dataset.title || content.title });
  }
  return { dialog, triggerRef, closeDialog, handleAction };
}
