import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AnimatedCopyIconProps {
  text: string;
  size?: number;
  className?: string;
  successMessage?: string;
  showToast?: boolean;
}

export const AnimatedCopyIcon: React.FC<AnimatedCopyIconProps> = ({
  text,
  size = 16,
  className = '',
  successMessage = 'Copied!',
  showToast = true
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!text) return;

    try {
      // Modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed', err);
        }
        document.body.removeChild(textArea);
      }

      setCopied(true);
      if (showToast) {
        toast.success(successMessage, { id: `copy-${text.substring(0, 20)}` });
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      if (showToast) {
        toast.error('Gagal menyalin');
      }
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center justify-center transition-all active:scale-90 ${className}`}
      title="Salin"
      type="button"
    >
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <m.div
              key="check"
              initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0, rotate: 20 }}
              transition={{ 
                type: "spring", 
                stiffness: 500, 
                damping: 30,
                duration: 0.15 
              }}
              className="absolute inset-0 flex items-center justify-center text-emerald-500"
            >
              <Check size={size} strokeWidth={2.5} />
            </m.div>
          ) : (
            <m.div
              key="copy"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Copy size={size} strokeWidth={2} />
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </button>
  );
};

export default AnimatedCopyIcon;
