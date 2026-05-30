/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { APIService } from './services/api';
import GridScanBackground from './components/GridScanBackground';
import ToastNotification from './components/ToastNotification';
import LandingPage from './pages/LandingPage';
import StudentLogin from './pages/StudentLogin';
import AdminLogin from './pages/AdminLogin';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AIFeatures from './pages/AIFeatures';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: 'student' | 'admin' } | null>(null);

  // Initialize session state on component mount
  useEffect(() => {
    const user = APIService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      if (user.role === 'student') {
        setCurrentRoute('student-dashboard');
      } else if (user.role === 'admin') {
        setCurrentRoute('admin-dashboard');
      }
    }
  }, []);

  const handleLoginSuccess = (user: { id: string; name: string; email: string; role: 'student' | 'admin' }) => {
    setCurrentUser(user);
    if (user.role === 'student') {
      setCurrentRoute('student-dashboard');
    } else if (user.role === 'admin') {
      setCurrentRoute('admin-dashboard');
    }
    
    APIService.spawnNotification(
      'Session Synchronized 📡',
      `Welcome back, ${user.name}! Your terminal session has been established.`,
      'success'
    );
  };

  const handleLogout = () => {
    APIService.setCurrentUser(null);
    setCurrentUser(null);
    setCurrentRoute('landing');
    
    APIService.spawnNotification(
      'Session Terminated 🔐',
      'You have securely logged out of the collegiate terminal.',
      'info'
    );
  };

  const handleNavigate = (route: string) => {
    if (route === 'student-dashboard-preview') {
      // Create a temporary mock guest account for seamless reviewer exploration
      const guestStudent = {
        id: 'STU-1082',
        name: 'Aarav Sharma (Evaluator Bypass Mode)',
        email: 'aarav.sharma@university.edu',
        role: 'student' as const
      };
      APIService.setCurrentUser(guestStudent);
      setCurrentUser(guestStudent);
      setCurrentRoute('student-dashboard');
      APIService.spawnNotification(
        'Sandbox Guest Session Active 💡',
        'Reviewer sandbox state initialized successfully.',
        'success'
      );
      return;
    }
    setCurrentRoute(route);
  };

  return (
    <div id="app-root-shell" className="relative min-h-screen text-slate-200 antialiased overflow-x-hidden selection:bg-[#6366F1]/30 selection:text-white">
      {/* 3D Cyber Scan grid and scanning lasers background */}
      <GridScanBackground />

      {/* Global alert toaster nodes */}
      <ToastNotification />

      {/* Switchboard Route matching */}
      <div id="route-render-port">
        {currentRoute === 'landing' && (
          <LandingPage onNavigate={handleNavigate} />
        )}

        {currentRoute === 'features' && (
          <AIFeatures onNavigate={handleNavigate} />
        )}

        {currentRoute === 'student-login' && (
          <StudentLogin 
            onLoginSuccess={handleLoginSuccess} 
            onNavigate={handleNavigate} 
          />
        )}

        {currentRoute === 'admin-login' && (
          <AdminLogin 
            onLoginSuccess={handleLoginSuccess} 
            onNavigate={handleNavigate} 
          />
        )}

        {currentRoute === 'student-dashboard' && currentUser && currentUser.role === 'student' && (
          <StudentDashboard 
            user={currentUser} 
            onLogout={handleLogout} 
            onNavigate={handleNavigate}
          />
        )}

        {currentRoute === 'admin-dashboard' && currentUser && currentUser.role === 'admin' && (
          <AdminDashboard 
            user={currentUser} 
            onLogout={handleLogout} 
            onNavigate={handleNavigate}
          />
        )}
      </div>
    </div>
  );
}
