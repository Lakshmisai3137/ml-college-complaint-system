# -*- coding: utf-8 -*-
"""
AI College Complaint Management System (AICMS) - Flask integration backend.
This file serves as the bridge between your React Frontend and your trained Machine Learning Models (.pkl files).

To run this backend:
1. Install requirements:
   pip install flask flask-cors joblib scikit-learn numpy

2. Ensure your model files are placed in the same directory as this file:
   - category_model.pkl
   - tfidf_vectorizer.pkl
   - priority_model.pkl
   - priority_vectorizer.pkl

3. Launch the Server:
   python app.py
"""

import os
import pickle
import traceback
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS so your React Dev server on port 3000 can talk to this API on port 5000
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Define the exact department mapping for categories matching the React client
DEPARTMENT_MAPPING = {
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
}

# In-memory storage for active complaints (initialized with empty list to allow genuine student records only)
# This mimics the React complaints structure
complaints_database = []

# Global variables for model storage
category_model = None
tfidf_vectorizer = None
priority_model = None
priority_vectorizer = None

def load_ml_models():
    """Attempts to safely load scikit-learn models and respective vectorizers."""
    global category_model, tfidf_vectorizer, priority_model, priority_vectorizer
    
    # Paths to your .pkl assets
    dir_path = os.path.dirname(os.path.realpath(__file__))
    models_dir = os.path.join(dir_path, 'models')
    cat_model_path = os.path.join(models_dir, 'category_model.pkl')
    tfidf_v_path = os.path.join(models_dir, 'tfidf_vectorizer.pkl')
    prio_model_path = os.path.join(models_dir, 'priority_model.pkl')
    prio_v_path = os.path.join(models_dir, 'priority_vectorizer.pkl')
    
    print("\n" + "="*50)
    print("🤖 STARTING ML MODEL HANDSHAKE SEQUENCE")
    print("="*50)

    # 1. Load Category Classifier & TF-IDF Vectorizer
    try:
        if os.path.exists(cat_model_path) and os.path.exists(tfidf_v_path):
            with open(cat_model_path, 'rb') as f:
                category_model = joblib.load(f)
            with open(tfidf_v_path, 'rb') as f:
                tfidf_vectorizer = joblib.load(f)
            print("🚀 [SUCCESS] Load classification pipeline: category_model.pkl & tfidf_vectorizer.pkl")
        else:
            print("⚠️ [WARNING] Category models are not placed in current folder hierarchy.")
    except Exception as e:
        print(f"❌ [CRITICAL] Failed loading category pickle files: {e}")

    # 2. Load Priority Classifier & priority Vectorizer
    try:
        if os.path.exists(prio_model_path) and os.path.exists(prio_v_path):
            with open(prio_model_path, 'rb') as f:
                priority_model = joblib.load(f)
            with open(prio_v_path, 'rb') as f:
                priority_vectorizer = joblib.load(f)
            print("🚀 [SUCCESS] Load prioritization pipeline: priority_model.pkl & priority_vectorizer.pkl")
        else:
            print("⚠️ [WARNING] Priority models are not placed in current folder hierarchy.")
    except Exception as e:
        print(f"❌ [CRITICAL] Failed loading priority pickle files: {e}")
        
    print("="*50 + "\n")

# Run load once at script startup
load_ml_models()


# --- API ROUTE HANDLERS ---

@app.route('/health', methods=['GET'])
@app.route('/api/health', methods=['GET'])
def health_check():
    """System heartbeat verification."""
    return jsonify({
        "status": "online",
        "models_loaded": {
            "category_classifier": category_model is not None,
            "category_vectorizer": tfidf_vectorizer is not None,
            "priority_classifier": priority_model is not None,
            "priority_vectorizer": priority_vectorizer is not None
        }
    }), 200


@app.route('/api/predict', methods=['POST'])
def predict_complaint():
    """
    Main Prediction Endpoint.
    Receives JSON text input, transforms it via vectorizer, and infers
    Category, Priority and corresponding Department Routing.
    """
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "Missing key 'text' in JSON payload"}), 400
        
        text = data['text']
        
        # 🟢 CLASSICAL FALLBACK LOGIC
        # If model files are not yet uploaded in this developer stage, we use a smart fallback rules engine:
        predicted_category = "Student Affairs"
        predicted_priority = "Medium"
        confidence_val = 88.0
        
        # 1. Inference for Category Model
        if category_model and tfidf_vectorizer:
            try:
                # Vectorize text through TF-IDF
                vectorized_text = tfidf_vectorizer.transform([text])
                # Predict category
                pred_label = category_model.predict(vectorized_text)[0]
                predicted_category = str(pred_label)
                
                # Predict confidence probability if supported
                if hasattr(category_model, "predict_proba"):
                    probs = category_model.predict_proba(vectorized_text)[0]
                    confidence_val = round(float(probs.max()) * 100, 2)
            except Exception as ml_err:
                print(f"ML categorization inference error: {ml_err}")
        else:
            # Smart Regex fallback if pkl is isolated/unconfigured
            lower_text = text.lower()
            if any(k in lower_text for k in ['course', 'classroom', 'exam', 'professor', 'faculty', 'assignment']):
                predicted_category = "Academic Support and Resources 234"
            elif any(k in lower_text for k in ['food', 'mess', 'canteen', 'lunch', 'dinner', 'plate']):
                predicted_category = "Food and Cantines"
            elif any(k in lower_text for k in ['scholarship', 'fee', 'account', 'invoice', 'payment']):
                predicted_category = "Financial Support"
            elif any(k in lower_text for k in ['online', 'portal', 'lms', 'zoom', 'internet', 'wifi']):
                predicted_category = "Online learning"
            elif any(k in lower_text for k in ['job', 'placement', 'interview', 'internship', 'career']):
                predicted_category = "Career opportunities"
            elif any(k in lower_text for k in ['international', 'visa', 'passport', 'exchange', 'abroad']):
                predicted_category = "International student experiences"
            elif any(k in lower_text for k in ['sports', 'gym', 'stadium', 'athletics', 'cricket']):
                predicted_category = "Athletics and sports"
            elif any(k in lower_text for k in ['bus', 'shuttle', 'hostel', 'room', 'apartment', 'residence', 'dorm']):
                predicted_category = "Housing and Transportation"
            elif any(k in lower_text for k in ['clinic', 'psychologist', 'fever', 'health', 'medical', 'stress']):
                predicted_category = "Health and Well-being Support"
            elif any(k in lower_text for k in ['trip', 'travel', 'club', 'excursion', 'journey']):
                predicted_category = "Activities and Travelling"
            else:
                predicted_category = "Student Affairs"

        # 2. Inference for Priority Model
        if priority_model and priority_vectorizer:
            try:
                # Vectorize text through Priority Vectorizer
                vectorized_prio = priority_vectorizer.transform([text])
                predicted_priority = str(priority_model.predict(vectorized_prio)[0])
            except Exception as ml_err:
                print(f"ML priority inference error: {ml_err}")
        else:
            # Heuristic default priority analyzer keyword scan:
            lower_text = text.lower()
            if any(k in lower_text for k in ['urgent', 'severe', 'emergency', 'blackout', 'injury', 'ragging', 'theft', 'harassment']):
                predicted_priority = "High"
            elif any(k in lower_text for k in ['broken', 'leakage', 'collision', 'slow', 'delay']):
                predicted_priority = "Medium"
            else:
                predicted_priority = "Low"

        # Safe verification to ensure value match matching constraints
        if predicted_priority not in ["High", "Medium", "Low"]:
            # standard capitalizing
            predicted_priority = predicted_priority.capitalize()
            if predicted_priority not in ["High", "Medium", "Low"]:
                predicted_priority = "Medium"

        # Mapped corresponding department
        routed_dept = DEPARTMENT_MAPPING.get(predicted_category, 'Student Affairs & Cultural Office')

        return jsonify({
            "category": predicted_category,
            "priority": predicted_priority,
            "department": routed_dept,
            "confidence": confidence_val
        }), 200

    except Exception as e:
        print(f"Prediction crash logged: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/complaints', methods=['GET'])
def get_complaints():
    """Returns lists of currently registered student grievances."""
    return jsonify(complaints_database), 200


@app.route('/api/complaints', methods=['POST'])
def create_complaint():
    """Saves complaints registered straight out of the React client portal."""
    try:
        new_comp = request.get_json()
        if not new_comp:
            return jsonify({"error": "Invalid request parameters"}), 400
            
        # Append to live simulated backplane
        complaints_database.insert(0, new_comp)
        return jsonify(new_comp), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/complaints/<string:id>', methods=['PATCH'])
def patch_complaint(id):
    """Updates complaints status & logs executive administrative action comments."""
    try:
        update_data = request.get_json()
        target = None
        for item in complaints_database:
            if item['id'] == id:
                target = item
                break
                
        if not target:
            return jsonify({"error": f"Complaint {id} index location not found"}), 404
            
        if 'status' in update_data:
            target['status'] = update_data['status']
            
        # Push administrative feedback logs securely
        if 'commentText' in update_data and update_data['commentText'].strip():
            target['comments'].append({
                "id": f"c-rem-{os.urandom(4).hex()}",
                "author": update_data.get('author', 'Official Administration'),
                "role": "admin" if update_data.get('author') != 'System AI' else "system_ai",
                "text": update_data['commentText'],
                "date": "2026-05-30T12:00:00Z"
            })
            
        return jsonify(target), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    # Binds globally on standard localhost model execution port
    app.run(host='0.0.0.0', port=5000, debug=True)
