import os
from flask import Flask, render_template, request
import requests
from dotenv import load_dotenv

# Load environment variables from .env file in backend directory
load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'public_demo_secret')

# Get API key from environment, with fallback to hardcoded demo key
RAPIDAPI_KEY = os.environ.get('RAPIDAPI_KEY')
RAPIDAPI_HOST = 'jsearch.p.rapidapi.com'
API_URL = 'https://jsearch.p.rapidapi.com/search'

def miles_to_km(miles):
    try:
        return int(float(miles) * 1.60934)
    except Exception:
        return 40  # default 25 miles ≈ 40 km

@app.route('/', methods=['GET', 'POST'])
def index():
    results = None
    error = None
    if request.method == 'POST':
        job_title = request.form.get('job_title', 'Software Engineer Intern')
        location = request.form.get('location', 'Herndon, VA')
        radius = request.form.get('radius', 25)
        additional = request.form.get('additional', '')
        query = job_title
        if additional:
            query += f' {additional}'
        params = {
            'query': query,
            'location': location,
            'date_posted': 'week',
            'employment_types': 'INTERN',
            'radius': miles_to_km(radius),
        }
        headers = {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST,
        }
        try:
            resp = requests.get(API_URL, headers=headers, params=params, timeout=10)
            resp.raise_for_status()
            data = resp.json()
            results = data.get('data', [])
            if not results:
                error = 'No jobs found. Try different filters.'
        except Exception as e:
            error = f'Error fetching jobs: {str(e)}'
    return render_template('index.html', error=error, results=results)

if __name__ == '__main__':
    app.run(debug=True) 