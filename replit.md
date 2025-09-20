# Overview

Smart Doc Checker is a full-stack web application that allows users to upload up to three documents (PDF, DOCX, or TXT) and analyze them for contradictions and inconsistencies. The application features a modern dashboard interface with drag-and-drop file upload functionality, real-time monitoring of analysis progress, and detailed reporting of found contradictions. Built with Flask as the backend API and vanilla HTML/CSS/JavaScript for the frontend, it provides document text extraction capabilities and keyword-based contradiction analysis.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend uses a traditional server-rendered approach with Flask templates and vanilla JavaScript for interactivity. The main interface is built as a responsive dashboard with a grid-based layout featuring upload cards, monitoring panels, and status indicators. The design emphasizes user experience with drag-and-drop file upload, real-time progress tracking, and dynamic status updates. CSS uses modern styling with rounded corners, professional color palettes, and smooth transitions.

## Backend Architecture
The backend follows a simple Flask application structure with file-based document processing. The main application handles file uploads through a single endpoint with built-in validation for file types (PDF, DOCX, TXT) and size limits (16MB maximum). Document processing is handled synchronously with specialized text extraction functions for each file type using PyPDF2 for PDFs and python-docx for Word documents.

## Document Processing System
The contradiction analysis system uses a keyword-based approach with pre-defined terms to identify potential inconsistencies across documents. The system extracts text from uploaded documents, performs pattern matching against a curated list of analysis keywords (budget, deadline, project name, team size, etc.), and generates detailed reports highlighting found contradictions. Text extraction is handled through format-specific libraries with error handling for corrupted or unreadable files.

## Data Storage
The application uses a simple file-based storage system with an uploads directory for temporary file storage. No persistent database is implemented - all processing happens in memory during the request lifecycle. File management includes secure filename handling and automatic cleanup considerations.

## Session Management
Basic session handling is implemented using Flask's built-in session management with configurable secret keys. The application supports environment-based configuration for deployment flexibility.

# External Dependencies

## Python Libraries
- **Flask**: Web framework for routing, templating, and request handling
- **PyPDF2**: PDF text extraction and processing
- **python-docx**: Microsoft Word document text extraction
- **Werkzeug**: File upload security and utilities (included with Flask)

## Frontend Dependencies
- **Vanilla JavaScript**: Client-side interactivity and file handling
- **CSS Grid/Flexbox**: Layout and responsive design
- **HTML5 File API**: Drag-and-drop file upload functionality

## File System Requirements
- **Local file storage**: Temporary upload directory for document processing
- **File type validation**: Support for PDF, DOCX, and TXT formats
- **File size limits**: 16MB maximum upload size per file

## Environment Configuration
- **SESSION_SECRET**: Environment variable for Flask session security
- **Upload folder**: Configurable directory for file storage