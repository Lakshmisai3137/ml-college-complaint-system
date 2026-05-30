# 🎓 AI College Complaint Management System (AICMS)

> **An intelligent, ML-powered student grievance portal** that automatically classifies complaints, predicts priority levels, and routes them to the correct department — all in real-time.

---

## 📌 Overview

AICMS is a full-stack web application built with **React + TypeScript** on the frontend and a **Flask** backend that serves pre-trained **scikit-learn ML models**. Students can submit complaints in plain text, and the system automatically:

- 🏷️ **Categorizes** the complaint (e.g., Academic, Food, Health, Housing...)
- 🚨 **Predicts the priority** (High / Medium / Low)
- 🏢 **Routes it to the correct department**
- 📊 **Tracks and visualizes** complaint status over time

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 ML-Powered Classification | Uses trained `LinearSVC` and `LogisticRegression` models with TF-IDF vectorization |
| 📋 Student Portal | Submit complaints, track status, view analytics dashboard |
| 🛡️ Admin Dashboard | Review, resolve, comment, and manage all complaints |
| 📊 Analytics & Charts | Bar charts, pie charts, and line graphs for complaint trends |
| 🔔 Notification System | Real-time in-app notifications for status updates |
| 🔁 Smart Fallback | Keyword-based heuristic engine if Flask backend is unavailable |
| 🔍 Duplicate Detection | Jaccard similarity algorithm to flag duplicate complaints |
| 💾 LocalStorage Persistence | Frontend data persists across sessions without a database |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS v4**
- **Framer Motion** (animations)
- **Recharts** (data visualization)
- **Lucide React** (icons)

### Backend
- **Python 3.x** + **Flask**
- **Flask-CORS**
- **scikit-learn** (ML models)
- **joblib** (model loading)
- **numpy**

### ML Models (pre-trained)
| File | Description |
|---|---|
| `models/category_model.pkl` | `LinearSVC` — classifies complaint into 11 categories |
| `models/tfidf_vectorizer.pkl` | TF-IDF vectorizer for category classification |
| `models/priority_model.pkl` | `LogisticRegression` — predicts High / Medium / Low priority |
| `models/priority_vectorizer.pkl` | TF-IDF vectorizer for priority prediction |

---

## 📁 Project Structure

```
ml projket/
├── app.py                   # Flask backend — serves ML model predictions
├── models/
│   ├── category_model.pkl
│   ├── tfidf_vectorizer.pkl
│   ├── priority_model.pkl
│   └── priority_vectorizer.pkl
├── src/
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── StudentLogin.tsx
│   │   ├── StudentDashboard.tsx
│   │   ├── SubmitComplaint.tsx
│   │   ├── AdminLogin.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── AIFeatures.tsx
│   ├── services/
│   │   └── api.ts           # API layer (Flask calls + localStorage)
│   ├── utils/
│   │   └── aiPredictor.ts   # Fallback keyword-based ML logic
│   ├── types.ts             # Shared TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+
- **Python** 3.9+
- **pip**

---

### 1. Clone the Repository

```bash
git clone https://github.com/Lakshmisai3137/ml-college-complaint-system.git
cd ml-college-complaint-system
```

---

### 2. Start the Flask Backend (ML API)

Install Python dependencies:

```bash
pip install flask flask-cors joblib scikit-learn numpy
```

Run the Flask server:

```bash
python app.py
```

The backend will start at **http://localhost:5000**

> ✅ You should see:
> ```
> 🚀 [SUCCESS] Load classification pipeline: category_model.pkl & tfidf_vectorizer.pkl
> 🚀 [SUCCESS] Load prioritization pipeline: priority_model.pkl & priority_vectorizer.pkl
> * Running on http://127.0.0.1:5000
> ```

---

### 3. Start the React Frontend

Install Node.js dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The frontend will start at **http://localhost:3000**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check if Flask + models are loaded |
| `POST` | `/api/predict` | Predict category, priority & department from complaint text |
| `GET` | `/api/complaints` | Fetch all complaints |
| `POST` | `/api/complaints` | Create a new complaint |
| `PATCH` | `/api/complaints/:id` | Update status or add admin comment |

### Example: `/api/predict`

**Request:**
```json
POST /api/predict
{
  "text": "The food in the cafeteria has insects and is completely unhygienic."
}
```

**Response:**
```json
{
  "category": "Food and Cantines",
  "priority": "High",
  "department": "Cafeteria & Mess Catering Services",
  "confidence": 94.5
}
```

---

## 🗂️ Complaint Categories

| Category | Routed Department |
|---|---|
| Academic Support and Resources | Academic Standards & Dean Office |
| Food and Canteens | Cafeteria & Mess Catering Services |
| Financial Support | Accounts & Scholarship Administration Office |
| Online Learning | Digital Education & Learning Management Desk |
| Career Opportunities | Corporate Placements, Internships & Alumni Bureau |
| International Student Experiences | Global Affairs & Student Exchange Office |
| Athletics and Sports | Sports Development & Athletic Facilities Wing |
| Housing and Transportation | Residential Complexes & Fleet Transit Services |
| Health and Well-being Support | Student Clinic, Psych Care & Crisis Desk |
| Activities and Travelling | Student Activities, Clubs & Excursions Wing |
| Student Affairs | Student Affairs & Cultural Office |

---

## 🧠 How the ML Pipeline Works

```
User submits complaint text
        │
        ▼
Flask receives POST /api/predict
        │
        ├─── TF-IDF Vectorizer (category) ──► LinearSVC ──► Predicted Category
        │
        └─── TF-IDF Vectorizer (priority) ──► LogisticRegression ──► Priority (High/Medium/Low)
        │
        ▼
Returns: { category, priority, department, confidence }
        │
        ▼
React Frontend displays results and saves complaint
```

> 💡 **Fallback Mode**: If the Flask backend is unreachable, the frontend uses a keyword-matching engine (`aiPredictor.ts`) to provide predictions locally in the browser — no external service required.

---

## 🔐 Login Credentials (Demo)

The app uses localStorage-based auth for demonstration purposes.

**Student Login:** Any name + student email format (e.g., `student@college.edu`)  
**Admin Login:** Preconfigured admin credentials set in `api.ts`

---

## ⚠️ Notes

- The ML models were trained with **scikit-learn 1.6.1**. Running on a newer version (1.8.x) may show `InconsistentVersionWarning` — this is safe to ignore for inference.
- The Flask backend runs in `debug=True` mode by default. For production, use a WSGI server like **Gunicorn**.
- Complaint data is stored in **browser localStorage** and the Flask **in-memory list** — it resets on server restart. For production, connect a database (e.g., PostgreSQL, SQLite).

---


## 🙌 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

*Built using React, Flask, and scikit-learn*
