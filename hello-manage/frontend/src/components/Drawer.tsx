import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

/** Right-side slide-over panel with a backdrop. Closes on backdrop click or Esc. */
export default function Drawer({
  open,
  onClose,
  title,
  subtitle,
  widthClass = 'max-w-xl',
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  widthClass?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-dark/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className={`fixed top-0 right-0 h-full w-full ${widthClass} bg-beige z-50 shadow-2xl flex flex-col`}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-dark/10 bg-white">
              <div>
                <h2 className="font-display font-bold text-lg">{title}</h2>
                {subtitle && <p className="text-dark/50 text-sm mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-2 rounded-full hover:bg-dark/5 shrink-0 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
