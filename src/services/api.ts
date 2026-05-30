/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Complaint, AppNotification, APIConfig, Category, Priority, Status, Comment } from '../types';
import { predictComplaintDetails, checkDuplicateComplaint } from '../utils/aiPredictor';

// Key names for storage
const COMPLAINTS_KEY = 'ai_portal_complaints';
const CONFIG_KEY = 'ai_portal_config';
const NOTIFICATIONS_KEY = 'ai_portal_notifications';
const LOGGED_IN_USER_KEY = 'ai_portal_user';

// High fidelity seed data for instantaneous showcase
const INITIAL_COMPLAINTS: Complaint[] = [];

const INITIAL_NOTIFICATIONS: AppNotification[] = [];

const DEFAULT_CONFIG: APIConfig = {
  mode: 'mock_ai',
  flaskUrl: 'http://127.0.0.1:5000',
  useOfflineFallbackIfError: true
};

// Seed Localstorage helper
const initializeDB = () => {
  const existingComplaints = localStorage.getItem(COMPLAINTS_KEY);
  if (existingComplaints) {
    try {
      const parsed: Complaint[] = JSON.parse(existingComplaints);
      // CMP-2026-9041 to 9045 are the demo IDs; we filter out any demo items
      const filtered = parsed.filter(c => !c.id.startsWith('CMP-2026-904'));
      localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(filtered));
    } catch (e) {
      localStorage.setItem(COMPLAINTS_KEY, JSON.stringify([]));
    }
  } else {
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify([]));
  }

  const existingNotifications = localStorage.getItem(NOTIFICATIONS_KEY);
  if (existingNotifications) {
    try {
      const parsed: AppNotification[] = JSON.parse(existingNotifications);
      const filtered = parsed.filter(n => !['n1', 'n2', 'n3', 'n4'].includes(n.id));
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered));
    } catch (e) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
    }
  } else {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify([]));
  }

  if (!localStorage.getItem(CONFIG_KEY)) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(DEFAULT_CONFIG));
  }
};

initializeDB();

export const APIService = {
  // Get current system API configurations
  getConfig(): APIConfig {
    try {
      const data = localStorage.getItem(CONFIG_KEY);
      return data ? JSON.parse(data) : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  },

  // Save config details
  saveConfig(config: APIConfig) {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  },

  // Fetch complaints
  async getComplaints(): Promise<Complaint[]> {
    const config = this.getConfig();
    if (config.mode === 'flask_backend') {
      try {
        const resp = await fetch(`${config.flaskUrl}/api/complaints`);
        if (!resp.ok) throw new Error('Flask Server responded with status ' + resp.status);
        const data = await resp.json();
        return data as Complaint[];
      } catch (err) {
        console.warn('Flask server unavailable. Falling back to local store.', err);
        if (!config.useOfflineFallbackIfError) {
          throw err;
        }
      }
    }
    // Default mock behavior
    const local = localStorage.getItem(COMPLAINTS_KEY);
    return local ? JSON.parse(local) : INITIAL_COMPLAINTS;
  },

  // Direct mock persistence update
  saveLocalComplaints(complaints: Complaint[]) {
    localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
  },

  // Analyze text via simulated intelligence OR Flask server API
  async analyzeComplaint(text: string): Promise<{
    category: Category;
    priority: Priority;
    department: string;
    confidence: number;
    isDuplicate: boolean;
    duplicateOf?: Complaint;
    similarityScore?: number;
  }> {
    const config = this.getConfig();
    const existing = await this.getComplaints();

    if (config.mode === 'flask_backend') {
      try {
        const response = await fetch(`${config.flaskUrl}/api/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });
        if (response.ok) {
          const prediction = await response.json();
          // Ask for duplicate check
          const dupRes = checkDuplicateComplaint(text, existing);
          return {
            category: prediction.category as Category,
            priority: prediction.priority as Priority,
            department: prediction.department,
            confidence: prediction.confidence || 94,
            isDuplicate: dupRes.isDuplicate,
            duplicateOf: dupRes.duplicateOf,
            similarityScore: dupRes.score
          };
        }
      } catch (err) {
        console.warn('Prediction API fail - falling back to Local AI Predictor', err);
      }
    }

    // Call state-of-the-art offline NLP model
    const prediction = predictComplaintDetails(text);
    const dupRes = checkDuplicateComplaint(text, existing);

    return {
      category: prediction.category,
      priority: prediction.priority,
      department: prediction.department,
      confidence: prediction.confidence,
      isDuplicate: dupRes.isDuplicate,
      duplicateOf: dupRes.duplicateOf,
      similarityScore: dupRes.score
    };
  },

  // Submit new student complaint
  async submitComplaint(complaintData: {
    studentID: string;
    studentName: string;
    text: string;
    category: Category;
    priority: Priority;
    department: string;
    duplicateOfId?: string;
    fileAttached?: string;
  }): Promise<Complaint> {
    const freshId = `CMP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const systemAiComment: Comment = {
      id: `ai-${Date.now()}`,
      author: 'System AI Classifier',
      role: 'system_ai',
      text: `Automatically screened by NLP routing. Assigned to [${complaintData.department}] under [${complaintData.priority}] priority level. ${
        complaintData.duplicateOfId ? `⚠️ Trigger WARNING: Mark duplicate cluster mapped to relative node ${complaintData.duplicateOfId}.` : 'Status pipeline validated successfully.'
      }`,
      date: new Date().toISOString()
    };

    const newComplaint: Complaint = {
      id: freshId,
      studentID: complaintData.studentID,
      studentName: complaintData.studentName,
      text: complaintData.text,
      category: complaintData.category,
      priority: complaintData.priority,
      department: complaintData.department,
      status: 'Pending',
      date: new Date().toISOString(),
      duplicateOfId: complaintData.duplicateOfId,
      comments: [systemAiComment],
      fileAttached: complaintData.fileAttached
    };

    const config = this.getConfig();
    if (config.mode === 'flask_backend') {
      try {
        const response = await fetch(`${config.flaskUrl}/api/complaints`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newComplaint)
        });
        if (response.ok) {
          const res = await response.json();
          // Append to local database copy for UI updates
          const comps = await this.getComplaints();
          comps.unshift(res);
          this.saveLocalComplaints(comps);
          this.spawnNotification(
            'New AI Ticket Routed 🟢',
            `Complaint ${freshId} has been successfully logged on live Flask cluster.`,
            'success',
            complaintData.studentID
          );
          return res;
        }
      } catch (err) {
        console.warn('Flask server insert failed, appending to local sandbox', err);
      }
    }

    // Default Local storage flow
    const comps = await this.getComplaints();
    comps.unshift(newComplaint);
    this.saveLocalComplaints(comps);

    this.spawnNotification(
      'Complaint Logged Successfully 🟢',
      `Your query for the ${complaintData.category} department is registered under ID ${freshId}. AI routing complete!`,
      'success',
      complaintData.studentID
    );

    return newComplaint;
  },

  // Update Status / Action over a complaint (Admin side)
  async updateComplaintStatus(
    id: string,
    status: Status,
    commentText?: string,
    authorName?: string,
    role?: 'admin' | 'student'
  ): Promise<Complaint> {
    const list = await this.getComplaints();
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Complaint not found');

    const complaint = list[idx];
    complaint.status = status;

    if (commentText) {
      const comment: Comment = {
        id: `com-${Date.now()}`,
        author: authorName || 'Staff Administrator',
        role: role || 'admin',
        text: commentText,
        date: new Date().toISOString()
      };
      complaint.comments.push(comment);
    }

    const systemComment: Comment = {
      id: `sys-${Date.now()}`,
      author: 'System Audit',
      role: 'system_ai',
      text: `Status moved to [${status}] by action executor.`,
      date: new Date().toISOString()
    };
    complaint.comments.push(systemComment);

    const config = this.getConfig();
    if (config.mode === 'flask_backend') {
      try {
        const response = await fetch(`${config.flaskUrl}/api/complaints/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, commentText, author: authorName })
        });
        if (response.ok) {
          const res = await response.json();
          list[idx] = res;
          this.saveLocalComplaints(list);
          return res;
        }
      } catch (err) {
        console.warn('Flask PATCH failed, falling back locally', err);
      }
    }

    list[idx] = complaint;
    this.saveLocalComplaints(list);

    // Create a student alert
    this.spawnNotification(
      `Status Update: ${id} 🎫`,
      `The concern of type [${complaint.category}] has transitioned of priority level to "${status}".`,
      status === 'Resolved' ? 'success' : status === 'Escalated' ? 'alert' : 'info',
      complaint.studentID
    );

    return complaint;
  },

  // Delete/Invalidate a complaint of admin dashboard
  async deleteComplaint(id: string): Promise<boolean> {
    const list = await this.getComplaints();
    const filtered = list.filter((c) => c.id !== id);
    this.saveLocalComplaints(filtered);
    return true;
  },

  // Fetch system notifications, optionally filtered by user ID
  getNotifications(userId?: string): AppNotification[] {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifications: AppNotification[] = data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    if (userId) {
      return notifications.filter((n) => !n.userId || n.userId === 'all' || n.userId === userId);
    }
    return notifications;
  },

  // Mark relative notification read
  markNotificationRead(id: string) {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifications: AppNotification[] = data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    const found = notifications.find((n) => n.id === id);
    if (found) {
      found.read = true;
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    }
  },

  // Clear or mark all notifications read
  markAllNotificationsRead() {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    const notifications: AppNotification[] = data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    notifications.forEach((n) => (n.read = true));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  },

  // Add individual notification associated with a specific user ID for separate log displays
  spawnNotification(
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'alert',
    userId?: string
  ) {
    const data = localStorage.getItem(NOTIFICATIONS_KEY);
    const list: AppNotification[] = data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    
    const resolvedUserId = userId || this.getCurrentUser()?.id || 'all';
    
    const notification: AppNotification = {
      id: `noti-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      date: new Date().toISOString(),
      read: false,
      type,
      userId: resolvedUserId
    };
    list.unshift(notification);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));

    // Also dispatch a browser-level custom event so the UI can listen for immediate visual updates!
    window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }));
  },

  // Mock Active Session Handling
  getCurrentUser() {
    const userStr = localStorage.getItem(LOGGED_IN_USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  setCurrentUser(user: { id: string; name: string; email: string; role: 'student' | 'admin' } | null) {
    if (user) {
      localStorage.setItem(LOGGED_IN_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOGGED_IN_USER_KEY);
    }
  }
};
