import os
import json
from datetime import datetime
from flask import Flask, request, render_template, jsonify, send_from_directory
from werkzeug.utils import secure_filename
import PyPDF2
from docx import Document
import re
from collections import defaultdict

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SESSION_SECRET', 'dev-secret-key')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'

# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}

# Pre-defined keywords to look for contradictions
ANALYSIS_KEYWORDS = [
    'budget', 'deadline', 'project name', 'team size', 'duration', 'cost',
    'completion date', 'start date', 'end date', 'total amount', 'price',
    'quantity', 'number', 'amount', 'percentage', 'percent', 'target',
    'goal', 'objective', 'requirement', 'specification', 'version'
]

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    """Extract text from PDF file."""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        return f"Error reading PDF: {str(e)}"

def extract_text_from_docx(file_path):
    """Extract text from DOCX file."""
    try:
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        return f"Error reading DOCX: {str(e)}"

def extract_text_from_txt(file_path):
    """Extract text from TXT file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except UnicodeDecodeError:
        try:
            with open(file_path, 'r', encoding='latin-1') as file:
                return file.read()
        except Exception as e:
            return f"Error reading TXT: {str(e)}"
    except Exception as e:
        return f"Error reading TXT: {str(e)}"

def extract_keywords_from_text(text, document_name):
    """Extract keyword-value pairs from text."""
    keywords_found = {}
    text_lower = text.lower()
    
    for keyword in ANALYSIS_KEYWORDS:
        # Look for patterns like "budget: $100", "budget is $100", "budget = $100"
        patterns = [
            rf'{keyword}[:\s=]+([^\n,.;]+)',
            rf'{keyword}\s+is\s+([^\n,.;]+)',
            rf'{keyword}\s+of\s+([^\n,.;]+)',
            rf'the\s+{keyword}\s+is\s+([^\n,.;]+)',
            rf'a\s+{keyword}\s+of\s+([^\n,.;]+)'
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text_lower, re.IGNORECASE)
            for match in matches:
                value = match.group(1).strip()
                # Clean up the value - remove extra whitespace and common endings
                value = re.sub(r'[.;,]+$', '', value).strip()
                if value and len(value) > 1:
                    keywords_found[keyword] = value
                    break  # Take first match for each keyword
    
    return keywords_found

def analyze_contradictions(documents_data):
    """Analyze documents for contradictions."""
    contradictions = []
    keyword_values = defaultdict(dict)
    
    # Collect all keyword-value pairs from all documents
    for doc_name, keywords in documents_data.items():
        for keyword, value in keywords.items():
            keyword_values[keyword][doc_name] = value
    
    # Check for contradictions
    for keyword, doc_values in keyword_values.items():
        if len(doc_values) > 1:
            values = list(doc_values.values())
            unique_values = set(values)
            
            if len(unique_values) > 1:
                contradictions.append({
                    'keyword': keyword,
                    'documents': doc_values,
                    'values': list(unique_values),
                    'severity': 'high' if keyword in ['budget', 'deadline', 'cost', 'price'] else 'medium'
                })
    
    return contradictions

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_files():
    try:
        # Check if files were uploaded
        if 'files[]' not in request.files:
            return jsonify({'error': 'No files uploaded'}), 400
        
        files = request.files.getlist('files[]')
        
        if len(files) == 0:
            return jsonify({'error': 'No files selected'}), 400
        
        if len(files) > 3:
            return jsonify({'error': 'Maximum 3 files allowed'}), 400
        
        uploaded_files = []
        documents_data = {}
        
        # Process each uploaded file
        for file in files:
            if file and file.filename and file.filename != '':
                if not allowed_file(file.filename):
                    return jsonify({'error': f'Invalid file type: {file.filename}. Only PDF, DOCX, and TXT files are allowed.'}), 400
                
                filename = secure_filename(file.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
                unique_filename = timestamp + filename
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                
                file.save(file_path)
                uploaded_files.append({
                    'name': filename,
                    'path': file_path,
                    'size': os.path.getsize(file_path)
                })
        
        # Extract text from uploaded files
        for file_info in uploaded_files:
            file_path = file_info['path']
            filename = file_info['name']
            file_ext = filename.rsplit('.', 1)[1].lower()
            
            text = ""
            if file_ext == 'pdf':
                text = extract_text_from_pdf(file_path)
            elif file_ext == 'docx':
                text = extract_text_from_docx(file_path)
            elif file_ext == 'txt':
                text = extract_text_from_txt(file_path)
            
            # Extract keywords from text
            keywords = extract_keywords_from_text(text, filename)
            documents_data[filename] = keywords
        
        # Analyze for contradictions
        contradictions = analyze_contradictions(documents_data)
        
        # Clean up uploaded files after analysis
        for file_info in uploaded_files:
            try:
                os.remove(file_info['path'])
            except:
                pass
        
        # Prepare response
        response_data = {
            'status': 'success',
            'files_processed': len(uploaded_files),
            'documents': documents_data,
            'contradictions': contradictions,
            'analysis_time': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'service': 'Smart Doc Checker'})

if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    app.run(host='0.0.0.0', port=5000, debug=True)