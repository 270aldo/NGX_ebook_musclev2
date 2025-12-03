import { useEffect, useCallback, RefObject } from 'react';
import { AppMode } from '../data/modes';

interface KeyboardShortcutHandlers {
  onSearch: () => void;
  onModeChange: (mode: AppMode) => void;
  onEscape: () => void;
  onFocusInput: () => void;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  inputRef?: RefObject<HTMLInputElement>;
  currentOverlay?: string;
}

const MODE_KEYS: Record<string, AppMode> = {
  '1': 'chat',
  '2': 'visual',
  '3': 'mentor',
  '4': 'research',
  '5': 'coach',
};

export function useKeyboardShortcuts(
  handlers: KeyboardShortcutHandlers,
  options: UseKeyboardShortcutsOptions = {}
): void {
  const { enabled = true, inputRef, currentOverlay = 'none' } = options;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const isMod = e.metaKey || e.ctrlKey;

      // Escape: Close any overlay
      if (e.key === 'Escape' && currentOverlay !== 'none') {
        e.preventDefault();
        handlers.onEscape();
        return;
      }

      // Cmd/Ctrl + K: Open search
      if (isMod && e.key === 'k') {
        e.preventDefault();
        handlers.onSearch();
        return;
      }

      // Cmd/Ctrl + /: Focus chat input
      if (isMod && e.key === '/') {
        e.preventDefault();
        if (inputRef?.current) {
          inputRef.current.focus();
        }
        handlers.onFocusInput();
        return;
      }

      // Cmd/Ctrl + 1-5: Switch modes
      if (isMod && MODE_KEYS[e.key]) {
        e.preventDefault();
        handlers.onModeChange(MODE_KEYS[e.key]);
        return;
      }
    },
    [enabled, currentOverlay, handlers, inputRef]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);
}
