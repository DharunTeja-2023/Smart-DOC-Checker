document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const filesList = document.getElementById('filesList');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const filesCount = document.getElementById('filesCount');
    const analysisTime = document.getElementById('analysisTime');
    const overallStatus = document.getElementById('overallStatus');
    const processingStatus = document.getElementById('processingStatus');
    const aiStatus = document.getElementById('aiStatus');
    const reportStatus = document.getElementById('reportStatus');
    const resultsCard = document.getElementById('resultsCard');
    const resultsContent = document.getElementById('resultsContent');

    let selectedFiles = [];
    let startTime = null;

    // Drag and drop functionality
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    uploadArea.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', handleFileSelect);

    // Analyze button click
    analyzeBtn.addEventListener('click', handleAnalyze);

    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    }

    function handleDragLeave(e) {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
    }

    function handleDrop(e) {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    }

    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        processFiles(files);
    }

    function processFiles(files) {
        if (files.length > 3) {
            alert('Maximum 3 files allowed');
            return;
        }

        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        const allowedExtensions = ['.pdf', '.docx', '.txt'];

        selectedFiles = [];
        
        for (const file of files) {
            const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
            if (allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension)) {
                selectedFiles.push(file);
            } else {
                alert(`Invalid file type: ${file.name}. Only PDF, DOCX, and TXT files are allowed.`);
                return;
            }
        }

        displayFiles();
        updateFilesCount();
    }

    function displayFiles() {
        filesList.innerHTML = '';
        
        selectedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span class="file-name">${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
            `;
            filesList.appendChild(fileItem);
        });

        analyzeBtn.disabled = selectedFiles.length === 0;
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function updateFilesCount() {
        filesCount.textContent = selectedFiles.length;
    }

    function updateStatus(status) {
        overallStatus.textContent = status;
        overallStatus.className = `metric-value status-${status.toLowerCase().replace(' ', '-')}`;
    }

    function updateStageStatus(stage, status) {
        const element = document.getElementById(`${stage}Status`);
        element.textContent = status;
        element.className = `status-badge ${status.toLowerCase()}`;
    }

    function updateAnalysisTime() {
        if (startTime) {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            analysisTime.textContent = `${elapsed}s`;
        }
    }

    async function handleAnalyze() {
        if (selectedFiles.length === 0) return;

        // Reset status
        startTime = Date.now();
        updateStatus('Processing');
        updateStageStatus('processing', 'processing');
        updateStageStatus('ai', 'pending');
        updateStageStatus('report', 'pending');
        
        // Start timer
        const timer = setInterval(updateAnalysisTime, 1000);

        // Prepare form data
        const formData = new FormData();
        selectedFiles.forEach(file => {
            formData.append('files[]', file);
        });

        try {
            // Simulate processing stages
            setTimeout(() => {
                updateStageStatus('processing', 'ready');
                updateStageStatus('ai', 'processing');
            }, 1000);

            setTimeout(() => {
                updateStageStatus('ai', 'ready');
                updateStageStatus('report', 'processing');
            }, 2000);

            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            clearInterval(timer);
            updateAnalysisTime();

            if (response.ok) {
                updateStatus('Complete');
                updateStageStatus('report', 'ready');
                displayResults(result);
            } else {
                throw new Error(result.error || 'Analysis failed');
            }

        } catch (error) {
            clearInterval(timer);
            updateStatus('Error');
            updateStageStatus('processing', 'error');
            updateStageStatus('ai', 'error');
            updateStageStatus('report', 'error');
            
            alert(`Analysis failed: ${error.message}`);
        }
    }

    function displayResults(result) {
        const { contradictions, documents, files_processed, analysis_time } = result;

        let html = `
            <div class="summary">
                <h3>Analysis Summary</h3>
                <p><strong>Files Processed:</strong> ${files_processed}</p>
                <p><strong>Analysis Time:</strong> ${analysis_time}</p>
                <p><strong>Contradictions Found:</strong> ${contradictions.length}</p>
            </div>
        `;

        if (contradictions.length > 0) {
            html += '<h3>Contradictions Detected</h3>';
            
            contradictions.forEach((contradiction, index) => {
                html += `
                    <div class="contradiction-item">
                        <div class="contradiction-header">
                            Contradiction #${index + 1}: ${contradiction.keyword.toUpperCase()}
                            <span style="float: right; font-size: 0.8rem;">${contradiction.severity.toUpperCase()} PRIORITY</span>
                        </div>
                        <div class="contradiction-details">
                            <p><strong>Keyword:</strong> ${contradiction.keyword}</p>
                            <p><strong>Different Values Found:</strong></p>
                            <div class="contradiction-values">
                `;
                
                Object.entries(contradiction.documents).forEach(([doc, value]) => {
                    html += `
                        <div class="value-item">
                            <span><strong>${doc}:</strong></span>
                            <span>"${value}"</span>
                        </div>
                    `;
                });
                
                html += `
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            html += `
                <div class="no-contradictions">
                    <div class="icon">✅</div>
                    <h3>No Contradictions Found</h3>
                    <p>Your documents appear to be consistent with each other.</p>
                </div>
            `;
        }

        // Show document keywords for reference
        html += '<h3>Extracted Keywords</h3>';
        Object.entries(documents).forEach(([doc, keywords]) => {
            html += `
                <div style="margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
                    <h4>${doc}</h4>
                    <p><strong>Keywords found:</strong> ${Object.keys(keywords).length > 0 ? Object.keys(keywords).join(', ') : 'None'}</p>
                </div>
            `;
        });

        resultsContent.innerHTML = html;
        resultsCard.style.display = 'block';
    }

    // Global function to hide results
    window.hideResults = function() {
        resultsCard.style.display = 'none';
    }
});