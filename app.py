from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)

# Enhanced sample data with more universities
universities = pd.DataFrame({
    'name': [
        'University of California, Berkeley',
        'Stanford University',
        'Harvard University',
        'Massachusetts Institute of Technology',
        'California Institute of Technology',
        'Carnegie Mellon University',
        'Georgia Institute of Technology',
        'University of Michigan'
    ],
    'gpa_requirement': [3.5, 3.7, 3.8, 3.9, 3.6, 3.5, 3.4, 3.6],
    'sat_requirement': [1200, 1400, 1500, 1600, 1300, 1350, 1250, 1300],
    'program': [
        'Computer Science',
        'Computer Science',
        'Computer Science',
        'Electrical Engineering',
        'Computer Science',
        'Software Engineering',
        'Computer Engineering',
        'Data Science'
    ]
})

@app.route('/')
def home():
    return "University Recommender API is running!"

@app.route('/recommend', methods=['POST', 'OPTIONS'])
def recommend_universities():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ok'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        response.headers.add('Access-Control-Allow-Methods', 'POST')
        return response

    try:
        data = request.get_json()
        print("Received data:", data)  # Debug print
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if 'grades' not in data or 'education_background' not in data:
            return jsonify({'error': 'Missing required fields'}), 400
            
        grades = data['grades']
        education_background = data['education_background']

        # Validate grades data
        if 'gpa' not in grades or 'sat' not in grades:
            return jsonify({'error': 'Missing GPA or SAT scores'}), 400

        # Simple recommendation algorithm
        recommended_universities = universities[
            (universities['gpa_requirement'] <= float(grades['gpa'])) & 
            (universities['sat_requirement'] <= float(grades['sat']))
        ]

        # Create list of recommendations with both university and program
        recommendations = []
        for _, row in recommended_universities.iterrows():
            recommendations.append({
                'university': row['name'],
                'program': row['program'],
                'gpa_requirement': row['gpa_requirement'],
                'sat_requirement': row['sat_requirement']
            })

        print("Recommendations:", recommendations)  # Debug print

        response = jsonify({
            'status': 'success',
            'recommendations': recommendations
        })
        return response

    except Exception as e:
        print("Error:", str(e))  # Debug print
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)