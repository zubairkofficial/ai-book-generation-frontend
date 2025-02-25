import { useEffect } from "react";

export const useTextSelection = (onSelect: (text: string, index: number) => void) => {
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      if (!selectedText) return;

      const range = selection?.getRangeAt(0);
      let element = range?.commonAncestorContainer as Element;
      
      if (element.nodeType === Node.TEXT_NODE) {
        element = element.parentElement as Element;
      }
      
      const paragraphElement = element.closest('[data-paragraph-index]');
      if (!paragraphElement) return;

      const index = parseInt(paragraphElement.getAttribute('data-paragraph-index') || '-1');
      if (index !== -1) {
        onSelect(selectedText, index);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    return () => document.removeEventListener('mouseup', handleSelection);
  }, [onSelect]);
};


 