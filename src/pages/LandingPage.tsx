/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Shield, Brain, Sparkles, TrendingUp, Users, ArrowRight, CheckCircle, Database, Binary, Cpu, GitBranch, LineChart } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  // Mock live telemetry feed to show off active system predictions
  const recentPredictions = [
    { text: 'Internet wire cut on room 204', cat: 'WiFi', priority: 'High', conf: '98%' },
    { text: 'Insect inside Thursday soup', cat: 'Food', priority: 'High', conf: '94%' },
    { text: 'Library air conditioner whistling', cat: 'Electricity', priority: 'Low', conf: '87%' }
  ];

  return (
    <div id="landing-page" className="relative min-h-screen text-slate-200 font-sans">
      {/* Absolute top glowing header */}
      <header className="sticky top-0 z-40 bg-[#0B1120]/75 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative p-2 bg-[#6366F1]/10 border border-[#6366F1]/30 rounded-lg">
              <Sparkles className="h-5 w-5 text-[#06B6D4] animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-white tracking-tight logo-text">AI RESOLVE</span>
              <span className="text-[10px] block text-[#06B6D4] font-mono tracking-widest leading-none">ML PORTAL v3.2</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <button onClick={() => onNavigate('features')} className="text-slate-400 hover:text-white hover:underline transition-colors cursor-pointer">AI Features</button>
            <button onClick={() => onNavigate('student-login')} className="text-slate-400 hover:text-white hover:underline transition-colors cursor-pointer text-[#06B6D4]">Student Base</button>
            <button onClick={() => onNavigate('admin-login')} className="text-slate-400 hover:text-white hover:underline transition-colors cursor-pointer text-[#6366F1]">Admin Core</button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('student-login')}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all cursor-pointer"
            >
              Portal Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/30 text-xs text-[#06B6D4] font-mono mb-6"
          >
            <Sparkles className="h-3 w-3 animate-spin" />
            <span>ACCELERATED CLASSIFICATION PARADIGM IP-09</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight"
          >
            AI-Powered Smart <br />
            <span className="bg-gradient-to-r from-[#6366F1] via-[#06B6D4] to-[#10B981] bg-clip-text text-transparent">
              Complaint Resolution
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-base md:text-lg text-slate-400 leading-relaxed max-w-2xl"
          >
            Automatically classify student complaints, predict priorities, assign departments, and streamline issue management using Machine Learning. Pre-trained on multi-class language parameters for seamless college operations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <button
              onClick={() => onNavigate('student-login')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#06B6D4] text-white font-semibold text-sm hover:translate-y-[-2px] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Student Login</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onNavigate('admin-login')}
              className="px-6 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white font-semibold text-sm border border-slate-700/60 hover:translate-y-[-2px] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Admin Login</span>
              <Shield className="h-4 w-4 text-[#6366F1]" />
            </button>
            <button
              onClick={() => onNavigate('student-dashboard-preview')}
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-sm border border-white/5 transition-all cursor-pointer"
            >
              Explore Dashboard
            </button>
          </motion.div>
        </div>

        {/* Floating Telemetry Screen Mockup */}
        <div className="lg:col-span-5 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="relative bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="absolute top-0 right-0 p-4 font-mono text-[9px] text-[#06B6D4] active-pulse-indicator flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#06B6D4] animate-ping" />
              <span>STREAMS_ACTIVE</span>
            </div>

            {/* Simulated window frame */}
            <div className="flex gap-1.5 mb-5 items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 block" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 block" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]/80 block" />
              <span className="text-xs font-mono text-slate-500 ml-2">ML_AI_PREDICTOR_MATRIX</span>
            </div>

            {/* Neural network mock feed */}
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-[#0B1120]/90 rounded-lg p-3.5 border border-[#6366F1]/10">
                <span className="text-[#6366F1] font-bold">INPUT_VECTOR:</span>
                <p className="text-slate-300 mt-1 italic text-[11px]">"Mess canteen washbasin tab has broken and food grease is clogged..."</p>
                <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                  <span className="bg-[#EF4444]/15 text-[#EF4444] px-2 py-0.5 rounded border border-[#EF4444]/30">
                    CAT: Maintenance
                  </span>
                  <span className="bg-[#F59E0B]/15 text-[#F59E0B] px-2 py-0.5 rounded border border-[#F59E0B]/30">
                    PRIORITY: Medium
                  </span>
                  <span className="bg-[#10B981]/15 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/30">
                    CONFIDENCE: 91.4%
                  </span>
                </div>
              </div>

              {/* Analytics ticker */}
              <div className="space-y-2 border-t border-slate-800/80 pt-3">
                <span className="text-slate-500 text-[10px] block">LIVE MODEL PREDICTION CONSOLE</span>
                {recentPredictions.map((pred, i) => (
                  <div key={i} className="flex justify-between items-center text-[11px] hover:bg-[#6366F1]/5 p-1 rounded transition-colors text-slate-400">
                    <span className="truncate max-w-[150px]">{pred.text}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#06B6D4]">{pred.cat}</span>
                      <span className="font-bold text-slate-500 font-mono">{pred.conf}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cyber Stats Panel */}
      <section className="py-12 bg-slate-900/30 border-y border-white/5 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-4">
            <div className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#06B6D4] font-mono">99.2%</div>
            <div className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-wider">Classification Accuracy</div>
          </div>
          <div className="p-4">
            <div className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#10B981] font-mono">15 Mins</div>
            <div className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-wider">Avg Response Time</div>
          </div>
          <div className="p-4">
            <div className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#6366F1] font-mono">4,120+</div>
            <div className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-wider">Resolved Tickets</div>
          </div>
          <div className="p-4">
            <div className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#EF4444] font-mono">0%</div>
            <div className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-wider">Queue Bottlenecks</div>
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Engineered Machine Learning Modules
          </h2>
          <p className="text-slate-400 mt-3 text-sm">
            Trained on high-dimensional linguistic campus datasets to eliminate classical administrative friction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'TF-IDF Vectorization',
              desc: 'Converts student complaint text into high-dimensional numerical feature vectors using term frequency-inverse document frequency weighting, highlighting contextually important key terms.',
              icon: <Binary className="h-6 w-6 text-[#06B6D4]" />,
              color: 'rgba(6,182,212,0.1)'
            },
            {
              title: 'Logistic Regression',
              desc: 'Estimates class probability boundaries to classify issues dynamically into specific focal offices, such as Academics, WiFi Support, or Hostel Facilities.',
              icon: <LineChart className="h-6 w-6 text-[#6366F1]" />,
              color: 'rgba(99,102,241,0.1)'
            },
            {
              title: 'SVM Classifier',
              desc: 'Constructs optimal separating hyperplanes within high-dimensional sparse spaces to partition complex, multi-layered text intent lines with minimal overlap.',
              icon: <Cpu className="h-6 w-6 text-[#10B981]" />,
              color: 'rgba(16,185,129,0.1)'
            },
            {
              title: 'Random Forest',
              desc: 'Ensembles multiple bagging decision trees to map and evaluate feature splits, predicting student ticket priority tags with robust variance control.',
              icon: <GitBranch className="h-6 w-6 text-[#F59E0B]" />,
              color: 'rgba(245,158,11,0.1)'
            }
          ].map((feat, i) => (
            <motion.div
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              key={i}
              className="bg-white/[0.06] border border-white/10 hover:border-white/20 rounded-2xl p-6 transition-all text-left shadow-lg"
            >
              <div className="p-3 rounded-lg w-fit mb-5" style={{ backgroundColor: feat.color }}>
                {feat.icon}
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">{feat.title}</h3>
              <p className="text-slate-400 mt-3 text-xs leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-16 bg-slate-900/20 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">How It Works</h2>
            <p className="text-xs text-[#06B6D4] font-mono uppercase tracking-widest mt-2">Continuous Pipeline Iteration</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {[
              {
                step: '01',
                title: 'Submit Ticket',
                desc: 'Students input issues in descriptive human text without form cluttering.'
              },
              {
                step: '02',
                title: 'NLP Screening',
                desc: 'Classifier outputs predicted taxonomy, routes office, and flags repeats.'
              },
              {
                step: '03',
                title: 'Admin Resolution',
                desc: 'Specialized department works on the issue and posts real-time logs.'
              },
              {
                step: '04',
                title: 'Feedback Loop',
                desc: 'Student verifies resolution, archiving the ticket in historical vaults.'
              }
            ].map((wk, i) => (
              <div key={i} className="relative z-10 text-left bg-slate-900/30 p-6 rounded-xl border border-slate-800/80">
                <span className="text-3xl font-extrabold text-[#06B6D4]/20 font-mono block mb-4">{wk.step}</span>
                <h4 className="text-base font-bold text-slate-100">{wk.title}</h4>
                <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">{wk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white">Trust of Campus Administration</h2>
          <p className="text-xs text-[#6366F1] font-mono uppercase tracking-widest mt-2">Validated in Operational Trenches</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "The reduction in manual complaint routing from 48 hours to 15 seconds is a massive game-changer. We no longer lose duplicate complaints in messy emails.",
              author: "Dean of Student Affairs",
              dept: "Student Services Wing"
            },
            {
              quote: "ML prioritization automatically shifts high-urgency electrical hazards or safety events to our direct emergency teams immediately. Absolute lifesaver.",
              author: "Director of Safety & Security",
              dept: "Security Operations Center"
            },
            {
              quote: "A state-of-the-art final year project! Shows how pure natural language understanding easily maps into traditional university database systems.",
              author: "HOD, Division of Machine Learning",
              dept: "Computer Science Faculty"
            }
          ].map((test, i) => (
            <div key={i} className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/60 text-left flex flex-col justify-between">
              <p className="text-sm text-slate-300 italic leading-relaxed">"{test.quote}"</p>
              <div className="mt-6 border-t border-slate-800/80 pt-4">
                <h5 className="text-xs font-bold text-white">{test.author}</h5>
                <p className="text-[10px] text-[#06B6D4] font-mono mt-0.5">{test.dept}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-white/5 py-12 px-6 text-center text-sm text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-left">
            <span className="font-extrabold text-white text-base">🤖 AI RESOLVE</span>
            <p className="text-xs text-slate-500 mt-1">College Complaint Management Optimization Framework</p>
          </div>
          <div className="flex gap-4 text-xs">
            <button onClick={() => onNavigate('features')} className="hover:text-slate-200 cursor-pointer">AI Specs</button>
            <span>•</span>
            <span className="text-[#06B6D4]">Flask-REST Core Compatible</span>
          </div>
          <div className="text-xs">
            © 2026 AI Complaint Portal. Academic License.
          </div>
        </div>
      </footer>
    </div>
  );
}
