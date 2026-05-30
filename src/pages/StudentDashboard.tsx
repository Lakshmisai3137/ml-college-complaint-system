/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, FilePlus, ClipboardList, Info, Bell, User, LogOut, 
  Search, SlidersHorizontal, CheckCircle2, Clock, AlertOctagon, CornerDownRight, 
  X, Filter, Eye, Settings, Plus, RefreshCw, Layers 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';
import { APIService } from '../services/api';
import { Complaint, AppNotification, Category, Priority, Status } from '../types';
import SubmitComplaint from './SubmitComplaint';

interface StudentDashboardProps {
  user: { id: string; name: string; email: string; role: 'student' | 'admin' };
  onLogout: () => void;
  onNavigate: (route: string) => void;
}

export default function StudentDashboard({ user, onLogout, onNavigate }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'submit' | 'history' | 'status' | 'notifications' | 'profile'>('overview');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  // Settings / API Config Modal states
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [apiMode, setApiMode] = useState<'mock_ai' | 'flask_backend'>('mock_ai');
  const [flaskUrl, setFlaskUrl] = useState('http://127.0.0.1:5000');

  // Input for posting a follow-up comment
  const [studentComment, setStudentComment] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const allComps = await APIService.getComplaints();
      // Students should only see their own logged complaints
      const studentComps = allComps.filter(c => c.studentID === user.id);
      setComplaints(studentComps);
      setNotifications(APIService.getNotifications(user.id));
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const config = APIService.getConfig();
    setApiMode(config.mode);
    setFlaskUrl(config.flaskUrl);
  }, [user.id, activeTab]);

  const handleSaveConfig = () => {
    APIService.saveConfig({
      mode: apiMode,
      flaskUrl,
      useOfflineFallbackIfError: true
    });
    setShowConfigModal(false);
    APIService.spawnNotification(
      'Protocol Configurations Mapped 🖥',
      `Switched endpoint node to [${apiMode === 'mock_ai' ? 'Local ML Emulator' : 'Python Flask Ingress Port'}].`,
      'success'
    );
    loadData();
  };

  const handlePostStudentComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !studentComment.trim()) return;

    try {
      const updated = await APIService.updateComplaintStatus(
        selectedComplaint.id,
        selectedComplaint.status,
        studentComment,
        user.name,
        'student'
      );
      setStudentComment('');
      setSelectedComplaint(updated);
      loadData();
    } catch (err) {
      console.error('Add comment error', err);
    }
  };

  const myNotifications = notifications;
  const unreadCount = myNotifications.filter(n => !n.read).length;

  // Counters
  const totalCount = complaints.length;
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const escalatedCount = complaints.filter(c => c.status === 'Escalated').length;

  const highPriorityCount = complaints.filter(c => c.priority === 'High' && c.status !== 'Resolved').length;

  // Preparing chart metrics for user metrics
  const categoryStats = complaints.reduce((acc, current) => {
    acc[current.category] = (acc[current.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barChartData = Object.keys(categoryStats).map(cat => ({
    name: cat,
    "Active Concerns": categoryStats[cat]
  }));

  const pieData = [
    { name: 'Pending', value: pendingCount, color: '#F59E0B' },
    { name: 'In Progress', value: inProgressCount, color: '#06B6D4' },
    { name: 'Resolved', value: resolvedCount, color: '#10B981' },
    { name: 'Escalated', value: escalatedCount, color: '#EF4444' }
  ].filter(p => p.value > 0);

  // Filters logic
  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.text.toLowerCase().includes(searchQuery.toLowerCase()) || c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div id="student-dashboard" className="min-h-screen text-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* 1. Sidebar Panel */}
      <aside className="w-full md:w-64 bg-white/[0.03] backdrop-blur-xl border-r border-white/10 flex flex-col justify-between flex-shrink-0 z-20">
        <div>
          {/* Main Logo brand header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-tr from-[#6366F1] to-[#06B6D4] rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center justify-center">
                <User className="h-4.5 w-4.5 text-white animate-pulse" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-white block">AI<span className="text-[#6366F1]">CMS</span></span>
                <span className="text-[9px] block text-[#06B6D4] font-mono tracking-widest leading-none mt-1">STUDENT PORTAL</span>
              </div>
            </div>
            
            {/* API Config toggle settings gear */}
            <button
              onClick={() => setShowConfigModal(true)}
              className="p-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="API Configuration"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          {/* Connected User Badge */}
          <div className="p-4 mx-4 my-4 bg-white/5 rounded-2xl border border-white/5 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#6366F1]/10 rounded-lg border border-[#6366F1]/30">
                <User className="h-4 w-4 text-[#06B6D4]" />
              </div>
              <div className="truncate">
                <h4 className="text-xs font-bold text-white truncate">{user.name}</h4>
                <p className="text-[9px] text-[#06B6D4] font-mono mt-1">{user.id}</p>
              </div>
            </div>
          </div>

          {/* Navigation link triggers */}
          <nav className="px-4 space-y-1.5 text-left">
            {[
              { id: 'overview', label: 'Dashboard Hub', icon: <LayoutDashboard className="h-4 w-4" /> },
              { id: 'submit', label: 'Submit AI Ticket', icon: <FilePlus className="h-4 w-4 text-[#06B6D4]" /> },
              { id: 'history', label: 'Active Registry', icon: <ClipboardList className="h-4 w-4" /> },
              { id: 'status', label: 'Status Timelines', icon: <Layers className="h-4 w-4" /> },
              { id: 'notifications', label: 'Alerts Logs', icon: (
                <div className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-[#EF4444] text-[8px] font-mono font-bold text-white h-3.5 w-3.5 rounded-full flex items-center justify-center">{unreadCount}</span>}
                </div>
              ) },
              { id: 'profile', label: 'Student Profile', icon: <User className="h-4 w-4 text-indigo-400" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSelectedComplaint(null);
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

        {/* Bottom Panel logs and logout */}
        <div className="p-4 mt-auto border-t border-white/5 space-y-4">
          <div className="bg-white/5 rounded-2xl p-4">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Tunnel Status</div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10B981]"></div>
              <span className="text-[11px] font-medium text-slate-300">
                {apiMode === 'mock_ai' ? 'Local ML Engines Active' : 'Flask Server Connected'}
              </span>
            </div>
          </div>
          <button
            onClick={() => onLogout()}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold rounded-xl text-red-500 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Close Session</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Dashboard panel content */}
      <main className="flex-grow p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto w-full z-10 text-left">
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="py-24 flex items-center justify-center flex-col gap-4 font-mono">
              <div className="h-10 w-10 border-2 border-[#6366F1]/20 border-t-[#6366F1] rounded-full animate-spin" />
              <span className="text-[#06B6D4] text-xs uppercase tracking-widest">Querying DB Repository...</span>
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* ==================== A. OVERVIEW HUB TAB ==================== */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top Stats Deck */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'All Registered', count: totalCount, icon: <ClipboardList className="h-4 w-4 text-slate-400" /> },
                      { label: 'Pending AI Scan', count: pendingCount, icon: <Clock className="h-4 w-4 text-[#F59E0B]" /> },
                      { label: 'In Execution', count: inProgressCount, icon: <RefreshCw className="h-4 w-4 text-[#06B6D4] animate-spin" style={{ animationDuration: '6s' }} /> },
                      { label: 'Archived Resolves', count: resolvedCount, icon: <CheckCircle2 className="h-4 w-4 text-[#10B981]" /> },
                    ].map((stat, idx) => (
                      <div 
                        key={idx}
                        className="bg-white/[0.06] border border-white/10 rounded-2xl p-5 relative overflow-hidden hover:border-white/20 transition-all shadow-md"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{stat.label}</span>
                          {stat.icon}
                        </div>
                        <div className="text-2xl font-bold text-white mt-3">{stat.count}</div>
                      </div>
                    ))}
                  </div>

                  {/* AI Prediction Warning Banner if there is an active High-Priority complaint */}
                  {highPriorityCount > 0 && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3.5 text-left">
                      <AlertOctagon className="h-5 w-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-red-400 font-mono">[URGENT AI NOTICE ACTIVE]</h4>
                        <p className="text-xs text-slate-300 mt-1">
                          You have {highPriorityCount} priority student items cataloged. Facility crews have been prioritized according to model specifications.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Dashboard Graphic Plots and Categorization Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Category Distribution Bar Chart */}
                    <div className="bg-white/[0.06] border border-white/10 p-5 rounded-2xl backdrop-blur-md shadow-md">
                      <h3 className="text-xs font-bold font-mono uppercase text-slate-300 tracking-wider mb-4">Category Load Distributions</h3>
                      <div className="h-60">
                        {barChartData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barChartData}>
                              <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                              <YAxis stroke="#64748B" fontSize={10} tickLine={false} />
                              <ChartTooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', color: '#FFF' }} />
                              <Bar dataKey="Active Concerns" fill="#6366F1" radius={[4, 4, 0, 0]}>
                                {barChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#6366F1' : '#06B6D4'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-slate-500 text-xs font-mono">No data registered. Submit a concern first!</div>
                        )}
                      </div>
                    </div>

                    {/* Status pie chart card */}
                    <div className="bg-white/[0.06] border border-white/10 p-5 rounded-2xl backdrop-blur-md shadow-md">
                      <h3 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider mb-4">Workflow Execution State</h3>
                      <div className="h-60 flex flex-col md:flex-row items-center justify-center gap-6">
                        {pieData.length > 0 ? (
                          <>
                            <div className="h-44 w-44">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={65}
                                    paddingAngle={3}
                                    dataKey="value"
                                  >
                                    {pieData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="space-y-2.5 flex-grow text-left">
                              {pieData.map((entry, i) => (
                                <div key={i} className="flex items-center gap-2.5">
                                  <span className="h-2.5 w-2.5 rounded-full block" style={{ backgroundColor: entry.color }} />
                                  <span className="text-xs font-mono text-slate-300">{entry.name}: <strong className="text-white">{entry.value}</strong></span>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <div className="text-slate-500 text-xs font-mono text-center">No active queries flagged.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Recent table items card */}
                  <div className="bg-slate-900/40 rounded-2xl border border-slate-800/80 backdrop-blur-md overflow-hidden">
                    <div className="p-5 border-b border-slate-800/80 flex justify-between items-center">
                      <h3 className="text-xs font-bold font-mono uppercase text-slate-400 tracking-wider">Recently Synced Event Feeds</h3>
                      <button 
                        onClick={() => setActiveTab('history')}
                        className="text-[11px] font-mono text-[#06B6D4] hover:underline cursor-pointer"
                      >
                        All History ({totalCount})
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-mono">
                            <th className="p-4">Ticket ID</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">Description Text</th>
                            <th className="p-4">Urgency</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-mono">
                          {complaints.length > 0 ? (
                            complaints.slice(0, 3).map((comp) => (
                              <tr key={comp.id} className="hover:bg-slate-900/30 transition-colors">
                                <td className="p-4 font-bold text-slate-200">{comp.id}</td>
                                <td className="p-4">
                                  <span className="px-2.5 py-0.5 rounded-md bg-[#6366F1]/10 border border-[#6366F1]/20 text-slate-300">{comp.category}</span>
                                </td>
                                <td className="p-4 font-sans text-slate-400 max-w-xs truncate">{comp.text}</td>
                                <td className="p-4">
                                  <span className={`inline-block h-2 w-2 rounded-full mr-1.5 ${
                                    comp.priority === 'High' ? 'bg-[#EF4444]' : comp.priority === 'Medium' ? 'bg-[#F59E0B]' : 'bg-[#10B981]'
                                  }`} />
                                  <span>{comp.priority}</span>
                                </td>
                                <td className="p-4">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    comp.status === 'Resolved' ? 'bg-[#10B981]/15 text-[#10B981]' : 
                                    comp.status === 'In Progress' ? 'bg-[#06B6D4]/15 text-[#06B6D4]' :
                                    comp.status === 'Escalated' ? 'bg-[#EF4444]/15 text-[#EF4444]' : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                                  }`}>
                                    {comp.status}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <button
                                    onClick={() => {
                                      setSelectedComplaint(comp);
                                      setActiveTab('status');
                                    }}
                                    className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-[#6366F1]/20 hover:text-white border border-slate-700/50 text-[#06B6D4] transition-all cursor-pointer"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="p-8 text-center text-slate-500">No student cases filed. Press 'Submit AI Ticket' on the sidebar for real-time predictions.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== B. SUBMIT TICKET TAB ==================== */}
              {activeTab === 'submit' && (
                <SubmitComplaint 
                  studentID={user.id} 
                  studentName={user.name} 
                  onNavigate={onNavigate}
                  onSuccess={() => {
                    setActiveTab('history');
                  }}
                />
              )}

              {/* ==================== C. COMPLAINT HISTORY LIST ==================== */}
              {activeTab === 'history' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight">Active Student Registry</h2>
                      <p className="text-xs text-slate-400 mt-1">Review live responses, escalation feedback levels, and logs.</p>
                    </div>

                    {/* Quick filter block */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="relative text-xs">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search tickets, IDs..."
                          className="bg-[#0B1120] border border-slate-800 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:border-[#6366F1] font-mono text-slate-200"
                        />
                      </div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-[#0B1120] border border-slate-800 rounded-lg p-1.5 text-xs text-slate-400 font-mono focus:outline-none"
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
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-[#0B1120] border border-slate-800 rounded-lg p-1.5 text-xs text-slate-400 font-mono focus:outline-none"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Escalated">Escalated</option>
                      </select>
                    </div>
                  </div>

                  {/* High Quality lists */}
                  <div className="grid grid-cols-1 gap-4">
                    {filteredComplaints.length > 0 ? (
                      filteredComplaints.map((comp) => (
                        <div 
                          key={comp.id}
                          className="bg-slate-900/40 rounded-xl border border-slate-800 p-5 hover:border-slate-700/60 transition-all text-left space-y-4"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="font-mono text-xs font-bold text-white uppercase">{comp.id}</span>
                                <span className="text-[10px] font-mono text-[#06B6D4] px-2 py-0.5 rounded bg-[#06B6D4]/10 border border-[#06B6D4]/20">{comp.category}</span>
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                  comp.priority === 'High' ? 'bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  Priority: {comp.priority}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono mt-1.5 block">Logged on {new Date(comp.date).toLocaleString()}</span>
                            </div>

                            <span className={`px-2.5 py-1 text-[10px] rounded-lg font-bold font-mono ${
                              comp.status === 'Resolved' ? 'bg-[#10B981]/15 text-[#10B981]' : 
                              comp.status === 'In Progress' ? 'bg-[#06B6D4]/15 text-[#06B6D4]' : 
                              comp.status === 'Escalated' ? 'bg-[#EF4444]/15 text-[#EF4444]' : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                            }`}>
                              {comp.status}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed font-sans">{comp.text}</p>

                          {comp.fileAttached && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono bg-[#0B1120] py-1 px-2 rounded w-fit">
                              <FilePlus className="h-3.5 w-3.5 text-[#06B6D4]" />
                              <span>Attachment: {comp.fileAttached}</span>
                            </div>
                          )}

                          {/* Action area */}
                          <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center flex-wrap gap-2">
                            <span className="text-[10px] text-slate-500 font-mono">Routed Unit: <strong>{comp.department}</strong></span>
                            <button
                              onClick={() => {
                                setSelectedComplaint(comp);
                                setActiveTab('status');
                              }}
                              className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-[#6366F1]/20 font-mono text-[11px] border border-slate-700/50 flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <span>Inspect Progression Timeline ({comp.comments.length} activity logs)</span>
                              <CornerDownRight className="h-3 w-3 text-[#06B6D4]" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-slate-900/20 py-16 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 font-mono text-xs">
                        No matched active student issues listed under current parameters.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== D. STATUS TIMELINES / LOGS ==================== */}
              {activeTab === 'status' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">System Progression timeline</h2>
                    <p className="text-xs text-slate-400 mt-1">Select any case below to watch automatic AI evaluation states live.</p>
                  </div>

                  {!selectedComplaint ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {complaints.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedComplaint(c)}
                          className="p-5 text-left bg-slate-900/40 rounded-xl border border-slate-800 hover:border-[#6366F1]/40 transition-all space-y-3 cursor-pointer"
                        >
                          <div className="flex justify-between items-center text-xs font-mono font-bold">
                            <span className="text-white">{c.id}</span>
                            <span className="text-[#06B6D4]">{c.category}</span>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{c.text}</p>
                          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/60">
                            <span>{c.comments.length} activity steps</span>
                            <span className="font-bold text-slate-300">{c.status}</span>
                          </div>
                        </button>
                      ))}
                      {complaints.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500 text-xs font-mono">No complaints registered yet. Use "Submit AI Ticket" first.</div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      {/* Left: Summary and Progress Nodes */}
                      <div className="lg:col-span-7 bg-slate-900/40 p-6 rounded-2xl border border-slate-800 space-y-6">
                        <div className="flex justify-between items-start border-b border-slate-850 pb-4">
                          <div>
                            <button
                              onClick={() => setSelectedComplaint(null)}
                              className="text-[10px] text-slate-400 hover:text-white font-mono uppercase bg-slate-850 py-1 px-2.5 rounded hover:bg-slate-800 transition-colors cursor-pointer mb-2"
                            >
                              ← Select other ticket
                            </button>
                            <h3 className="text-base font-bold text-white">{selectedComplaint.id}</h3>
                            <span className="text-[10px] text-[#06B6D4] font-mono mt-1 block">Classified Category: <strong>{selectedComplaint.category}</strong></span>
                          </div>
                          <span className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded ${
                            selectedComplaint.status === 'Resolved' ? 'bg-[#10B981]/20 text-[#10B981]' : 
                            selectedComplaint.status === 'In Progress' ? 'bg-[#06B6D4]/20 text-[#06B6D4]' : 
                            'bg-[#F59E0B]/20 text-[#F59E0B]'
                          }`}>
                            {selectedComplaint.status}
                          </span>
                        </div>

                        {/* Complaint textual content */}
                        <div className="text-xs bg-[#0B1120]/40 border border-white/5 p-4 rounded-xl text-slate-300 italic leading-relaxed">
                          "{selectedComplaint.text}"
                        </div>

                        {/* Animated Step Timeline Nodes */}
                        <div className="space-y-6 text-left relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-[1px] before:bg-slate-800">
                          
                          {/* Step 1: Registered */}
                          <div className="flex gap-4 items-start relative z-10">
                            <span className="h-7.5 w-7.5 rounded-full bg-[#10B981]/15 border border-[#10B981]/50 text-[#10B981] flex items-center justify-center font-mono text-xs font-bold leading-none">1</span>
                            <div>
                              <h5 className="text-xs font-bold text-slate-200">Incident Registry Complete</h5>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{new Date(selectedComplaint.date).toLocaleString()}</p>
                              <p className="text-xs text-slate-400 mt-1.5">Your ticket is logged and encrypted in the university SQL datastore.</p>
                            </div>
                          </div>

                          {/* Step 2: AI predict and classification */}
                          <div className="flex gap-4 items-start relative z-10">
                            <span className="h-7.5 w-7.5 rounded-full bg-[#06B6D4]/15 border border-[#06B6D4]/50 text-[#06B6D4] flex items-center justify-center font-mono text-xs font-bold leading-none">2</span>
                            <div>
                              <h5 className="text-xs font-bold text-slate-200">AI Screening Execution</h5>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">Automated screening complete.</p>
                              <p className="text-xs text-slate-400 mt-1.5">Predicted risk priority parameter matching routed incident directly to the <span className="text-[#06B6D4] font-mono">{selectedComplaint.department}</span>.</p>
                            </div>
                          </div>

                          {/* Step 3: Action resolution state */}
                          <div className="flex gap-4 items-start relative z-10">
                            <span className={`h-7.5 w-7.5 rounded-full flex items-center justify-center font-mono text-xs font-bold leading-none ${
                              selectedComplaint.status !== 'Pending' ? 'bg-[#6366F1]/20 border-[#6366F1] text-white' : 'bg-slate-900 border border-slate-800 text-slate-600'
                            }`}>3</span>
                            <div>
                              <h5 className="text-xs font-bold text-slate-200">Staff Evaluation & Crew Operations</h5>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                Current Status Focus: <strong className="text-slate-300">{selectedComplaint.status}</strong>
                              </p>
                              <p className="text-xs text-slate-400 mt-1.5">
                                Assigned officers are monitoring. The active timeline updates below as resolving steps are taken.
                              </p>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Right: Comments / Live Messages */}
                      <div className="lg:col-span-5 bg-slate-900/40 p-6 rounded-2xl border border-slate-800 space-y-4">
                        <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">Active Incident Logs</h4>
                        
                        <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                          {selectedComplaint.comments.map((com, index) => (
                            <div 
                              key={index}
                              className={`p-3 rounded-xl border text-left flex flex-col gap-1.5 ${
                                com.role === 'system_ai' 
                                  ? 'bg-[#6366F1]/5 border-[#6366F1]/20' 
                                  : com.role === 'admin'
                                  ? 'bg-slate-900 border-slate-800' 
                                  : 'bg-[#0B1120]/60 border-slate-850 ml-6'
                              }`}
                            >
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className={
                                  com.role === 'system_ai' ? 'text-[#06B6D4] font-bold' : com.role === 'admin' ? 'text-[#6366F1] font-bold' : 'text-slate-300'
                                }>
                                  {com.author}
                                </span>
                                <span className="text-slate-500">{new Date(com.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed font-sans">{com.text}</p>
                            </div>
                          ))}
                        </div>

                        {/* Reply box if not resolved */}
                        {selectedComplaint.status !== 'Resolved' ? (
                          <form onSubmit={handlePostStudentComment} className="pt-3 border-t border-slate-800/80 space-y-2">
                            <textarea
                              value={studentComment}
                              onChange={(e) => setStudentComment(e.target.value)}
                              placeholder="Post follow-up update regarding this complaint..."
                              className="w-full bg-[#0B1120] border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 pr-10 focus:outline-none focus:border-[#6366F1] resize-none"
                              rows={2}
                              required
                            />
                            <button
                              type="submit"
                              className="w-full bg-slate-800 hover:bg-[#6366F1] text-white font-bold leading-none py-2 rounded-lg text-xs font-mono transition-colors border border-slate-700/60 hover:border-[#6366F1]/50 cursor-pointer"
                            >
                              Submit Follow-up Update
                            </button>
                          </form>
                        ) : (
                          <div className="p-3 bg-[#10B981]/15 border border-[#10B981]/30 rounded-xl text-center text-xs text-[#10B981] font-mono leading-relaxed">
                            ✓ This student concerns has been resolved and archived. Conversation locked.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ==================== E. ALERTS / NOTICES HUB ==================== */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-white tracking-tight">Telemetry Notification Log</h2>
                      <p className="text-xs text-slate-400 mt-1">Status changes are recorded on the secure ledger.</p>
                    </div>
                    <button
                      onClick={() => {
                        APIService.markAllNotificationsRead();
                        loadData();
                      }}
                      className="text-xs font-mono text-[#06B6D4] hover:underline cursor-pointer"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="space-y-3.5 max-w-3xl">
                    {myNotifications.map((noti) => (
                      <div 
                        key={noti.id}
                        className={`p-4 bg-slate-900/40 rounded-xl border flex items-start gap-3.5 text-left transition-all ${
                          noti.read ? 'border-slate-800/80 brightness-75' : 'border-[#6366F1]/30 bg-[#6366F1]/5'
                        }`}
                        onClick={() => {
                          APIService.markNotificationRead(noti.id);
                          loadData();
                        }}
                      >
                        <div className={`p-1.5 rounded-lg border mt-0.5 ${
                          noti.type === 'success' ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]' :
                          noti.type === 'warning' ? 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]' :
                          noti.type === 'alert' ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]' : 'bg-[#06B6D4]/10 border-[#06B6D4]/30 text-[#06B6D4]'
                        }`}>
                          <Layers className="h-4 w-4" />
                        </div>
                        <div className="flex-grow">
                          <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                            <span>{noti.title}</span>
                            {!noti.read && <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444] animate-pulse" />}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1 font-sans">{noti.message}</p>
                          <span className="text-[9px] text-slate-500 font-mono block mt-2">{new Date(noti.date).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ==================== F. PROFILE METADATA ==================== */}
              {activeTab === 'profile' && (
                <div className="space-y-6 max-w-2xl bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md">
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Identity Profile Node</h2>
                    <p className="text-xs text-slate-400 mt-1">Authorized campus credentials verified under SSL nodes.</p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-800/80">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-mono text-[9px] uppercase text-slate-500">Student Identity Name</span>
                        <div className="p-3 bg-[#0B1120] border border-slate-850 rounded-xl text-xs font-mono font-bold mt-1.5 text-slate-200">{user.name}</div>
                      </div>
                      <div>
                        <span className="font-mono text-[9px] uppercase text-slate-500">System Identity Code</span>
                        <div className="p-3 bg-[#0B1120] border border-slate-850 rounded-xl text-xs font-mono font-bold mt-1.5 text-slate-200">{user.id}</div>
                      </div>
                    </div>

                    <div>
                      <span className="font-mono text-[9px] uppercase text-slate-500">Official Register Mail</span>
                      <div className="p-3 bg-[#0B1120] border border-slate-850 rounded-xl text-xs font-mono font-bold mt-1.5 text-slate-200">{user.email}</div>
                    </div>

                    <div>
                      <span className="font-mono text-[9px] uppercase text-slate-500">Privilege Clearance Level</span>
                      <div className="p-3 bg-slate-800/20 border border-slate-800 rounded-xl text-xs font-mono font-semibold text-[#06B6D4] mt-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>CLEARANCE_LVL_STU_READ_WRITE_ACTIVE</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ==================== API CONFIG / SETTINGS MODAL ==================== */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B1120] border border-[#6366F1]/30 rounded-2xl p-6 max-w-md w-full relative space-y-5 text-left">
            <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-black text-white font-mono uppercase tracking-wide flex items-center gap-2">
                <Settings className="h-4 w-4 text-[#06B6D4]" />
                <span>API CONTROL PROTOCOL</span>
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-slate-500 hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-sans leading-normal">
              For your final-year mini project or homework presentation, choose whether to run predictions locally via the built-in emulator, or connect directly to your Flask Python Backend API.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Operational Ingress Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setApiMode('mock_ai')}
                    className={`p-2.5 rounded-xl border font-mono text-[10px] uppercase font-bold text-center transition-all cursor-pointer ${
                      apiMode === 'mock_ai'
                        ? 'bg-[#6366F1]/10 border-[#6366F1] text-white shadow'
                        : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    💡 Mock Emulator
                  </button>
                  <button
                    type="button"
                    onClick={() => setApiMode('flask_backend')}
                    className={`p-2.5 rounded-xl border font-mono text-[10px] uppercase font-bold text-center transition-all cursor-pointer ${
                      apiMode === 'flask_backend'
                        ? 'bg-[#10B981]/10 border-[#10B981] text-white shadow'
                        : 'bg-transparent border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    🐍 Flask Server
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono text-[#06B6D4] focus:outline-none"
                    placeholder="e.g. http://127.0.0.1:5000"
                  />
                  <p className="text-[9px] text-slate-500 font-sans leading-normal">
                    This must match your running python script’s address (e.g. <code>app.run(port=5000)</code>).
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-3.5 py-1.5 rounded-lg hover:bg-slate-900 border border-transparent text-xs font-mono text-slate-400 cursor-pointer"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-4 py-1.5 bg-gradient-to-r from-[#6366F1] to-[#06B6D4] text-white font-bold rounded-lg text-xs font-mono cursor-pointer hover:shadow-lg transition-all"
              >
                Apply Config
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
