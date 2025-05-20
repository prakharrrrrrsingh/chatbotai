import { useEffect, useRef } from 'react';

// Hook for auto-resizing textarea
export function useAutoResizeTextarea(value: string) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set the height to scrollHeight to expand the textarea
    textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
  }, [value]);

  return textareaRef;
}

// Hook for handling outside clicks
export function useOutsideClick(callback: () => void) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [callback]);

  return ref;
}
