import React from 'react';
import { LatexRenderer } from '../common/LatexRenderer';

interface GuidebookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidebookModal: React.FC<GuidebookModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-surface-container rounded-2xl border-2 border-card-border p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-card-border">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lightning-gold text-2xl">menu_book</span>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-text-muted font-extrabold">
                Unit 03 Guidebook
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-on-surface">
                Digital Logic Gates & Boolean Identities
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Guidebook"
            className="w-9 h-9 rounded-xl bg-surface-container-high hover:bg-surface-variant flex items-center justify-center text-text-muted hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content sections */}
        <div className="flex flex-col gap-6 text-sm leading-relaxed text-on-surface">
          {/* Section 1: Fundamental Boolean Laws */}
          <div className="p-4 rounded-xl bg-card-dark border border-card-border">
            <h3 className="font-bold text-secondary text-base mb-2">1. Fundamental Boolean Laws</h3>
            <ul className="space-y-1.5 font-mono text-xs">
              <li>• Identity: <LatexRenderer content="$A + 0 = A, \quad A \cdot 1 = A$" /></li>
              <li>• Annihilator: <LatexRenderer content="$A + 1 = 1, \quad A \cdot 0 = 0$" /></li>
              <li>• Idempotent: <LatexRenderer content="$A + A = A, \quad A \cdot A = A$" /></li>
              <li>• Complement: <LatexRenderer content="$A + A' = 1, \quad A \cdot A' = 0$" /></li>
              <li>• Double Inversion: <LatexRenderer content="$(A')' = A$" /></li>
            </ul>
          </div>

          {/* Section 2: De Morgan's Theorems */}
          <div className="p-4 rounded-xl bg-card-dark border border-card-border">
            <h3 className="font-bold text-primary text-base mb-2">2. De Morgan's Theorems (Must Master!)</h3>
            <p className="text-xs text-text-muted mb-2">
              The primary rule: break the line, change the sign!
            </p>
            <div className="p-3 bg-surface-container rounded-lg font-mono text-sm space-y-2">
              <div className="text-primary font-bold">
                <LatexRenderer content="$$\overline{A \cdot B} = \overline{A} + \overline{B}$$" block />
              </div>
              <div className="text-secondary font-bold">
                <LatexRenderer content="$$\overline{A + B} = \overline{A} \cdot \overline{B}$$" block />
              </div>
            </div>
          </div>

          {/* Section 3: Universal NAND implementations */}
          <div className="p-4 rounded-xl bg-card-dark border border-card-border">
            <h3 className="font-bold text-lightning-gold text-base mb-2">3. Universal NAND Equivalences</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-surface-container">NOT = 1 NAND</div>
              <div className="p-2 rounded bg-surface-container">AND = 2 NANDs</div>
              <div className="p-2 rounded bg-surface-container text-lightning-gold font-bold">OR = 3 NANDs</div>
              <div className="p-2 rounded bg-surface-container">NOR = 4 NANDs</div>
              <div className="p-2 rounded bg-surface-container">XOR = 4 NANDs</div>
              <div className="p-2 rounded bg-surface-container">XNOR = 5 NANDs</div>
            </div>
          </div>

          {/* Section 4: Half and Full Adders */}
          <div className="p-4 rounded-xl bg-card-dark border border-card-border">
            <h3 className="font-bold text-on-surface text-base mb-2">4. Adder Circuit Formulas</h3>
            <p className="text-xs text-text-muted mb-2">
              Combinational binary addition basics frequently tested in past papers:
            </p>
            <ul className="space-y-1 text-xs font-mono">
              <li>• Half Adder Sum: <LatexRenderer content="$S = A \oplus B$" /></li>
              <li>• Half Adder Carry: <LatexRenderer content="$C = A \cdot B$" /></li>
              <li>• Full Adder Sum: <LatexRenderer content="$S = A \oplus B \oplus C_{in}$" /></li>
              <li>• Full Adder Carry: <LatexRenderer content="$C_{out} = A \cdot B + C_{in} \cdot (A \oplus B)$" /></li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-card-border flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary text-on-primary-fixed font-bold text-xs uppercase rounded-xl btn-pressable-primary"
          >
            Got It, Back To Practice
          </button>
        </div>
      </div>
    </div>
  );
};
