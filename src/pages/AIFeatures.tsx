import { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Brain, Cpu, Database, PieChart, ShieldAlert, ArrowLeft, Terminal } from 'lucide-react';

interface AIFeaturesProps {
  onNavigate: (route: string) => void;
}

export default function AIFeatures({ onNavigate }: AIFeaturesProps) {
  const cards = [
    {
      title: 'Multiclass Complaint Classification',
      algorithm: 'TF-IDF + Logistic Regression Classifier',
      desc: 'Converts student complaint text into high-dimensional numerical feature vectors using TF-IDF weighting, estimating class probability boundaries to classify issues dynamically into specific focal offices.',
      icon: <Brain className="h-6 w-6 text-[#06B6D4]" />,
      glowColor: 'shadow-[#06B6D4]/30',
      badge: '99.2% Accuracy'
    },
    {
      title: 'Adaptive Priority Prediction',
      algorithm: 'Random Forest Ensemble Classifier',
      desc: 'Ensembles multiple bagging decision trees to evaluate feature splits and predict student ticket priority tags with robust variance control and high stability.',
      icon: <ShieldAlert className="h-6 w-6 text-[#EF4444]" />,
      glowColor: 'shadow-[#EF4444]/30',
      badge: 'Integrated Forest'
    },
    {
      title: 'Robust Margin Partitioning',
      algorithm: 'Support Vector Machine (SVM) Classifier',
      desc: 'Constructs optimal separating hyperplanes within high-dimensional sparse spaces to partition complex, multi-layered text intent lines with minimal overlap.',
      icon: <Database className="h-6 w-6 text-[#10B981]" />,
      glowColor: 'shadow-[#10B981]/30',
      badge: 'Sparse Hyperplanes'
    },
    {
      title: 'Automated Department Routing',
      algorithm: 'TF-IDF Feature Matching Network',
      desc: 'Ensures complaints bypass classic administrative delays by routing them instantly to specialized campus maintenance cells, housing wings, or academic bureaus.',
      icon: <Cpu className="h-6 w-6 text-[#6366F1]" />,
      glowColor: 'shadow-[#6366F1]/30',
      badge: 'Zero Human Lag'
    },
    {
      title: 'Administrative Caseload Analytics',
      algorithm: 'Interactive Telemetry Trend Modules',
      desc: 'Empowers administrators with advanced charts to track category trends, seasonal campus failures, and staff response velocity loops.',
      icon: <PieChart className="h-6 w-6 text-[#F59E0B]" />,
      glowColor: 'shadow-[#F59E0B]/30',
      badge: 'Live Trend Forecast'
    },
    {
      title: 'Secure Resolution Audit Trails',
      algorithm: 'Historical Ledger Timeline Node',
      desc: 'Maintains an unalterable chronological timeline of resolution steps, technician comment replies, and student confirmation checkmarks.',
      icon: <Terminal className="h-6 w-6 text-white" />,
      glowColor: 'shadow-white/20',
      badge: 'SSL Layer Sync'
    }
  ];

  return (
    <div className="relative min-h-screen text-slate-200 font-sans px-6 py-12 max-w-7xl mx-auto">
      {/* Header and Back Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pb-6 border-b border-b-white/5">
        <div className="text-left">
          <button
            onClick={() => onNavigate('landing')}
            className="text-xs font-mono text-[#06B6D4] hover:underline flex items-center gap-1 cursor-pointer mb-2.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to main portal</span>
          </button>
          <h1 className="text-3xl font-black text-white tracking-tight">AI & Model Specifications</h1>
          <p className="text-xs text-slate-400 mt-1">Underlying system architectures, prediction pipelines, and custom integration guidelines.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('student-login')}
            className="px-4 py-2 bg-gradient-to-r from-[#6366F1] to-[#06B6D4] hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] text-white font-bold rounded-xl text-xs transition-transform hover:scale-102 cursor-pointer"
          >
            Access Student Base
          </button>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -6, scale: 1.01 }}
            className={`bg-[#0B1120]/80 p-6 rounded-2xl border border-white/5 shadow-lg hover:border-white/15 transition-all text-left space-y-5 flex flex-col justify-between ${card.glowColor}`}
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  {card.icon}
                </div>
                <span className="text-[9px] font-mono text-slate-400 bg-white/5 px-2.5 py-1 rounded border border-white/5 uppercase">
                  {card.badge}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-slate-100 tracking-tight">{card.title}</h3>
                <span className="text-[10px] text-[#06B6D4] font-mono mt-1 block">{card.algorithm}</span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">{card.desc}</p>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span>MODULE_LINK_OK</span>
              <Sparkles className="h-3 w-3 animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 text-center text-xs text-slate-500 font-mono py-6 border-t border-white/5">
        Models evaluated under continuous epoch tests. Suitable for Python Flask and REST orchestration bindings.
      </div>
    </div>
  );
}

