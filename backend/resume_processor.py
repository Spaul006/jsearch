import os
import json
import google.generativeai as genai
from dotenv import load_dotenv
import PyPDF2
import io

# Load environment variables
load_dotenv()

# Configure Gemini
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-2.0-flash-exp')
else:
    gemini_model = None

def extract_text_from_pdf(pdf_file):
    """Extract text content from uploaded PDF file"""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}")
        return None

def parse_resume_with_gemini(resume_text):
    """Use Gemini to parse and extract key information from resume"""
    if not resume_text or not gemini_model:
        return None
    
    try:
        prompt = f"""
        Analyze this resume and extract key information for job matching.
        
        Resume:
        {resume_text[:4000]}
        
        Please extract and structure the information into these categories:
        1. **Skills** - Technical skills, programming languages, tools, technologies
        2. **Experience** - Work experience, internships, projects
        3. **Education** - Degree, major, GPA, relevant coursework
        4. **Projects** - Notable projects, achievements, contributions
        5. **Interests** - Career interests, preferred roles, industries
        
        Return the result as a JSON object with this structure:
        {{
            "skills": ["skill1", "skill2", "skill3"],
            "experience": ["experience1", "experience2"],
            "education": "degree and major information",
            "projects": ["project1", "project2"],
            "interests": ["interest1", "interest2"]
        }}
        
        Focus on extracting concrete, measurable skills and experiences that can be matched against job requirements.
        """
        
        response = gemini_model.generate_content(prompt)
        
        # Parse the JSON response
        try:
            result = json.loads(response.text)
            return result
        except json.JSONDecodeError:
            # Try to extract JSON from markdown
            try:
                import re
                json_match = re.search(r'```json\s*(.*?)\s*```', response.text, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group(1))
                    return result
            except Exception:
                pass
            return None
            
    except Exception as e:
        print(f"Gemini API error parsing resume: {e}")
        return None

def calculate_job_match_score(resume_data, job_description, job_title):
    """Use Gemini to calculate a match score between resume and job"""
    if not resume_data or not job_description or not gemini_model:
        return 0
    
    try:
        # Convert resume data to readable format
        resume_summary = f"""
        Skills: {', '.join(resume_data.get('skills', []))}
        Experience: {', '.join(resume_data.get('experience', []))}
        Education: {resume_data.get('education', 'N/A')}
        Projects: {', '.join(resume_data.get('projects', []))}
        Interests: {', '.join(resume_data.get('interests', []))}
        """
        
        prompt = f"""
        Analyze the match between this candidate's resume and the job description.
        
        Candidate Profile:
        {resume_summary}
        
        Job Title: {job_title}
        Job Description:
        {job_description[:3000]}
        
        Please provide a comprehensive match analysis and score.
        
        Return the result as a JSON object with this structure:
        {{
            "overall_score": 85,
            "skills_match": 90,
            "experience_match": 75,
            "education_match": 80,
            "detailed_analysis": "Detailed explanation of the match...",
            "strengths": ["strength1", "strength2"],
            "gaps": ["gap1", "gap2"],
            "recommendations": ["recommendation1", "recommendation2"]
        }}
        
        Scoring guidelines:
        - 90-100: Excellent match
        - 80-89: Very good match
        - 70-79: Good match
        - 60-69: Fair match
        - Below 60: Poor match
        
        Be honest and specific about the match quality.
        """
        
        response = gemini_model.generate_content(prompt)
        
        # Parse the JSON response
        try:
            result = json.loads(response.text)
            return result
        except json.JSONDecodeError:
            # Try to extract JSON from markdown
            try:
                import re
                json_match = re.search(r'```json\s*(.*?)\s*```', response.text, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group(1))
                    return result
            except Exception:
                pass
            return None
            
    except Exception as e:
        print(f"Gemini API error calculating match: {e}")
        return None

def rank_jobs_by_match(resume_data, jobs):
    """Rank jobs by their match score with the resume"""
    if not resume_data or not jobs:
        return jobs
    
    print(f"🔍 Ranking {len(jobs)} jobs against resume...")
    
    for i, job in enumerate(jobs):
        if 'job_description' in job and job['job_description']:
            print(f"  Analyzing job {i+1}: {job.get('job_title', job.get('title', 'Unknown'))}")
            
            match_data = calculate_job_match_score(
                resume_data, 
                job['job_description'],
                job.get('job_title', job.get('title', 'Unknown'))
            )
            
            if match_data:
                job['match_score'] = match_data.get('overall_score', 0)
                job['match_analysis'] = match_data
                print(f"    ✅ Match score: {job['match_score']}/100")
            else:
                job['match_score'] = 0
                job['match_analysis'] = None
                print(f"    ❌ Could not calculate match score")
        else:
            job['match_score'] = 0
            job['match_analysis'] = None
    
    # Sort jobs by match score (highest first)
    jobs.sort(key=lambda x: x.get('match_score', 0), reverse=True)
    
    return jobs

def is_gemini_available():
    """Check if Gemini API is available and configured"""
    return gemini_model is not None 