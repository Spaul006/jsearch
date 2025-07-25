import os
from flask import Flask, render_template, request, flash, redirect, url_for, jsonify
import requests
from dotenv import load_dotenv
import re
from resume_processor import extract_text_from_pdf, parse_resume_with_gemini, rank_jobs_by_match_async, is_gemini_available, extract_filters_with_gemini
from generate_cover_letter import generate_cover_letter_bp

# Load environment variables from .env file in backend directory
load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'public_demo_secret')

# File upload configuration
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Get API key from environment, with fallback to hardcoded demo key
RAPIDAPI_KEY = os.environ.get('RAPIDAPI_KEY', 'demo_key_for_testing')
RAPIDAPI_HOST = 'jsearch.p.rapidapi.com'
API_URL = 'https://jsearch.p.rapidapi.com/search'

def clean_job_description(description):
    """Clean job description by removing duplicates and formatting issues"""
    if not description:
        return ""
    
    # Remove excessive whitespace and normalize line breaks
    description = re.sub(r'\n\s*\n\s*\n+', '\n\n', description)
    description = re.sub(r' +', ' ', description)
    
    # Split into paragraphs
    paragraphs = description.split('\n\n')
    cleaned_paragraphs = []
    seen_paragraphs = set()
    
    for paragraph in paragraphs:
        paragraph = paragraph.strip()
        if not paragraph:
            continue
        
        # Create a normalized version for comparison (lowercase, no extra spaces)
        normalized = ' '.join(paragraph.lower().split())
        
        # Skip very short paragraphs that might be headers or formatting artifacts
        if len(normalized) < 10:
            continue
        
        # Only add if we haven't seen this paragraph before
        if normalized not in seen_paragraphs:
            cleaned_paragraphs.append(paragraph)
            seen_paragraphs.add(normalized)
    
    return '\n\n'.join(cleaned_paragraphs)





def miles_to_km(miles):
    try:
        return int(float(miles) * 1.60934)
    except Exception:
        return 40  # default 25 miles ≈ 40 km

@app.route('/', methods=['GET', 'POST'])
def index():
    results = None
    error = None
    resume_data = None
    
    print(f"🔍 Request method: {request.method}")
    print(f"🔍 Request files: {list(request.files.keys()) if request.files else 'No files'}")
    if request.files:
        for key in request.files:
            file = request.files[key]
            print(f"🔍 File '{key}': {file.filename if file.filename else 'No filename'}")
    
    if request.method == 'POST':
        # Get job search parameters
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
            
            if results:
                # Clean job descriptions
                for job in results:
                    if 'job_description' in job and job['job_description']:
                        job['job_description'] = clean_job_description(job['job_description'])
                
                # Check if resume was uploaded and process it only when searching
                print(f"🔍 Checking for resume file...")
                if 'resume' in request.files:
                    file = request.files['resume']
                    print(f"🔍 Resume file found: {file.filename}")
                    # Only process if there's actually a file uploaded (not just an empty file input)
                    if file and file.filename != '' and file.filename != 'undefined' and allowed_file(file.filename):
                        # Extract text from PDF directly from memory (no file storage)
                        resume_text = extract_text_from_pdf(file)
                        
                        if resume_text:
                            # Parse resume with Gemini
                            if is_gemini_available():
                                print("🔍 Parsing resume with Gemini...")
                                resume_data = parse_resume_with_gemini(resume_text)
                                if resume_data:
                                    print("✅ Resume parsed successfully")
                                    # Rank jobs by match score
                                    print("🔍 Ranking jobs by resume match...")
                                    import asyncio
                                    results = asyncio.run(rank_jobs_by_match_async(resume_data, results))
                                    flash(f'Jobs ranked by match score! Found {len(results)} jobs.', 'success')
                                else:
                                    flash('Failed to analyze resume. Please try again.', 'error')
                                    flash(f'Found {len(results)} jobs. Upload a resume to see match scores!', 'info')
                            else:
                                flash('Gemini API not available for resume analysis.', 'error')
                                flash(f'Found {len(results)} jobs. Upload a resume to see match scores!', 'info')
                        else:
                            flash('Failed to extract text from PDF. Please check the file.', 'error')
                            flash(f'Found {len(results)} jobs. Upload a resume to see match scores!', 'info')
                    else:
                        flash('Please upload a valid PDF file.', 'error')
                        flash(f'Found {len(results)} jobs. Upload a resume to see match scores!', 'info')
                else:
                    flash(f'Found {len(results)} jobs. Upload a resume to see match scores!', 'info')
            else:
                error = 'No jobs found. Try different filters.'

        except Exception as e:
            error = f'Error fetching jobs: {str(e)}'
    
    return render_template('index.html', error=error, results=results, resume_data=resume_data)

@app.route('/api/search_jobs', methods=['POST'])
def api_search_jobs():
    results = None
    error = None
    resume_data = None

    if request.method == 'POST':
        # Get job search parameters
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

            if results:
                # Clean job descriptions
                for job in results:
                    if 'job_description' in job and job['job_description']:
                        job['job_description'] = clean_job_description(job['job_description'])

                # Check if resume was uploaded and process it only when searching
                if 'resume' in request.files:
                    file = request.files['resume']
                    if file and file.filename != '' and file.filename != 'undefined' and allowed_file(file.filename):
                        resume_text = extract_text_from_pdf(file)
                        if resume_text:
                            if is_gemini_available():
                                resume_data = parse_resume_with_gemini(resume_text)
                                if resume_data:
                                    import asyncio
                                    results = asyncio.run(rank_jobs_by_match_async(resume_data, results))
                                else:
                                    error = 'Failed to analyze resume. Please try again.'
                            else:
                                error = 'Gemini API not available for resume analysis.'
                        else:
                            error = 'Failed to extract text from PDF. Please check the file.'
                    else:
                        error = 'Please upload a valid PDF file.'
            else:
                error = 'No jobs found. Try different filters.'

        except Exception as e:
            error = f'Error fetching jobs: {str(e)}'

    return jsonify({
        'results': results or [],
        'resume_data': resume_data,
        'error': error
    })

@app.route('/api/extract_filters', methods=['POST'])
def api_extract_filters():
    data = request.get_json()
    user_text = data.get('user_text', '') if data else ''
    print(f"[API] Received user_text for filter extraction: {user_text}")
    filters = extract_filters_with_gemini(user_text)
    print(f"[API] Returning extracted filters: {filters}")
    return jsonify({'filters': filters}), 200

app.register_blueprint(generate_cover_letter_bp)

if __name__ == '__main__':
    app.run(debug=True) 