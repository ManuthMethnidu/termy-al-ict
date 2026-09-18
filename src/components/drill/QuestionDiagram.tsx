import React from 'react';
import { McqQuestion } from '../../types';

interface QuestionDiagramProps {
  question: McqQuestion;
}

export const QuestionDiagram: React.FC<QuestionDiagramProps> = ({ question }) => {
  if (question.diagramType === 'xor_gate') {
    return (
      <div className="w-full rounded-2xl bg-surface-container-lowest p-4 sm:p-5 mb-6 border border-card-border/60 shadow-inner">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logic Gate Circuit Diagram */}
          <div className="flex items-center justify-center p-4 bg-surface-container rounded-xl w-full md:w-auto min-w-[220px] border border-card-border/40">
            <svg
              className="w-48 h-24 text-text-muted"
              fill="none"
              viewBox="0 0 200 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Input Lines */}
              <line
                stroke="#becbb1"
                strokeLinecap="round"
                strokeWidth="3"
                x1="20"
                x2="60"
                y1="35"
                y2="35"
              />
              <line
                stroke="#becbb1"
                strokeLinecap="round"
                strokeWidth="3"
                x1="20"
                x2="60"
                y1="65"
                y2="65"
              />
              <text fill="#becbb1" fontFamily="monospace" fontSize="13" fontWeight="700" x="8" y="39">
                A
              </text>
              <text fill="#becbb1" fontFamily="monospace" fontSize="13" fontWeight="700" x="8" y="69">
                B
              </text>
              {/* XOR First Curved Input Arc */}
              <path
                d="M 50 20 Q 75 50 50 80"
                fill="none"
                stroke="#88957d"
                strokeLinecap="round"
                strokeWidth="3"
              />
              {/* XOR Body Shield */}
              <path
                d="M 62 20 Q 87 50 62 80 Q 110 80 135 50 Q 110 20 62 20 Z"
                fill="#152126"
                stroke="#88ceff"
                strokeLinejoin="round"
                strokeWidth="3"
              />
              {/* Output Wire */}
              <line
                stroke="#88ceff"
                strokeLinecap="round"
                strokeWidth="3"
                x1="135"
                x2="175"
                y1="50"
                y2="50"
              />
              <text fill="#88ceff" fontFamily="monospace" fontSize="13" fontWeight="700" x="182" y="54">
                F
              </text>
            </svg>
          </div>

          {/* Logic Truth Table */}
          <div className="flex-1 w-full flex flex-col justify-center font-mono">
            <div className="flex items-center justify-between pb-2 mb-3 bg-surface-container-low px-3 py-1.5 rounded-lg text-text-muted text-xs border border-card-border/40">
              <span className="font-semibold tracking-wider text-on-surface">LOGIC TABLE • 2-BIT XOR</span>
              <span className="text-secondary font-bold">F = A ⊕ B</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-center text-xs">
              <div className="p-1.5 bg-surface-container font-bold text-text-muted rounded">A</div>
              <div className="p-1.5 bg-surface-container font-bold text-text-muted rounded">B</div>
              <div className="p-1.5 bg-surface-container font-bold text-secondary rounded">F</div>

              <div className="p-1 bg-surface-container-low/50 text-on-surface rounded">0</div>
              <div className="p-1 bg-surface-container-low/50 text-on-surface rounded">0</div>
              <div className="p-1 bg-surface-container-low/50 text-text-muted font-bold rounded">0</div>

              <div className="p-1 bg-surface-container-low/50 text-on-surface rounded">0</div>
              <div className="p-1 bg-surface-container-low/50 text-on-surface rounded">1</div>
              <div className="p-1 bg-primary/20 text-primary font-bold rounded border border-primary/30">1</div>

              <div className="p-1 bg-surface-container-low/50 text-on-surface rounded">1</div>
              <div className="p-1 bg-surface-container-low/50 text-on-surface rounded">0</div>
              <div className="p-1 bg-primary/20 text-primary font-bold rounded border border-primary/30">1</div>

              <div className="p-1 bg-surface-container-low/50 text-on-surface rounded">1</div>
              <div className="p-1 bg-surface-container-low/50 text-on-surface rounded">1</div>
              <div className="p-1 bg-surface-container-low/50 text-text-muted font-bold rounded">0</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (question.diagramType === 'kmap') {
    return (
      <div className="w-full rounded-2xl bg-surface-container-lowest p-4 mb-6 border border-card-border/60">
        <div className="flex items-center justify-between pb-2 mb-3 text-xs font-mono text-text-muted border-b border-card-border/50">
          <span className="text-secondary font-bold">3-VARIABLE KARNAUGH MAP</span>
          <span>F(A,B,C) = Σ m(1, 3, 5, 7)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs font-mono border-collapse">
            <thead>
              <tr>
                <th className="p-2 border border-card-border bg-surface-container text-text-muted">AB \ C</th>
                <th className="p-2 border border-card-border bg-surface-container text-secondary">C = 0</th>
                <th className="p-2 border border-card-border bg-primary/15 text-primary font-bold">C = 1</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-card-border bg-surface-container font-semibold">00 (A'B')</td>
                <td className="p-2 border border-card-border text-text-muted">0 [m0]</td>
                <td className="p-2 border border-card-border bg-primary/25 text-primary font-bold">1 [m1]</td>
              </tr>
              <tr>
                <td className="p-2 border border-card-border bg-surface-container font-semibold">01 (A'B)</td>
                <td className="p-2 border border-card-border text-text-muted">0 [m2]</td>
                <td className="p-2 border border-card-border bg-primary/25 text-primary font-bold">1 [m3]</td>
              </tr>
              <tr>
                <td className="p-2 border border-card-border bg-surface-container font-semibold">11 (AB)</td>
                <td className="p-2 border border-card-border text-text-muted">0 [m6]</td>
                <td className="p-2 border border-card-border bg-primary/25 text-primary font-bold">1 [m7]</td>
              </tr>
              <tr>
                <td className="p-2 border border-card-border bg-surface-container font-semibold">10 (AB')</td>
                <td className="p-2 border border-card-border text-text-muted">0 [m4]</td>
                <td className="p-2 border border-card-border bg-primary/25 text-primary font-bold">1 [m5]</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-text-muted text-center">
          Note: Entire right column forms a 4-cell group where <span className="text-primary font-bold">C = 1</span>
        </p>
      </div>
    );
  }

  if (question.diagramType === 'code_snippet') {
    return (
      <div className="w-full rounded-2xl bg-surface-container-lowest p-4 mb-6 border border-card-border/60">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-card-border/40 text-xs font-mono text-text-muted">
          <span className="flex items-center gap-1.5 text-secondary">
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            solution.py
          </span>
          <span>Python 3.10+</span>
        </div>
        <pre className="font-mono text-sm leading-relaxed text-on-surface bg-surface-container-low p-3 rounded-xl overflow-x-auto">
          <code>
            <span className="text-secondary font-bold">x</span> = <span className="text-lightning-gold">19</span>{'\n'}
            <span className="text-secondary font-bold">s</span> = <span className="text-primary">""</span>{'\n'}
            <span className="text-pink-400 font-bold">while</span> x &gt; <span className="text-lightning-gold">0</span>:{'\n'}
            {'    '}s = <span className="text-secondary">str</span>(x % <span className="text-lightning-gold">2</span>) + s{'\n'}
            {'    '}x = x // <span className="text-lightning-gold">2</span>{'\n'}
            <span className="text-secondary">print</span>(s)
          </code>
        </pre>
      </div>
    );
  }

  if (question.diagramType === 'network') {
    return (
      <div className="w-full rounded-2xl bg-surface-container-lowest p-4 mb-6 border border-card-border/60">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-card-border/40 text-xs font-mono text-text-muted">
          <span className="text-secondary font-bold">CIDR SUBNET MAP (/26)</span>
          <span className="text-primary font-mono">Mask: 255.255.255.192</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono text-center">
          <div className="p-2 rounded bg-surface-container-low border border-card-border/30">
            <div className="text-text-muted">Subnet 0</div>
            <div className="font-bold text-on-surface">.0 - .63</div>
          </div>
          <div className="p-2 rounded bg-primary/20 border-2 border-primary text-primary font-bold">
            <div className="text-primary-fixed">Subnet 1 [Target]</div>
            <div>.64 - .127</div>
            <div className="text-[10px] text-lightning-gold font-normal">Host .65 inside!</div>
          </div>
          <div className="p-2 rounded bg-surface-container-low border border-card-border/30">
            <div className="text-text-muted">Subnet 2</div>
            <div className="font-bold text-on-surface">.128 - .191</div>
          </div>
          <div className="p-2 rounded bg-surface-container-low border border-card-border/30">
            <div className="text-text-muted">Subnet 3</div>
            <div className="font-bold text-on-surface">.192 - .255</div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};
