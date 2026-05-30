/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, LayoutDashboard, Settings, Mail, LogOut, CheckCircle2, 
  Trash2, ArrowUpRight, Search, Eye, Filter, UserCheck, Check, 
  AlertTriangle, RefreshCw, Layers, Activity, Users, Send, X, FileText, Bell 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend 
} from 'recharts';
import { APIService } from '../services/api';
import { Complaint, Category, Priority, Status, Comment, AppNotification } from '../types';

interface AdminDashboardProps {
  user: { id: string; name: string; email: string; role: 'student' | 'admin' };
  onLogout: () => void;
  onNavigate: (route: string) => void;
}

export default function AdminDashboard({ user, onLogout, onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'complaints' | 'alerts' | 'analytics' | 'settings'>('dashboard');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');

  // Detailed Modal/Drawer focus states
  const [focusedComplaint, setFocusedComplaint] = useState<Complaint | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [resolutionMessage, setResolutionMessage] = useState('');
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);
  const [escalationMessage, setEscalationMessage] = useState('');

  // Settings
  const [apiMode, setApiMode] = useState<'mock_ai' | 'flask_backend'>('mock_ai');
  const [flaskUrl, setFlaskUrl] = useState('http://127.0.0.1:5000');

  // Live Server Status & Playground Telemetry Trackers
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline' | 'local'>('local');
  const [serverModels, setServerModels] = useState<{
    category_classifier?: boolean;
    category_vectorizer?: boolean;
    priority_classifier?: boolean;
    priority_vectorizer?: boolean;
  } | null>(null);

  // Playground Text States
  const [playgroundText, setPlaygroundText] = useState('');
  const [playgroundResult, setPlaygroundResult] = useState<any>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);

  // Similarity text comparison states
  const [similarityTxt1, setSimilarityTxt1] = useState('WiFi connection is down in dorm room C.');
  const [similarityTxt2, setSimilarityTxt2] = useState('The internet is not working on the 3rd floor of hostel B.');

  const calculateJaccard = (t1: string, t2: string) => {
    const cleanWords = (s: string) => new Set(s.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").split(/\s+/).filter(w => w.trim().length > 2));
    const set1 = cleanWords(t1);
    const set2 = cleanWords(t2);
    if (set1.size === 0 && set2.size === 0) return 0;
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await APIService.getComplaints();
      setComplaints(list);
      setNotifications(APIService.getNotifications());
    } catch (err) {
      console.error('Failed to query admin database', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const config = APIService.getConfig();
    setApiMode(config.mode);
    setFlaskUrl(config.flaskUrl);
  }, [activeTab]);

  useEffect(() => {
    const checkServer = async () => {
      if (apiMode === 'flask_backend') {
        setServerStatus('checking');
        try {
          const checkRes = await fetch(`${flaskUrl}/api/health`);
          if (checkRes.ok) {
            const data = await checkRes.json();
            if (data && data.status === 'online') {
              setServerStatus('online');
              setServerModels(data.models_loaded || null);
              return;
            }
          }
          setServerStatus('offline');
          setServerModels(null);
        } catch (err) {
          setServerStatus('offline');
          setServerModels(null);
        }
      } else {
        setServerStatus('local');
        setServerModels(null);
      }
    };
    checkServer();
  }, [apiMode, flaskUrl, activeTab]);

  const handleSaveConfig = () => {
    APIService.saveConfig({
      mode: apiMode,
      flaskUrl,
      useOfflineFallbackIfError: true
    });
    APIService.spawnNotification(
      'Global Admin Node Configurations Modified 📡',
      `Central server directed successfully toward: ${flaskUrl}.`,
      'success'
    );
    loadData();
  };

  const handleResolveAction = async () => {
    if (!focusedComplaint || !resolutionMessage.trim()) return;

    try {
      const updated = await APIService.updateComplaintStatus(
        focusedComplaint.id,
        'Resolved',
        resolutionMessage,
        user.name,
        'admin'
      );
      setResolutionMessage('');
      setShowResolveDialog(false);
      setFocusedComplaint(updated);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEscalateAction = async () => {
    if (!focusedComplaint || !escalationMessage.trim()) return;

    try {
      const updated = await APIService.updateComplaintStatus(
        focusedComplaint.id,
        'Escalated',
        `🔴 ESCALATION COMMAND EXECUTED: ${escalationMessage}`,
        user.name,
        'admin'
      );
      setEscalationMessage('');
      setShowEscalateDialog(false);
      setFocusedComplaint(updated);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAction = async (id: string) => {
    if (confirm('Are you absolutely sure you want to delete and wipe this student case?')) {
      await APIService.deleteComplaint(id);
      if (focusedComplaint?.id === id) {
        setFocusedComplaint(null);
      }
      loadData();
    }
  };

  const handlePostAdminMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!focusedComplaint || !adminComment.trim()) return;

    try {
      const updated = await APIService.updateComplaintStatus(
        focusedComplaint.id,
        focusedComplaint.status,
        adminComment,
        user.name,
        'admin'
      );
      setAdminComment('');
      setFocusedComplaint(updated);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Basic counters
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const escalatedCount = complaints.filter(c => c.status === 'Escalated').length;

  // Active high priority tickets counts (excluding resolved issues)
  const highPriorityCount = complaints.filter(c => c.priority === 'High' && c.status !== 'Resolved').length;
  // Dynamic mocked active student count (distinct studentId)
  const activeStudentsCount = new Set(complaints.map(c => c.studentID)).size;

  // Visual chart metrics calculations
  // Pie chart counts
  const categoryCount = complaints.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = Object.keys(categoryCount).map(cat => ({
    name: cat,
    value: categoryCount[cat]
  }));

  // Stacked priority bars
  const priorityCount = { High: 0, Medium: 0, Low: 0 };
  complaints.forEach(c => {
    if (c.status !== 'Resolved') {
      priorityCount[c.priority]++;
    }
  });

  const priorityChartData = [
    { name: 'Urgent (High)', Count: priorityCount.High, color: '#EF4444' },
    { name: 'Medium', Count: priorityCount.Medium, color: '#F59E0B' },
    { name: 'Routine (Low)', Count: priorityCount.Low, color: '#10B981' }
  ];

  // Simulated resolution efficiency across different categories
  const deptPerformanceData = [
    { department: 'Academics', "Resolution Day": 1.2 },
    { department: 'Digital Learning', "Resolution Day": 1.5 },
    { department: 'Food & Cantines', "Resolution Day": 1.8 },
    { department: 'Financial Office', "Resolution Day": 1.1 },
    { department: 'Housing & Transit', "Resolution Day": 2.2 }
  ];

  // Filter lists matching
  const filteredList = complaints.filter(c => {
    const matchesSearch = c.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesPriority = selectedPriority === 'All' || c.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
    const matchesDepartment = selectedDepartment === 'All' || c.department.includes(selectedDepartment);

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesDepartment;
  });

  const COLORS = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#F97316', '#14B8A6'];

  return (
    <div id="admin-telemetry-panel" className="min-h-screen text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* 1. Administrative Sidebar */}
      <aside className="w-full md:w-64 bg-white/[0.03] backdrop-blur-xl border-r border-white/10 flex flex-col justify-between flex-shrink-0 z-20">
        <div>
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#6366F1] to-[#06B6D4] rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center justify-center">
              <ShieldAlert className="h-4.5 w-4.5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">AI<span className="text-[#6366F1]">CMS</span></span>
              <span className="text-[9px] block text-[#6366F1] font-mono tracking-widest leading-none mt-1">ADMIN CONTROL</span>
            </div>
          </div>

          <div className="p-4 mx-4 my-4 bg-white/5 rounded-2xl border border-white/5 text-left">
            <span className="text-[10px] text-slate-400 font-mono tracking-wider block">CHIEF ADMINISTRATOR</span>
            <span className="text-xs font-bold text-white block truncate mt-1">{user.name}</span>
          </div>

          <nav className="px-4 space-y-1.5 mt-4 text-left">
            {[
              { id: 'dashboard', label: 'Command Overview', icon: <LayoutDashboard className="h-4 w-4" /> },
              { id: 'complaints', label: 'Manage Complaints', icon: <Layers className="h-4 w-4" /> },
              { id: 'alerts', label: 'Alert Telemetry Logs', icon: (
                <div className="relative">
                  <Bell className="h-4 w-4" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 h-2 w-2 rounded-full ring-2 ring-slate-900" />
                  )}
                </div>
              ) },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setFocusedComplaint(null);
                }}
                className={`w-full flex items-center gap-3 p-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white/10 border-white/10 text-white shadow-sm'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 mt-auto border-t border-white/5 space-y-4">
          <button
            onClick={() => onLogout()}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-xl text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Terminal Exit</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Admin Workspace panel */}
      <main className="flex-grow p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto w-full z-10 text-left">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="py-24 flex items-center justify-center flex-col gap-4 font-mono">
              <RefreshCw className="h-8 w-8 animate-spin text-red-500" />
              <span className="text-slate-400 text-xs tracking-widest uppercase">Authorizing Administrative Sync...</span>
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
            >
              
              {/* ==================== SCREEN A: OVERVIEW HUB ==================== */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Stats Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                    {[
                      { label: 'Cumulative Concerns', count: totalCount, icon: <Layers className="h-4 w-4 text-slate-400" /> },
                      { label: 'Urgent (High) Risk', count: highPriorityCount, icon: <AlertTriangle className="h-4 w-4 text-[#EF4444]" /> },
                      { label: 'Pending Action', count: pendingCount, icon: <Activity className="h-4 w-4 text-[#F59E0B]" /> },
                      { label: 'Successful Resolves', count: resolvedCount, icon: <CheckCircle2 className="h-4 w-4 text-[#10B981]" /> },
                      { label: 'Active Students', count: activeStudentsCount, icon: <Users className="h-4 w-4 text-[#06B6D4]" /> }
                    ].map((stat, idx) => (
                      <div key={idx} className="bg-white/[0.06] border border-white/10 p-5 rounded-2xl text-left relative overflow-hidden hover:border-white/20 transition-all shadow-md">
                        <div className="flex justify-between items-center text-slate-400 text-[10px] uppercase tracking-wider">
                          <span>{stat.label}</span>
                          {stat.icon}
                        </div>
                        <div className="text-2xl font-bold text-white mt-3">{stat.count}</div>
                      </div>
                    ))}
                  </div>

                  {/* Dual Grid graphs overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Urgencies block */}
                    <div className="bg-white/[0.06] border border-white/10 p-6 rounded-2xl shadow-md">
                      <h3 className="text-sm font-semibold text-slate-300 mb-4">Risk Level Priorities Breakdown</h3>
                      <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={priorityChartData}>
                            <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                            <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                            <Bar dataKey="Count" fill="#EF4444" radius={[4, 4, 0, 0]}>
                              {priorityChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Department Performance and efficiency */}
                    <div className="bg-white/[0.06] border border-white/10 p-6 rounded-2xl shadow-md">
                      <h3 className="text-sm font-semibold text-slate-300 mb-4">Department Resolution Efficiency (Days)</h3>
                      <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={deptPerformanceData}>
                            <XAxis dataKey="department" stroke="#94A3B8" fontSize={10} />
                            <YAxis stroke="#94A3B8" fontSize={10} />
                            <Tooltip contentStyle={{ backgroundColor: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                            <Line type="monotone" dataKey="Resolution Day" stroke="#06B6D4" strokeWidth={2.5} dot={{ r: 4 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>

                  {/* Quick complaints table overview */}
                  <div className="bg-white/[0.06] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-md">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center flex-wrap gap-2">
                      <h3 className="text-sm font-semibold text-slate-300">Urgent Pending Triage Queue ({pendingCount} pending)</h3>
                      <button
                        onClick={() => {
                          setSelectedStatus('Pending');
                          setActiveTab('complaints');
                        }}
                        className="text-[11px] font-mono text-[#EF4444] hover:underline cursor-pointer"
                      >
                        Launch Direct Action Table →
                      </button>
                    </div>

                    <div className="overflow-x-auto text-xs">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.03] text-slate-400 font-semibold uppercase tracking-widest">
                            <th className="p-4">Student</th>
                            <th className="p-4">Complaint ID</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Text Description</th>
                            <th className="p-4">Priority Risk</th>
                            <th className="p-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {complaints.filter(c => c.status === 'Pending').slice(0, 3).map((comp) => (
                            <tr key={comp.id} className="hover:bg-white/[0.03] transition-colors">
                              <td className="p-4 font-sans text-slate-200">
                                <div>
                                  <h5 className="font-bold">{comp.studentName}</h5>
                                  <span className="text-[10px] text-slate-500">{comp.studentID}</span>
                                </div>
                              </td>
                              <td className="p-4 text-[#06B6D4] font-bold">{comp.id}</td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 rounded bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20 text-[10px]">{comp.category}</span>
                              </td>
                              <td className="p-4 font-sans text-slate-400 max-w-xs truncate">{comp.text}</td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                  comp.priority === 'High' ? 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]' : 'bg-slate-850 hover:bg-slate-800 text-slate-400'
                                }`}>
                                  {comp.priority}
                                </span>
                              </td>
                              <td className="p-4">
                                <button
                                  onClick={() => {
                                    setFocusedComplaint(comp);
                                    setActiveTab('complaints');
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-[#EF4444] border border-red-500/20 transition-all font-mono text-[10px] cursor-pointer"
                                >
                                  Triage Node
                                </button>
                              </td>
                            </tr>
                          ))}
                          {complaints.filter(c => c.status === 'Pending').length === 0 && (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-500 font-mono">✓ High level clear: No urgent unresolved student complaints pending in database queue.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== SCREEN B: COMPLAINT TRIAGE OPERATIONS ==================== */}
              {activeTab === 'complaints' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight">University Complaint Roster Panel</h2>
                      <p className="text-xs text-slate-400 mt-1">Review student issues, AI classification outputs, and apply administrative actions.</p>
                    </div>

                    {/* Filters Row */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search Student, ID, text..."
                          className="bg-[#0B1120] border border-slate-800 rounded-lg py-1 pl-7.5 pr-3 text-xs text-slate-200 focus:outline-none focus:border-red-500 font-mono"
                        />
                      </div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-[#0B1120] border border-slate-800 rounded-lg p-1.5 font-mono focus:outline-none"
                      >
                        <option value="All">All Categories</option>
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
                      <select
                        value={selectedPriority}
                        onChange={(e) => setSelectedPriority(e.target.value)}
                        className="bg-[#0B1120] border border-white/10 rounded-lg p-1.5 font-mono focus:border-[#6366F1] focus:outline-none transition-all text-xs"
                      >
                        <option value="All">All Priorities</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-[#0B1120] border border-white/10 rounded-lg p-1.5 font-mono focus:border-[#6366F1] focus:outline-none transition-all text-xs"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Escalated">Escalated</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Complaints lists columns */}
                    <div className="lg:col-span-7 bg-white/[0.06] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md shadow-md">
                      <div className="overflow-x-auto text-xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-white/5 bg-white/[0.03] text-slate-400 font-semibold uppercase tracking-widest">
                              <th className="p-4">Student</th>
                              <th className="p-4">Category</th>
                              <th className="p-4">Urgency</th>
                              <th className="p-4">Status</th>
                              <th className="p-4 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {filteredList.length > 0 ? (
                              filteredList.map((comp) => (
                                <tr 
                                  key={comp.id}
                                  className={`hover:bg-white/[0.03] transition-colors cursor-pointer ${
                                    focusedComplaint?.id === comp.id ? 'bg-[#6366F1]/10' : ''
                                  }`}
                                  onClick={() => setFocusedComplaint(comp)}
                                >
                                  <td className="p-4 font-sans text-slate-100">
                                    <div>
                                      <h5 className="font-bold flex items-center gap-1.5">
                                        <span>{comp.studentName}</span>
                                        {comp.duplicateOfId && <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" title="Duplicate Cluster Mapped" />}
                                      </h5>
                                      <span className="text-[10px] text-slate-500 font-mono">{comp.studentID} | {comp.id}</span>
                                    </div>
                                  </td>
                                  <td className="p-4 text-slate-300">{comp.category}</td>
                                  <td className="p-4">
                                    <span className={`inline-block px-2 py-0.5 text-[10px] font-bold border border-transparent rounded ${
                                      comp.priority === 'High' ? 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/20' : 'text-slate-400 bg-white/5'
                                    }`}>
                                      {comp.priority}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      comp.status === 'Resolved' ? 'bg-[#10B981]/15 text-[#10B981]' : 
                                      comp.status === 'In Progress' ? 'bg-[#06B6D4]/15 text-[#06B6D4]' : 
                                      comp.status === 'Escalated' ? 'bg-[#EF4444]/15 text-[#EF4444]' : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                                    }`}>
                                      {comp.status}
                                    </span>
                                  </td>
                                  <td className="p-4 text-center">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setFocusedComplaint(comp);
                                      }}
                                      className="p-1 px-2 text-[10.5px] rounded bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-all cursor-pointer"
                                    >
                                      Review
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">No student complaints found matching criteria.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Right: Detailed Triage Command Center of the focused complaint */}
                    <div className="lg:col-span-12 xl:col-span-5 bg-white/[0.06] border border-white/10 p-6 rounded-2xl backdrop-blur-md shadow-md space-y-6 text-left max-h-[700px] overflow-y-auto">
                      {focusedComplaint ? (
                        <>
                          {/* Case Header */}
                          <div className="flex justify-between items-start border-b border-white/10 pb-4">
                            <div>
                              <span className="font-mono text-xs font-extrabold text-white">{focusedComplaint.id}</span>
                              <span className="block text-[10px] text-slate-500 font-mono mt-1">Submitted by {focusedComplaint.studentName} ({focusedComplaint.studentID})</span>
                            </div>

                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleDeleteAction(focusedComplaint.id)}
                                className="p-2 bg-red-500/15 text-[#EF4444] border border-red-500/20 hover:bg-red-500/30 rounded-lg cursor-pointer"
                                title="Delete Ticket"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setFocusedComplaint(null)}
                                className="p-2 bg-slate-850 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Text description */}
                          <div className="space-y-1.5">
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Case Description Text</span>
                            <div className="p-4 bg-slate-950/60 border border-white/5 rounded-xl text-xs text-slate-300 font-sans leading-relaxed italic">
                              "{focusedComplaint.text}"
                            </div>
                          </div>

                          {focusedComplaint.fileAttached && (
                            <div className="p-2 bg-[#0B1120] border border-slate-800 rounded-lg flex items-center gap-2 text-xs">
                              <FileText className="h-4 w-4 text-[#06B6D4]" />
                              <span className="text-slate-300 truncate">Attached Asset: {focusedComplaint.fileAttached}</span>
                            </div>
                          )}

                          {/* Automated parameters mapping */}
                          <div className="grid grid-cols-2 gap-3.5 text-xs">
                            <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl text-left">
                              <span className="text-[9px] font-mono text-slate-500 block">AI Category</span>
                              <strong className="text-[#06B6D4] font-mono mt-1.5 block">{focusedComplaint.category}</strong>
                            </div>
                            <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl text-left">
                              <span className="text-[9px] font-mono text-slate-500 block">Auto-Assigned Cell</span>
                              <strong className="text-white font-mono mt-1.5 block text-[10px] break-words">{focusedComplaint.department}</strong>
                            </div>
                          </div>

                          {/* Quick Admin Triage Resolution Actions */}
                          <div className="space-y-2 pt-2 border-t border-slate-800">
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-2">Triage & Escalate operations</span>
                            
                            {focusedComplaint.status !== 'Resolved' ? (
                              <div className="grid grid-cols-2 gap-2 text-center font-mono">
                                <button
                                  type="button"
                                  onClick={() => setShowResolveDialog(true)}
                                  className="py-2 rounded-lg bg-[#10B981]/15 hover:bg-[#10B981]/25 border border-[#10B981]/30 text-[#10B981] text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Resolve Issue
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowEscalateDialog(true)}
                                  className="py-2 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-[#EF4444] text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Escalate Ticket
                                </button>
                              </div>
                            ) : (
                              <div className="bg-[#10B981]/10 p-3 rounded-lg text-[#10B981] text-center text-xs font-bold border border-[#10B981]/30">
                                ✓ Case Successfully Resolved & Closed
                              </div>
                            )}
                          </div>

                          {/* Resolution dialog text-area inputs */}
                          {showResolveDialog && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 p-3.5 bg-slate-950 rounded-xl border border-[#10B981]/20">
                              <label className="block text-[10px] font-mono text-slate-400">Add resolution details (which the student will see):</label>
                              <textarea
                                value={resolutionMessage}
                                onChange={(e) => setResolutionMessage(e.target.value)}
                                placeholder="Describe the steps taken (e.g. WiFi router node replaced...)"
                                className="w-full bg-[#0B1120] border border-slate-800 p-2.5 rounded text-xs text-white focus:outline-none"
                                rows={2.5}
                              />
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => setShowResolveDialog(false)} className="text-[10px] text-slate-500 uppercase">Cancel</button>
                                <button onClick={handleResolveAction} className="px-3.5 py-1 bg-[#10B981] hover:bg-[#10B981]/80 text-white rounded font-bold text-[10.5px]">Complete Resolve</button>
                              </div>
                            </motion.div>
                          )}

                          {showEscalateDialog && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3 p-3.5 bg-slate-950 rounded-xl border border-red-500/20">
                              <label className="block text-[10px] font-mono text-slate-400">Describe reasons & instructions for escalation:</label>
                              <textarea
                                value={escalationMessage}
                                onChange={(e) => setEscalationMessage(e.target.value)}
                                placeholder="State reason (e.g. requires secondary budget sanction from Student Dean...)"
                                className="w-full bg-[#0B1120] border border-slate-800 p-2.5 rounded text-xs text-white focus:outline-none"
                                rows={2.5}
                              />
                              <div className="flex gap-2 justify-end">
                                <button onClick={() => setShowEscalateDialog(false)} className="text-[10px] text-slate-500 uppercase">Cancel</button>
                                <button onClick={handleEscalateAction} className="px-3.5 py-1 bg-[#EF4444] hover:bg-red-500 text-white rounded font-bold text-[10.5px]">Escalate Case</button>
                              </div>
                            </motion.div>
                          )}

                          {/* Comments list / Activity audit */}
                          <div className="space-y-3 border-t border-slate-800 pt-4 text-xs">
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-2">Internal Activity & Audit Logs</span>
                            
                            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                              {focusedComplaint.comments.map((com, index) => (
                                <div 
                                  key={index}
                                  className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 ${
                                    com.role === 'system_ai' 
                                      ? 'bg-slate-950/40 border-slate-900' 
                                      : com.role === 'admin'
                                      ? 'bg-slate-900 border-slate-850'
                                      : 'bg-[#6366F1]/5 border-[#6366F1]/10'
                                  }`}
                                >
                                  <div className="flex justify-between items-center text-[10px] font-mono">
                                    <span className={com.role === 'system_ai' ? 'text-[#06B6D4]' : 'text-slate-400'}>{com.author}</span>
                                    <span className="text-slate-500">[{new Date(com.date).toLocaleTimeString()}]</span>
                                  </div>
                                  <p className="text-xs text-slate-300 leading-normal">{com.text}</p>
                                </div>
                              ))}
                            </div>

                            {/* Comment formulation form */}
                            <form onSubmit={handlePostAdminMessage} className="pt-2 flex gap-2">
                              <input
                                type="text"
                                value={adminComment}
                                onChange={(e) => setAdminComment(e.target.value)}
                                placeholder="Log staff feedback or comments..."
                                className="flex-grow bg-[#0B1120] border border-slate-850 rounded-lg py-1.5 px-3 text-xs focus:outline-none focus:border-red-500 text-slate-200"
                                required
                              />
                              <button
                                type="submit"
                                className="p-1 px-3 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700/65 flex items-center justify-center cursor-pointer"
                              >
                                <Send className="h-3.5 w-3.5" />
                              </button>
                            </form>
                          </div>
                        </>
                      ) : (
                        <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center">
                          <ShieldAlert className="h-6 w-6 text-slate-700 mb-2.5 animate-pulse" />
                          <span className="text-xs font-mono">Awaiting triage selection node...</span>
                          <span className="text-[10px] text-slate-650 font-mono mt-1">Select any case on the left table to initiate security details.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== SCREEN C: DEEP AI ANALYTICS ==================== */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Machine Learning Deep Analytics</h2>
                    <p className="text-xs text-slate-400 mt-1">Pre-trained on semantic college vocabulary datasets.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Semantic shares & inference playground */}
                    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                            Semantic Shares & Test Bed
                          </h3>
                        </div>

                        {/* Interactive Prediction Playground */}
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 mb-4 text-xs">
                          <span className="text-[10px] font-mono font-bold text-slate-300 block mb-1.5 uppercase">Test Classifier Pipeline Inference</span>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={playgroundText}
                              onChange={(e) => setPlaygroundText(e.target.value)}
                              placeholder="Type college issue to predict..."
                              className="flex-grow bg-slate-950 border border-white/10 p-2 text-xs font-sans text-slate-200 rounded-lg focus:outline-none focus:border-[#6366F1]"
                            />
                            <button
                              onClick={async () => {
                                if (!playgroundText.trim()) return;
                                setPlaygroundLoading(true);
                                try {
                                  const res = await APIService.analyzeComplaint(playgroundText);
                                  setPlaygroundResult(res);
                                } catch (e) {
                                  console.error(e);
                                } finally {
                                  setPlaygroundLoading(false);
                                }
                              }}
                              className="px-3 bg-[#6366F1] hover:bg-[#5053db] text-xs font-extrabold font-mono rounded-lg transition-colors cursor-pointer text-white"
                            >
                              {playgroundLoading ? '...' : 'Infer'}
                            </button>
                          </div>

                          {playgroundResult && (
                            <div className="mt-3 space-y-1.5 bg-slate-950/80 p-2 rounded-lg border border-white/5 font-mono text-[10px] text-slate-300 text-left">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Predicted Cat:</span>
                                <span className="text-[#06B6D4] font-bold truncate max-w-[150px]">{playgroundResult.category}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Route Gov Dept:</span>
                                <span className="text-slate-400 truncate max-w-[130px]">{playgroundResult.department}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Priority Risk:</span>
                                <span className={`font-bold ${
                                  playgroundResult.priority === 'High' ? 'text-red-400' :
                                  playgroundResult.priority === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                                }`}>{playgroundResult.priority}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-500">Confidence:</span>
                                <span className="text-emerald-400 font-bold">{playgroundResult.confidence}%</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Pie Chart display inside */}
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-500 block mb-2 uppercase">Dataset distribution shares (%)</span>
                          <div className="h-28 flex items-center justify-center">
                            {pieChartData.length > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={22}
                                    outerRadius={38}
                                    dataKey="value"
                                  >
                                    {pieChartData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip contentStyle={{ backgroundColor: '#0B1120', border: '1px solid #1E293B', borderRadius: '12px', fontSize: 10 }} />
                                </PieChart>
                              </ResponsiveContainer>
                            ) : (
                              <div className="text-[10px] font-mono text-slate-500 text-center">Awaiting submissions. No active complaints registered.</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Redundancy Jaccard engine */}
                    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-2 flex justify-between items-center">
                          <span>Live Redundancy Engine</span>
                          <span className="text-[10px] text-emerald-400 font-bold animate-pulse">Running</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 leading-normal mb-3">
                          Performs real-time NLP scan comparing active grievances to automatically isolate systemic duplicate tickets.
                        </p>

                        {/* Real-time scan */}
                        {complaints.length > 1 ? (
                          <div className="space-y-2 mb-3 bg-white/5 p-2 rounded-lg border border-white/5">
                            <span className="text-[9px] font-mono text-slate-400 block uppercase">Continuous Scan Results</span>
                            {(() => {
                              const getWords = (str: string) => new Set(str.toLowerCase().replace(/[^\w\s]/g,'').split(/\s+/).filter(w => w.length > 2));
                              const matchingPairs: { c1: string, c2: string, score: number }[] = [];
                              for (let i = 0; i < complaints.length; i++) {
                                for (let j = i + 1; j < complaints.length; j++) {
                                  const w1 = getWords(complaints[i].text);
                                  const w2 = getWords(complaints[j].text);
                                  const inter = new Set([...w1].filter(x => w2.has(x)));
                                  const uni = new Set([...w1, ...w2]);
                                  const score = uni.size > 0 ? inter.size / uni.size : 0;
                                  if (score > 0.2) {
                                    matchingPairs.push({ c1: complaints[i].id, c2: complaints[j].id, score: Math.round(score * 100) });
                                  }
                                }
                              }
                              
                              if (matchingPairs.length === 0) {
                                return <div className="text-[10px] text-emerald-400 font-mono">✓ High clean: 0 similar complaints matched.</div>;
                              }
                              
                              return (
                                <div className="space-y-1 max-h-20 overflow-y-auto font-mono text-[9px]">
                                  {matchingPairs.slice(0, 3).map((pair, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-red-500/10 text-red-300 p-1 rounded border border-red-500/15">
                                      <span>{pair.c1} ↔ {pair.c2}</span>
                                      <span className="font-bold">{pair.score}% overlapping text</span>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <div className="text-[10px] font-mono text-slate-500 mb-3 bg-black/10 p-2 text-center rounded border border-white/5">
                            Active dataset has too few records to calculate overlap statistics.
                          </div>
                        )}

                        {/* Interactive similarity calculator */}
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-xs space-y-1.5">
                          <span className="text-[9px] font-mono text-slate-300 block uppercase font-bold">Try Similarity Calculator</span>
                          <input
                            type="text"
                            value={similarityTxt1}
                            onChange={(e) => setSimilarityTxt1(e.target.value)}
                            placeholder="Text block A..."
                            className="w-full bg-slate-950 border border-white/10 text-[10px] font-mono p-1.5 rounded focus:outline-none focus:border-[#6366F1]"
                          />
                          <input
                            type="text"
                            value={similarityTxt2}
                            onChange={(e) => setSimilarityTxt2(e.target.value)}
                            placeholder="Text block B..."
                            className="w-full bg-slate-950 border border-white/10 text-[10px] font-mono p-1.5 rounded focus:outline-none focus:border-[#6366F1]"
                          />
                          <div className="flex justify-between items-center pt-1.5 border-t border-white/5 font-mono text-[10px]">
                            <span className="text-slate-500">Jaccard Score</span>
                            <span className={`font-bold ${
                              calculateJaccard(similarityTxt1, similarityTxt2) > 0.4 ? 'text-red-400' :
                              calculateJaccard(similarityTxt1, similarityTxt2) > 0.15 ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                              {Math.round(calculateJaccard(similarityTxt1, similarityTxt2) * 100)}% Word Overlap
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800">
                      <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider mb-4">Urgent Classifications</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-left">
                          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">Average response on High priorities</span>
                          <span className="text-xl font-bold text-[#EF4444] mt-1 block">15 minutes duration</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-normal">
                          Urgent security situations or electrical hazards trigger an automated dispatch notification directly to direct emergency teams.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== SCREEN C-B: TELEMETRY ALERT LOGS ==================== */}
              {activeTab === 'alerts' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <Bell className="h-5 w-5 text-indigo-400" />
                        System Alert Telemetry Logs
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Real-time record of ticket creations, priority escalations, routing decisions, and dispatch logs.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          APIService.markAllNotificationsRead();
                          loadData();
                        }}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-750 text-xs font-semibold rounded-xl text-indigo-400 border border-slate-700/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Mark all as read
                      </button>
                    </div>
                  </div>

                  {/* Telemetry Highlight Panels */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Total Logs Captured</span>
                      <span className="text-2xl font-bold text-white mt-1.5 block">{notifications.length}</span>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Critical Alerts (Red)</span>
                      <span className="text-2xl font-bold text-red-400 mt-1.5 block">{notifications.filter(n => n.type === 'alert').length}</span>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Success Operations</span>
                      <span className="text-2xl font-bold text-emerald-400 mt-1.5 block">{notifications.filter(n => n.type === 'success').length}</span>
                    </div>
                    <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl">
                      <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block">Unread Notifications</span>
                      <span className="text-2xl font-bold text-indigo-400 mt-1.5 block">{notifications.filter(n => !n.read).length}</span>
                    </div>
                  </div>

                  {/* Log filter / search controls */}
                  <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Filter logs by title or dispatch message..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="space-y-2.5 max-w-4xl">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl font-mono text-xs">
                        No system alerts captured inside local ledgers. Submit or routing a student complaint to spawn events.
                      </div>
                    ) : (
                      (() => {
                        const filtered = notifications.filter(noti => {
                          const matchesSearch = noti.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                                noti.message.toLowerCase().includes(searchQuery.toLowerCase());
                          return matchesSearch;
                        });
                        
                        if (filtered.length === 0) {
                          return (
                            <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl font-mono text-xs">
                              No logs matched the phrase "{searchQuery}".
                            </div>
                          );
                        }

                        return filtered.map((noti) => {
                          const alertColors = {
                            info: 'border-blue-500/25 bg-blue-500/5 text-blue-400',
                            success: 'border-emerald-500/25 bg-emerald-500/5 text-emerald-400',
                            warning: 'border-amber-500/25 bg-amber-500/5 text-amber-400',
                            alert: 'border-rose-500/25 bg-rose-500/5 text-rose-400'
                          };
                          return (
                            <div 
                              key={noti.id}
                              onClick={() => {
                                APIService.markNotificationRead(noti.id);
                                loadData();
                              }}
                              className={`p-4 rounded-xl border flex items-start gap-4 text-left transition-all cursor-pointer ${
                                noti.read 
                                  ? 'border-slate-800/80 bg-slate-900/10 brightness-75 hover:brightness-100' 
                                  : 'border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10'
                              }`}
                            >
                              <div className={`p-2 rounded-lg border mt-0.5 ${(alertColors as any)[noti.type] || alertColors.info}`}>
                                {noti.type === 'success' && <CheckCircle2 className="h-4 w-4" />}
                                {noti.type === 'alert' && <ShieldAlert className="h-4 w-4" />}
                                {noti.type === 'warning' && <AlertTriangle className="h-4 w-4 animate-bounce" />}
                                {noti.type === 'info' && <Bell className="h-4 w-4" />}
                              </div>
                              <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="font-bold text-sm text-white leading-snug">{noti.title}</h4>
                                  <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                                    {new Date(noti.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">{noti.message}</p>
                                <div className="flex items-center gap-2 mt-2">
                                  {noti.userId && (
                                    <span className="text-[9px] font-mono bg-slate-800 border border-slate-700 text-slate-400 px-1.5 py-0.5 rounded">
                                      Target student: {noti.userId}
                                    </span>
                                  )}
                                  {!noti.read && (
                                    <span className="text-[8px] font-bold font-mono tracking-wider text-indigo-400 uppercase bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                                      New
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()
                    )}
                  </div>
                </div>
              )}

              {/* ==================== SCREEN D: NETWORK SETTINGS ==================== */}
              {activeTab === 'settings' && (
                <div className="space-y-6 max-w-xl bg-slate-900/40 border border-slate-800 p-6 rounded-2xl backdrop-blur-md">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Portal Network Configurations</h2>
                    <p className="text-xs text-slate-400 mt-1">Configure ports, connections, or simulated ML states in real time.</p>
                  </div>

                  <div className="space-y-5 pt-4 border-t border-slate-800/80">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Operational Ingress Mode</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setApiMode('mock_ai')}
                          className={`p-2.5 rounded-xl border font-mono text-[10px] uppercase font-bold text-center transition-all cursor-pointer ${
                            apiMode === 'mock_ai'
                              ? 'bg-slate-800 border-[#6366F1] text-[#6366F1]'
                              : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          🧠 Local AI Predictor
                        </button>
                        <button
                          type="button"
                          onClick={() => setApiMode('flask_backend')}
                          className={`p-2.5 rounded-xl border font-mono text-[10px] uppercase font-bold text-center transition-all cursor-pointer ${
                            apiMode === 'flask_backend'
                              ? 'bg-slate-800 border-[#10B981] text-[#10B981]'
                              : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          ⚡ Live Flask Server API
                        </button>
                      </div>
                    </div>

                    {apiMode === 'flask_backend' && (
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest">Base API URL Path</label>
                        <input
                          type="text"
                          value={flaskUrl}
                          onChange={(e) => setFlaskUrl(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs font-mono text-[#06B6D4] focus:outline-none"
                          placeholder="e.g. http://127.0.0.1:5000"
                        />
                        <p className="text-[9px] text-slate-500 leading-normal">
                          Direct query responses to the locally spawned Python micro-service.
                        </p>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        onClick={handleSaveConfig}
                        className="px-4 py-2 bg-gradient-to-r from-red-500 to-[#6366F1] text-white font-extrabold rounded-lg text-xs font-mono transition-transform hover:scale-102 cursor-pointer"
                      >
                        Apply Configurations
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </div>
  );
}
