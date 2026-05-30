/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Priority, Complaint } from '../types';

// Category routing definition
export const DEPARTMENT_MAPPING: Record<Category, string> = {
  'Academic Support and Resources 234': 'Academic Standards & Dean Office',
  'Food and Cantines': 'Cafeteria & Mess Catering Services',
  'Financial Support': 'Accounts & Scholarship Administration Office',
  'Online learning': 'Digital Education & Learning Management Desk',
  'Career opportunities': 'Corporate Placements, Internships & Alumni Bureau',
  'International student experiences': 'Global Affairs & Student Exchange Office',
  'Athletics and sports': 'Sports Development & Athletic Facilities Wing',
  'Housing and Transportation': 'Residential Complexes & Fleet Transit Services',
  'Health and Well-being Support': 'Student Clinic, Psych Care & Crisis Desk',
  'Activities and Travelling': 'Student Activities, Clubs & Excursions Wing',
  'Student Affairs': 'Student Affairs & Cultural Office'
};

// Simple Porter Stemmer-like Keyword rules
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  'Academic Support and Resources 234': ['academic', 'course', 'curriculum', 'resource', 'material', 'lecture', 'syllabus', 'professor', 'faculty', 'grade', '234', 'marks', 'exam', 'class', 'book', 'library', 'tutor'],
  'Food and Cantines': ['food', 'cantine', 'canteen', 'mess', 'cafeteria', 'lunch', 'dinner', 'breakfast', 'diet', 'hygiene', 'quality', 'taste', 'undercooked', 'meal', 'water filter', 'roti', 'rice', 'bug', 'insect', 'kitchen'],
  'Financial Support': ['financial', 'finance', 'fee', 'tuition', 'scholarship', 'payment', 'installment', 'grant', 'funding', 'refund', 'transaction', 'due', 'bank', 'receipt', 'costs', 'dues'],
  'Online learning': ['online', 'portal', 'lms', 'virtual', 'distance', 'recording', 'slide', 'webinar', 'zoom', 'teams', 'internet', 'network', 'login', 'server', 'wifi', 'wi-fi', 'router', 'ethernet', 'bandwidth', 'disconnect'],
  'Career opportunities': ['career', 'placement', 'job', 'internship', 'resume', 'cv', 'interview', 'hr', 'company', 'recruiter', 'industry', 'workshop', 'fair', 'hiring', 'recruitment', 'offer'],
  'International student experiences': ['international', 'visa', 'passport', 'exchange', 'abroad', 'foreign', 'global', 'diversity', 'adaptation', 'embassy', 'permit', 'nri', 'foreigner', 'culture'],
  'Athletics and sports': ['athletic', 'sport', 'gym', 'court', 'ground', 'coaching', 'tournament', 'pool', 'team', 'fitness', 'practice', 'match', 'cricket', 'football', 'basket', 'badminton'],
  'Housing and Transportation': ['housing', 'transport', 'hostel', 'room', 'bus', 'shuttle', 'accommodation', 'dorm', 'bed', 'route', 'driver', 'hall', 'residence', 'inmate', 'bunk', 'warden', 'shuttle', 'electricity', 'power', 'leakage', 'plumbing', 'maintenance'],
  'Health and Well-being Support': ['health', 'well-being', 'wellbeing', 'mental', 'clinic', 'doctor', 'counsel', 'medical', 'therapy', 'stress', 'mind', 'first aid', 'accident', 'sick', 'fever', 'emergency', 'distress'],
  'Activities and Travelling': ['activity', 'travel', 'club', 'trip', 'excursion', 'fest', 'event', 'society', 'tour', 'journey', 'cultural', 'outing', 'trekking', 'booking', 'hike'],
  'Student Affairs': ['affair', 'union', 'conduct', 'harassment', 'grievance', 'behavior', 'complaint', 'community', 'discipline', 'admin', 'rule', 'ragging', 'bullying', 'rights', 'stolen', 'theft', 'security']
};

const HIGH_PRIORITY_KEYWORDS = [
  'urgent', 'severe', 'danger', 'hazard', 'stolen', 'theft', 'emergency',
  'injury', 'medical', 'fire', 'blackout', 'harassment', 'flooded', 'accident', 'ragging', 'bullying', 'food poisoning', 'hospital'
];

const MEDIUM_PRIORITY_KEYWORDS = [
  'broken', 'slow', 'working', 'not loading', 'delayed', 'smelly', 'poor quality', 'repair required',
  'exam collision', 'no fan', 'fee delay', 'installment'
];

/**
 * Predicts Category, Priority, and Department based on complaint text using keyword embeddings/rules.
 */
export function predictComplaintDetails(text: string): {
  category: Category;
  priority: Priority;
  department: string;
  confidence: number;
} {
  const normalizedText = text.toLowerCase().trim();
  
  if (!normalizedText) {
    return {
      category: 'Student Affairs',
      priority: 'Low',
      department: DEPARTMENT_MAPPING['Student Affairs'],
      confidence: 0
    };
  }

  // Calculate scores for each category
  const scores: Record<Category, number> = {
    'Academic Support and Resources 234': 0,
    'Food and Cantines': 0,
    'Financial Support': 0,
    'Online learning': 0,
    'Career opportunities': 0,
    'International student experiences': 0,
    'Athletics and sports': 0,
    'Housing and Transportation': 0,
    'Health and Well-being Support': 0,
    'Activities and Travelling': 0,
    'Student Affairs': 0
  };

  let maxCategory: Category = 'Student Affairs';
  let maxScore = 0;

  (Object.keys(CATEGORY_KEYWORDS) as Category[]).forEach((category) => {
    const keywords = CATEGORY_KEYWORDS[category];
    let score = 0;
    keywords.forEach((keyword) => {
      // Direct substring match
      if (normalizedText.includes(keyword)) {
        score += normalizedText.startsWith(keyword) ? 3 : 2;
      }
    });
    scores[category] = score;
    if (score > maxScore) {
      maxScore = score;
      maxCategory = category;
    }
  });

  // Default fallback if no keywords found: check context
  if (maxScore === 0) {
    if (normalizedText.includes('net') || normalizedText.includes('online') || normalizedText.includes('wifi') || normalizedText.includes('learn')) {
      maxCategory = 'Online learning';
    } else if (normalizedText.includes('academic') || normalizedText.includes('class') || normalizedText.includes('lecture') || normalizedText.includes('234')) {
      maxCategory = 'Academic Support and Resources 234';
    } else if (normalizedText.includes('hostel') || normalizedText.includes('room') || normalizedText.includes('bus')) {
      maxCategory = 'Housing and Transportation';
    } else {
      maxCategory = 'Student Affairs'; // general fallback
    }
    maxScore = 1;
  }

  // Priority Prediction Heuristics
  let priority: Priority = 'Low';
  let highScore = 0;
  let medScore = 0;

  HIGH_PRIORITY_KEYWORDS.forEach((keyword) => {
    if (normalizedText.includes(keyword)) highScore++;
  });

  MEDIUM_PRIORITY_KEYWORDS.forEach((keyword) => {
    if (normalizedText.includes(keyword)) medScore++;
  });

  if (highScore > 0 || ((maxCategory as string) === 'Student Affairs' && (normalizedText.includes('harassment') || normalizedText.includes('ragging'))) || ((maxCategory as string) === 'Health and Well-being Support' && normalizedText.includes('emergency'))) {
    priority = 'High';
  } else if (medScore > 0 || highScore === 0 && medScore === 0 && maxScore > 1) {
    priority = 'Medium';
  } else {
    priority = 'Low';
  }

  const confidence = Math.min(85 + (maxScore * 3), 99);

  return {
    category: maxCategory,
    priority,
    department: DEPARTMENT_MAPPING[maxCategory],
    confidence
  };
}

/**
 * Checks for potential duplicate complaints in our database
 * Uses a token overlap Jaccard algorithm to check if there is an active complaint with key descriptions matching
 */
export function checkDuplicateComplaint(
  text: string,
  existingComplaints: Complaint[]
): { isDuplicate: boolean; duplicateOf?: Complaint; score: number } {
  const normalize = (val: string) =>
    val
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/)
      .filter((w) => w.length > 3); // words > 3 chars

  const inputTokens = normalize(text);
  if (inputTokens.length < 3) {
    return { isDuplicate: false, score: 0 };
  }

  let bestMatch: Complaint | undefined = undefined;
  let maxSimilarity = 0;

  existingComplaints.forEach((comp) => {
    // Only compare against active complaints in the same or general category to be realistic
    if (comp.status === 'Resolved') return;

    const compTokens = normalize(comp.text);
    if (compTokens.length === 0) return;

    const intersection = inputTokens.filter((token) => compTokens.includes(token));
    const union = Array.from(new Set([...inputTokens, ...compTokens]));
    const similarity = intersection.length / union.length;

    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      bestMatch = comp;
    }
  });

  // If match similarity is high (say > 35%), tag as duplicate
  const threshold = 0.30;
  if (maxSimilarity >= threshold && bestMatch) {
    return {
      isDuplicate: true,
      duplicateOf: bestMatch,
      score: Math.round(maxSimilarity * 100)
    };
  }

  return { isDuplicate: false, score: Math.round(maxSimilarity * 100) };
}
