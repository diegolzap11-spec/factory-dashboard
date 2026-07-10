import { useCallback, useRef, useState } from "react";

interface UseCompositionOptions<T extends HTMLElement> {
  onKeyDown?: (e: React.KeyboardEvent<T>) => void;
  onCompositionStart?: (e: React.CompositionEvent<T>) => void;
  onCompositionEnd?: (e: React.CompositionEvent<T>) => void;
}

export function useComposition<T extends HTMLElement>({
  onKeyDown: onKeyDownProp,
  onCompositionStart: onCompositionStartProp,
  onCompositionEnd: onCompositionEndProp,
}: UseCompositionOptions<T>) {
  const [isComposing, setIsComposing] = useState(false);
  const compositionEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justEndedComposing = useRef(false);

  const handleCompositionStart = useCallback(
    (e: React.CompositionEvent<T>) => {
      setIsComposing(true);
      onCompositionStartProp?.(e);
    },
    [onCompositionStartProp]
  );

  const handleCompositionEnd = useCallback(
    (e: React.CompositionEvent<T>) => {
      justEndedComposing.current = true;
      if (compositionEndTimer.current) {
        clearTimeout(compositionEndTimer.current);
      }
      compositionEndTimer.current = setTimeout(() => {
        justEndedComposing.current = false;
      }, 150);
      setIsComposing(false);
      onCompositionEndProp?.(e);
    },
    [onCompositionEndProp]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<T>) => {
      const isCurrentlyComposing = (e.nativeEvent as any).isComposing || justEndedComposing.current;
      if (e.key === "Enter" && isCurrentlyComposing) {
        return;
      }
      onKeyDownProp?.(e);
    },
    [onKeyDownProp]
  );

  return {
    isComposing,
    justEndedComposing: () => justEndedComposing.current,
    onCompositionStart: handleCompositionStart,
    onCompositionEnd: handleCompositionEnd,
    onKeyDown: handleKeyDown,
  };
}
