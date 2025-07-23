import os
import json
from flask import Blueprint, request, session, jsonify
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-2.5-pro')
else:
    gemini_model = None

generate_cover_letter_bp = Blueprint('generate_cover_letter', __name__)

@generate_cover_letter_bp.route('/generate_cover_letter', methods=['POST'])
def generate_cover_letter():
    data = request.get_json()
    job = data.get('job', {})
    resume_data = data.get('resume_data')
    if not gemini_model or not resume_data or not job:
        return jsonify({'error': 'Missing data or Gemini not configured.'}), 400

    # Compose prompt for Gemini using parsed resume data
    resume_summary = f"""
    Skills: {', '.join(resume_data.get('skills', []))}
    Experience: {', '.join(resume_data.get('experience', []))}
    Education: {resume_data.get('education', 'N/A')}
    Projects: {', '.join(resume_data.get('projects', []))}
    Interests: {', '.join(resume_data.get('interests', []))}
    """
    prompt = f"""
    Write a professional cover letter for the following job, tailored to the candidate's resume.

    Job Title: {job.get('job_title', 'N/A')}
    Company: {job.get('company', 'N/A')}
    Location: {job.get('location', 'N/A')}
    Job Description: {job.get('job_description', '')}
    Required Skills: {', '.join(job.get('job_required_skills', []))}

    Candidate Profile:
    {resume_summary}

    The cover letter should:
    - Be addressed to the hiring manager (no specific name)
    - Highlight the candidate's relevant skills and experience
    - Be concise (max 350 words)
    - Be in a professional tone
    - Reference the job and company specifically
    - End with a polite closing
    """
    try:
        response = gemini_model.generate_content(prompt)
        cover_letter = response.text.strip()
        return jsonify({'cover_letter': cover_letter})
    except Exception as e:
        return jsonify({'error': f'Gemini error: {str(e)}'}), 500 