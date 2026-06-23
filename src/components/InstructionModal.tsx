/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, RefreshCw, Sparkles, X, ChevronRight, Milestone, HelpCircle } from 'lucide-react';

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstructionModal({ isOpen, onClose }: InstructionModalProps) {
  const [lang, setLang] = useState<'ur' | 'en'>('en');

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="instruction-modal-overlay" className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            id="instruction-modal"
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="bg-[#0E0E16] border border-white/10 w-full max-w-2xl rounded-sm overflow-hidden shadow-2xl shadow-black/80 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#0A0A0F]/60">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <span className="font-mono font-bold text-base tracking-wider uppercase text-white">
                  {lang === 'en' ? 'CO-OP PROTOCOL: ECHO THEORY' : 'کیسے کھیلیں: ایکو تھیوری'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                {/* Language Switcher */}
                <div className="bg-[#0A0A0F] p-0.5 rounded-sm flex border border-white/15">
                  <button
                    id="lang-en-btn"
                    onClick={() => setLang('en')}
                    className={`px-3 py-1 text-[10px] font-mono tracking-widest uppercase rounded-sm transition-all cursor-pointer ${
                      lang === 'en' ? 'bg-cyan-500 text-black font-extrabold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                  <button
                    id="lang-ur-btn"
                    onClick={() => setLang('ur')}
                    className={`px-3 py-1 text-[10px] font-mono tracking-widest uppercase rounded-sm transition-all cursor-pointer ${
                      lang === 'ur' ? 'bg-cyan-500 text-black font-extrabold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    UR / اردو
                  </button>
                </div>

                <button
                  id="close-instruction-btn"
                  onClick={onClose}
                  className="p-1 rounded-sm border border-transparent hover:border-white/10 hover:text-cyan-400 hover:bg-[#0A0A0F] text-slate-400 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-300 font-mono text-xs">
              {lang === 'en' ? (
                <>
                  <div className="bg-cyan-500/5 border border-cyan-400/20 rounded-sm p-4 flex gap-3 items-start">
                    <Milestone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-cyan-400 uppercase tracking-widest">The Ultimate Paradox Mechanic</h4>
                      <p className="text-xs mt-1 leading-relaxed text-slate-300 font-sans">
                        This is a temporal co-op puzzle. You cannot solve these levels alone. You must cooperate with your <strong>past selves (Echoes)</strong>!
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-sm space-y-2">
                      <div className="w-6 h-6 rounded-sm bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center font-bold text-cyan-400 text-xs font-mono">1</div>
                      <h5 className="font-bold text-slate-200 uppercase tracking-wide">Record & Steps</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                        Move around the grid using **Arrow Keys / WASD** or by **tapping/clicking** adjacent tiles. Step on doors and switches.
                      </p>
                    </div>

                    <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-sm space-y-2">
                      <div className="w-6 h-6 rounded-sm bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center font-bold text-cyan-400 text-xs font-mono">2</div>
                      <h5 className="font-bold text-slate-200 uppercase tracking-wide">Paradox loop</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                        When you run out of time (or press **R / Space**), your actions are recorded. A magical transparent **Echo clone** is created.
                      </p>
                    </div>

                    <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-sm space-y-2">
                      <div className="w-6 h-6 rounded-sm bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center font-bold text-cyan-400 text-xs font-mono">3</div>
                      <h5 className="font-bold text-slate-200 uppercase tracking-wide">Parallel Sync</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                        Watch your clone repeat your exact past moves, opening doors or blocking deadly lasers so you can reach the final Exit Portal!
                      </p>
                    </div>
                  </div>

                  {/* Special Features */}
                  <div className="space-y-3 font-mono">
                    <h5 className="font-bold text-slate-300 uppercase tracking-widest text-[10px] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" /> MATRIX KEY ELEM
                    </h5>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-300">
                      <li className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-sm bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center text-[10px] text-emerald-400 font-bold shrink-0">S</span>
                        <span><strong>Starting Portal</strong>: Where you hatch.</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-sm bg-purple-500/10 border border-purple-400/40 flex items-center justify-center text-[10px] text-purple-400 font-bold shrink-0">E</span>
                        <span><strong>Exit Portal</strong>: Reach this to unlock next level.</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-sm bg-amber-500/10 border border-amber-400/40 flex items-center justify-center text-[10px] text-amber-300 font-bold shrink-0">P</span>
                        <span><strong>Pressure Switch</strong>: Keeps associated doors open while stood on.</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded-sm bg-rose-500/10 border border-rose-400/40 flex items-center justify-center text-[10px] text-rose-400 font-bold shrink-0">L</span>
                        <span><strong>Deadly Lasers</strong>: Instantly vaporizes you! Blocks/Echoes can block the beam.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Time Decay aspect */}
                  <div className="bg-rose-500/5 border border-rose-500/25 rounded-sm p-4">
                    <h5 className="font-bold text-rose-400 flex items-center gap-2 mb-1 uppercase tracking-widest text-[10px]">
                      <RefreshCw className="w-4 h-4 animate-spin-slow" /> Temporal Decay Calibration
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      As time counts down, the **Temporal Stability** of the universe decays. Moving faster results in a higher score/star rating. In Endless Mode, the level difficulty scaling gets progressively harder, shrinking loop limits and multiplying lasers!
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-cyan-500/5 border border-cyan-400/20 rounded-sm p-4 flex gap-3 items-start">
                    <Milestone className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-cyan-400">ٹیمپوریل متوازی عکس (Echo)</h4>
                      <p className="text-[11px] mt-1 leading-relaxed text-slate-300 font-sans">
                        آپ کائنات کے اس قید خانے کو اکیلے حل نہیں کر سکتے۔ پزل حل کرنے کے لیے ماضی کے ہمزادوں سے تعاون لازم ہے!
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-right">
                    <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-sm space-y-2">
                      <div className="w-6 h-6 rounded-sm bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center font-bold text-cyan-400 text-xs font-mono mr-auto ml-0">1</div>
                      <h5 className="font-bold text-slate-200">حرکت ریکارڈ کریں</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        تیر والے بٹن دبا کر گرڈ پر چلیں اور پریشر پیڈز پر کھڑے ہو کر آزمائیں۔
                      </p>
                    </div>

                    <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-sm space-y-2">
                      <div className="w-6 h-6 rounded-sm bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center font-bold text-cyan-400 text-xs font-mono mr-auto ml-0">2</div>
                      <h5 className="font-bold text-slate-200">وقت کی حد اور ری سیٹ</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        قدم ختم ہونے یا وقت پورا ہونے پر لوپ ری سیٹ ہو کر خودکار ماضی کا ہمزاد پیدا کرے گا۔
                      </p>
                    </div>

                    <div className="bg-[#0A0A0F] border border-white/5 p-4 rounded-sm space-y-2">
                      <div className="w-6 h-6 rounded-sm bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center font-bold text-cyan-400 text-xs font-mono mr-auto ml-0">3</div>
                      <h5 className="font-bold text-slate-200">کامیاب ہم آہنگی</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        آپ کا ہمزاد ماضی کے قدم دہرائے گا۔ اپنی تال کا فائدہ اٹھا کے دروازے کھولیں اور پورٹل تلاش کریں!
                      </p>
                    </div>
                  </div>

                  {/* Urdu Elements definitions */}
                  <div className="space-y-3 text-right font-sans" dir="rtl">
                    <h5 className="font-bold text-slate-300 uppercase tracking-wide text-xs flex items-center gap-2 justify-end">
                      <Sparkles className="w-4 h-4 text-cyan-400" /> گرڈ کے اہم عناصر
                    </h5>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-400">
                      <li className="flex items-center gap-3 justify-start">
                        <span className="w-5 h-5 rounded-sm bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center text-[10px] text-emerald-400 font-bold shrink-0">S</span>
                        <span><strong>آغاز کا راستہ</strong>: جہاں سے آپ کا ظہور ہوتا ہے۔</span>
                      </li>
                      <li className="flex items-center gap-3 justify-start">
                        <span className="w-5 h-5 rounded-sm bg-purple-500/10 border border-purple-400/40 flex items-center justify-center text-[10px] text-purple-400 font-bold shrink-0">E</span>
                        <span><strong>باہر جانے کا پورٹل</strong>: اگلے ڈائمینشن میں قدم رکھنے کی چابی۔</span>
                      </li>
                      <li className="flex items-center gap-3 justify-start">
                        <span className="w-5 h-5 rounded-sm bg-amber-500/10 border border-amber-400/40 flex items-center justify-center text-[10px] text-amber-300 font-bold shrink-0">P</span>
                        <span><strong>پریشر سوئچ</strong>: کھڑے ہونے سے دور کے دروازے کھلے رکھے۔</span>
                      </li>
                      <li className="flex items-center gap-3 justify-start">
                        <span className="w-5 h-5 rounded-sm bg-rose-500/10 border border-rose-400/40 flex items-center justify-center text-[10px] text-rose-400 font-bold shrink-0">L</span>
                        <span><strong>بلاکنگ لیزر سسٹم</strong>: ہمزادوں کو لیزر کے آگے کھڑا کر کے راستہ صاف کریں۔</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-rose-500/5 border border-rose-500/25 rounded-md p-4 font-sans text-right">
                    <h5 className="font-bold text-rose-400 flex items-center gap-2 mb-1 justify-end">
                      وقت کے خلاف جنگ <RefreshCw className="w-4 h-4 animate-spin-slow ml-2 shrink-0" />
                    </h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      وقت تیزی سے ختم ہونے پر 'ٹیمپوریل استحکام' گر جاتا ہے۔ جلدی اور عقلمندی سے پزلز کو حل کرنے والے شاندار سکورز اور تارے حاصل کرتے ہیں!
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#0A0A0F]/60 border-t border-white/5 flex justify-end gap-3 font-mono">
              <button
                id="start-puzzling-btn"
                onClick={onClose}
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold uppercase tracking-wider rounded-sm text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-cyan-400/10 animate-pulse-gentle"
              >
                {lang === 'en' ? 'ACTIVATE SYSTEM SYNC' : 'مرحلہ شروع کریں!'}
                <ChevronRight className="w-4 h-4 shrink-0 text-black" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
