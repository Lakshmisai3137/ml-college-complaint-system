/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Priority = 'High' | 'Medium' | 'Low';

export type Category = 
  | 'Academic Support and Resources 234'
  | 'Food and Cantines'
  | 'Financial Support'
  | 'Online learning'
  | 'Career opportunities'
  | 'International student experiences'
  | 'Athletics and sports'
  | 'Housing and Transportation'
  | 'Health and Well-being Support'
  | 'Activities and Travelling'
  | 'Student Affairs';

export type Status = 'Pending' | 'In Progress' | 'Resolved' | 'Escalated';

export interface Comment {
  id: string;
  author: string;
  role: 'student' | 'admin' | 'system_ai';
  text: string;
  date: string;
}

export interface Complaint {
  id: string;
  studentID: string;
  studentName: string;
  text: string;
  category: Category;
  priority: Priority;
  department: string;
  status: Status;
  date: string;
  duplicateOfId?: string; // If detected as duplicate of another active complaint
  comments: Comment[];
  fileAttached?: string; // Filename if mock upload is used
  similarityScore?: number; // Similarity to original if duplicate
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'alert';
  userId?: string;
}

export type APIMode = 'mock_ai' | 'flask_backend';

export interface APIConfig {
  mode: APIMode;
  flaskUrl: string;
  useOfflineFallbackIfError: boolean;
}
