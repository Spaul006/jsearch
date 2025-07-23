# AI-Powered Job Matcher

An intelligent Flask web app that matches your resume with job opportunities using Google Gemini 2.0 Flash AI.

## Features
- **Resume Upload & Analysis**: Upload your PDF resume for AI-powered parsing
- **Smart Job Matching**: Get personalized match scores for each job based on your resume
- **Ranked Results**: Jobs are automatically ranked by match score (highest first)
- **Detailed Analysis**: See strengths, gaps, and recommendations for each job match
- **Job Search**: Search for jobs by title, location, radius, and additional filters
- **AI-Powered Processing**: Uses Google Gemini 2.0 Flash for intelligent analysis
- **Clean, Professional UI**: Modern interface with match score indicators
- **Comprehensive Insights**: Detailed breakdown of skills, experience, and education matches

## Setup

1. **Clone the repo and enter the directory:**
   ```sh
   cd "job scraper"
   ```

2. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   - Copy `backend/env.example` to `backend/.env`
   - Add your RapidAPI key for job search
   - Add your Google API key for Gemini AI processing (optional but recommended)

4. **Test the resume matching (optional):**
   ```sh
   python backend/test_resume_matching.py
   ```

5. **Run the app:**
   ```sh
   python backend/app.py
   ```
   The app will be available at [http://127.0.0.1:5000/](http://127.0.0.1:5000/)

## AI Integration

The app now includes Google Gemini 2.0 Flash integration for intelligent job description processing:

- **Smart Section Extraction**: Automatically identifies and extracts key sections like Role Overview, Responsibilities, Requirements, and Benefits
- **Content Cleaning**: Removes redundant and generic content to focus on what makes each job unique
- **Structured Output**: Consistent formatting across different job postings
- **Fallback Support**: If Gemini is unavailable, falls back to regex-based parsing

### Getting a Google API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `GOOGLE_API_KEY=your_key_here`

## Notes
- The app uses the [jsearch.p.rapidapi.com](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) endpoint.
- API keys are required and must be kept secret.
- For production, set `debug=False` in `app.py`.
- Gemini integration is optional - the app works without it but with enhanced functionality when available.
