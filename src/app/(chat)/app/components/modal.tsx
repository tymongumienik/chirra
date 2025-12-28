/** biome-ignore-all lint/a11y/useKeyWithClickEvents: ... */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: ... */
import { Button } from "@/components/ui/button";
import { type ReactNode, useEffect, useState } from "react";

export function Modal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const [closing, setClosing] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const duration = 250;

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setClosing(false);
      document.body.style.overflow = "hidden";

      setTimeout(() => setMounted(true), 10);
    } else if (visible) {
      setClosing(true);
      setMounted(false);
      setTimeout(() => {
        setClosing(false);
        setVisible(false);
        document.body.style.overflow = "";
      }, duration);
    }
  }, [isOpen, visible]);

  if (!visible) return null;

  return (
    <>
      {visible && (
        <>
          {/* Overlay */}
          <div
            className={`fixed inset-0 bg-black transition-opacity duration-${duration} ${
              mounted && !closing ? "opacity-50" : "opacity-0"
            }`}
            onClick={onClose}
          />

          {/* Modal */}
          <div
            className="fixed inset-0 flex items-center justify-center p-0 z-50"
            onClick={onClose}
          >
            <div
              className={`bg-slate-900 rounded-lg p-6 max-w-lg w-full transform transition-all duration-${duration} ${
                mounted && !closing
                  ? "scale-100 opacity-100"
                  : "scale-90 opacity-0"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {children}
            </div>
          </div>
        </>
      )}
    </>
  );
}
