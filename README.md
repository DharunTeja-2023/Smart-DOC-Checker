# Smart Doc Checker

Smart Doc Checker is a web application that allows users to upload up to three documents (PDF, DOCX, or TXT) and analyzes them for contradictions in key information such as budget, deadlines, and other project details. The app highlights inconsistencies between documents, helping teams ensure alignment and avoid costly mistakes.

## Features
- Upload up to 3 documents at once (PDF, DOCX, TXT)
- Extracts and analyzes key information (budget, deadline, project name, etc.)
- Detects contradictions and highlights them
- Simple, modern web interface
- All processing is done server-side for privacy

## Folder Structure
```
SmartDocChecker/
│
├── app.py                # Main Flask backend application
├── requirements.txt      # Python dependencies
├── pyproject.toml        # Project metadata and dependencies
├── uv.lock               # Lock file for dependencies (if using uv/replit)
├── replit.md             # Replit-specific instructions (if using Replit)
│
├── static/               # Static files (CSS, JS)
│   ├── css/
│   │   └── style.css     # Main stylesheet
│   └── js/
│       └── main.js       # Main JavaScript file
│
├── templates/            # HTML templates
│   └── index.html        # Main web page
│
├── uploads/              # Temporary storage for uploaded files
│
└── attached_assets/      # Additional assets or documentation
```

## Getting Started

### Prerequisites
- Python 3.11 or newer

### Installation
1. Clone or download this repository.
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

### Running the App
1. Start the Flask server:
   ```
   python app.py
   ```
2. Open your browser and go to [http://localhost:5000](http://localhost:5000)

### Usage
- Click the upload button and select up to 3 files (PDF, DOCX, or TXT).
- The app will analyze the documents and display any contradictions found.

## Project Details
- **Backend:** Flask (Python)
- **Frontend:** HTML, CSS, JavaScript
- **File Parsing:** PyPDF2, python-docx

## Health Check
- Endpoint: `/health`
- Returns a JSON status for monitoring or integration.

## License
This project is for educational/demo purposes. Add your license as needed.
