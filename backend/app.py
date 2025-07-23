import os
from flask import Flask, render_template, request, flash, redirect, url_for
import requests
from dotenv import load_dotenv
import re
from werkzeug.utils import secure_filename
from resume_processor import extract_text_from_pdf, parse_resume_with_gemini, rank_jobs_by_match, is_gemini_available

# Load environment variables from .env file in backend directory
load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'public_demo_secret')

# File upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create uploads directory if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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
    uploaded_filename = None
    
    if request.method == 'POST':
        # Check if resume was uploaded
        if 'resume' in request.files:
            file = request.files['resume']
            if file and file.filename != '' and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(filepath)
                uploaded_filename = filename
                
                # Extract text from PDF
                with open(filepath, 'rb') as pdf_file:
                    resume_text = extract_text_from_pdf(pdf_file)
                
                if resume_text:
                    # Parse resume with Gemini
                    if is_gemini_available():
                        print("🔍 Parsing resume with Gemini...")
                        resume_data = parse_resume_with_gemini(resume_text)
                        if resume_data:
                            print("✅ Resume parsed successfully")
                            flash('Resume uploaded and analyzed successfully!', 'success')
                        else:
                            flash('Failed to analyze resume. Please try again.', 'error')
                    else:
                        flash('Gemini API not available for resume analysis.', 'error')
                else:
                    flash('Failed to extract text from PDF. Please check the file.', 'error')
            else:
                flash('Please upload a valid PDF file.', 'error')
        
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
                
                # If resume was uploaded, rank jobs by match score
                if resume_data:
                    print("🔍 Ranking jobs by resume match...")
                    results = rank_jobs_by_match(resume_data, results)
                    flash(f'Jobs ranked by match score! Found {len(results)} jobs.', 'success')
                else:
                    flash(f'Found {len(results)} jobs. Upload a resume to see match scores!', 'info')
            else:
                error = 'No jobs found. Try different filters.'

        except Exception as e:
            error = f'Error fetching jobs: {str(e)}'
    
    return render_template('index.html', error=error, results=results, resume_data=resume_data, uploaded_filename=uploaded_filename)

if __name__ == '__main__':
    app.run(debug=True) 