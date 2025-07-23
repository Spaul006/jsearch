# Job Scraper Flask App

A minimal Flask web app to search for internship jobs using the jsearch API.

## Features
- Search for jobs by title, location, radius, and additional filters
- Results shown in a table and detailed boxes with job description, skills, and apply link
- Clean, professional, minimal UI
- Handles API errors gracefully

## Setup

1. **Clone the repo and enter the directory:**
   ```sh
   cd "job scraper"
   ```

2. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```

3. **Run the app:**
   ```sh
   python backend/app.py
   ```
   The app will be available at [http://127.0.0.1:5000/](http://127.0.0.1:5000/)

## Notes
- The app uses the [jsearch.p.rapidapi.com](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) endpoint.
- API key is required and must be kept secret.
- For production, set `debug=False` in `app.py`. 