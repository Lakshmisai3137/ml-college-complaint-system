/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, AlertTriangle, UploadCloud, Check, FileText, 
  Clock, ServerCrash, Cpu, ArrowRight, UserCheck, RefreshCw, X 
} from 'lucide-react';
import { APIService } from '../services/api';
import { Category, Priority, Complaint } from '../types';

interface SubmitComplaintProps {
  studentID: string;
  studentName: string;
  onNavigate: (route: string) => void;
  onSuccess: () => void;
}

export default function SubmitComplaint({ studentID, studentName, onNavigate, onSuccess }: SubmitComplaintProps) {
  const [complaintText, setComplaintText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [predictions, setPredictions] = useState<{
    category: Category;
    priority: Priority;
    department: string;
    confidence: number;
    isDuplicate: boolean;
    duplicateOf?: Complaint;
    similarityScore?: number;
  } | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [useManualOverrides, setUseManualOverrides] = useState(false);

  // Manual override states if user wishes to change the AI recommendation
  const [manualCategory, setManualCategory] = useState<Category>('Student Affairs');
  const [manualPriority, setManualPriority] = useState<Priority>('Low');
  const [manualDept, setManualDept] = useState('Student Affairs & Cultural Office');

  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Deep auto-analysis of typed input
  useEffect(() => {
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }

    if (!complaintText.trim() || complaintText.trim().length < 8) {
      setPredictions(null);
      setAnalyzing(false);
      return;
    }

    setAnalyzing(true);
    analysisTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await APIService.analyzeComplaint(complaintText);
        setPredictions(res);
        // Sync defaults in case override is selected
        setManualCategory(res.category);
        setManualPriority(res.priority);
        setManualDept(res.department);
      } catch (err) {
        console.error('Analysis error', err);
      } finally {
        setAnalyzing(false);
      }
    }, 800); // 800ms debounce typing listener

    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [complaintText]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setAttachedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim() || complaintText.trim().length < 10) {
      alert('Please enter a sufficiently detailed complaint description (at least 10 letters).');
      return;
    }

    setSubmitting(true);

    // Prepare predicted assets
    const finalCategory = useManualOverrides ? manualCategory : (predictions?.category || 'Student Affairs');
    const finalPriority = useManualOverrides ? manualPriority : (predictions?.priority || 'Low');
    const finalDept = useManualOverrides ? manualDept : (predictions?.department || 'Student Affairs & Cultural Office');

    setTimeout(async () => {
      try {
        await APIService.submitComplaint({
          studentID,
          studentName,
          text: complaintText,
          category: finalCategory,
          priority: finalPriority,
          department: finalDept,
          duplicateOfId: predictions?.isDuplicate ? predictions.duplicateOf?.id : undefined,
          fileAttached: attachedFile ? attachedFile.name : undefined
        });
        setSubmitting(false);
        onSuccess();
      } catch (err) {
        console.error('Submission failed', err);
        setSubmitting(false);
      }
    }, 1500);
  };

  return (
    <div id="submit-complaint-section" className="text-slate-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">AI Complaint Submission System</h1>
          <p className="text-xs text-slate-400 mt-1">Our localized NLP classifier screens texts live on port access channels.</p>
        </div>
        <button
          onClick={() => onNavigate('student-dashboard')}
          className="text-xs font-mono text-[#06B6D4] hover:underline cursor-pointer flex items-center gap-1"
        >
          ← Return to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Complaint Input + File upload */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-xl space-y-5">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">
                  Describe Your Concern
                </label>
                <div className="text-[10px] font-mono text-slate-500">
                  {complaintText.length} characters (Recommend &gt;15)
                </div>
              </div>
              <textarea
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Please describe the issue in simple English. For example: 'Under Wednesday dinner, the mess hall served rotten food...' or 'The router near room B302 is broken and wifi disconnected...'"
                rows={6}
                className="w-full bg-[#0B1120]/80 border border-slate-800 hover:border-slate-700 focus:border-[#6366F1] rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#6366F1] transition-all leading-relaxed"
                required
              />
            </div>

            {/* Drag and Drop File Upload Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono mb-2.5">
                Attach Explanatory Assets (optional)
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                  dragActive ? 'border-[#06B6D4] bg-[#06B6D4]/5' : 'border-slate-800 bg-[#0B1120]/30 hover:bg-[#0B1120]/60'
                }`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-elem')?.click()}
              >
                <input
                  type="file"
                  id="file-elem"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,application/pdf"
                />
                
                {attachedFile ? (
                  <div className="flex items-center gap-3 p-2 bg-slate-900/80 rounded-lg border border-slate-800 text-left w-full max-w-sm">
                    <FileText className="h-8 w-8 text-[#06B6D4] flex-shrink-0" />
                    <div className="flex-grow truncate">
                      <p className="text-xs font-bold text-slate-200 truncate">{attachedFile.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{(attachedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="h-8 w-8 text-slate-500 mb-2.5" />
                    <span className="text-xs text-slate-300">Drag & drop asset photo, or <span className="text-[#06B6D4] hover:underline">browse files</span></span>
                    <span className="text-[10px] text-slate-600 block mt-1">Accepts images / documents up to 5MB</span>
                  </>
                )}
              </div>
            </div>

            {/* Trigger Button with loading animation */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || complaintText.length < 10}
                className="w-full bg-gradient-to-r from-[#6366F1] to-[#06B6D4] hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:pointer-events-none rounded-xl py-3 text-xs text-white font-extrabold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                    <span>Analyzing & Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Dispatch Complaint to AI Routing Node</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right column: Prediction preview panels */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
            <h3 className="text-sm font-black text-slate-100 tracking-wide flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#06B6D4]" />
              <span>REAL-TIME COGNITIVE CLASSIFICATION</span>
            </h3>
            <p className="text-[10px] font-mono text-slate-500 mt-1">Prediction matrix refreshes as you type descriptions.</p>

            <div className="mt-6 space-y-4">
              {analyzing ? (
                /* Scanning loader placeholder */
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 font-mono">
                  <div className="relative">
                    <div className="h-10 w-10 border-2 border-[#06B6D4]/30 border-t-[#06B6D4] rounded-full animate-spin" />
                    <Sparkles className="h-4 w-4 text-[#06B6D4] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-[#06B6D4] tracking-widest uppercase">NLP Analyzer Tokenizing Stream...</span>
                </div>
              ) : predictions ? (
                /* Output parameters */
                <div className="space-y-4 text-left">
                  {/* Category Widget */}
                  <div className="bg-[#0B1120]/80 p-3.5 rounded-xl border border-[#6366F1]/10 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-[#6366F1] font-mono font-bold block uppercase tracking-widest">Predicted Category</span>
                      <span className="text-sm font-bold text-slate-200 mt-1 block">{predictions.category}</span>
                    </div>
                    <div className="px-2.5 py-1 bg-[#6366F1]/10 border border-[#6366F1]/30 rounded-lg text-xs font-mono text-[#06B6D4] font-extrabold">
                      {predictions.confidence}% Conf.
                    </div>
                  </div>

                  {/* Priority level */}
                  <div className="bg-[#0B1120]/80 p-3.5 rounded-xl border border-white/5 flex justify-between items-center">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block uppercase tracking-widest">Calculated Priority</span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 mt-1.5 rounded-full text-[10px] font-extrabold font-mono border ${
                        predictions.priority === 'High' 
                          ? 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]' 
                          : predictions.priority === 'Medium'
                          ? 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#F59E0B]'
                          : 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          predictions.priority === 'High' ? 'bg-[#EF4444]' : predictions.priority === 'Medium' ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                        }`} />
                        <span>{predictions.priority}</span>
                      </span>
                    </div>
                    <Clock className="h-5 w-5 text-slate-600" />
                  </div>

                  {/* Allocated cell */}
                  <div className="bg-[#0B1120]/80 p-3.5 rounded-xl border border-white/5">
                    <span className="text-[9px] text-slate-500 font-mono block uppercase tracking-widest">Routing Host Node</span>
                    <span className="text-xs text-slate-300 font-mono font-bold mt-1.5 block">{predictions.department}</span>
                  </div>

                  {/* Multi-Trigger Warning if duplication detected */}
                  {predictions.isDuplicate && predictions.duplicateOf && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#F59E0B]/10 p-3.5 rounded-xl border border-[#F59E0B]/30 text-left space-y-1.5"
                    >
                      <div className="flex items-center gap-2 text-[#F59E0B] font-bold text-xs font-mono">
                        <AlertTriangle className="h-4 w-4" />
                        <span>DUPLICATE RISK DETECTED (Similarity: {predictions.similarityScore}%)</span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-normal">
                        Wait! A similar active concern already exists: <strong className="text-white">{predictions.duplicateOf.id}</strong> (by <span className="text-white">{predictions.duplicateOf.studentName}</span>: <span className="italic">"{predictions.duplicateOf.text.substring(0,60)}..."</span>).
                      </p>
                      <p className="text-[9px] text-[#F59E0B] font-mono leading-normal">
                        To save server bandwidth, the AI recommends attaching your user account to the existing ticket rather than spawning duplicate clusters.
                      </p>
                    </motion.div>
                  )}

                  {/* Manual Override Control box */}
                  <div className="border-t border-slate-800/80 pt-4 mt-2">
                    <button
                      type="button"
                      onClick={() => setUseManualOverrides(!useManualOverrides)}
                      className="text-[11px] font-mono text-[#06B6D4] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{useManualOverrides ? '✓ Rely on Automatic AI predictions' : '🛠 Correct AI Predictions Manually'}</span>
                    </button>

                    {useManualOverrides && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 space-y-3 text-left border-l-2 border-slate-800 pl-3.5"
                      >
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">Category Override</label>
                          <select
                            value={manualCategory}
                            onChange={(e) => {
                              const val = e.target.value as Category;
                              setManualCategory(val);
                            }}
                            className="bg-[#0B1120] border border-slate-800 font-mono text-xs rounded p-1.5 text-slate-200 mt-1 w-full focus:outline-none focus:border-[#6366F1]"
                          >
                            <option value="Academic Support and Resources 234">Academic Support and Resources 234</option>
                            <option value="Food and Cantines">Food and Cantines</option>
                            <option value="Financial Support">Financial Support</option>
                            <option value="Online learning">Online learning</option>
                            <option value="Career opportunities">Career opportunities</option>
                            <option value="International student experiences">International student experiences</option>
                            <option value="Athletics and sports">Athletics and sports</option>
                            <option value="Housing and Transportation">Housing and Transportation</option>
                            <option value="Health and Well-being Support">Health and Well-being Support</option>
                            <option value="Activities and Travelling">Activities and Travelling</option>
                            <option value="Student Affairs">Student Affairs</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">Priority Override</label>
                          <select
                            value={manualPriority}
                            onChange={(e) => setManualPriority(e.target.value as Priority)}
                            className="bg-[#0B1120] border border-slate-800 font-mono text-xs rounded p-1.5 text-slate-200 mt-1 w-full focus:outline-none focus:border-[#6366F1]"
                          >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              ) : (
                /* Welcome prompt */
                <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center">
                  <Cpu className="h-6 w-6 text-slate-700 mb-2" />
                  <span className="text-xs">Awaiting descriptive text...</span>
                  <span className="text-[9px] font-mono mt-1 text-slate-600">Model: SVM & TF-IDF Logistic Regression v3</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
