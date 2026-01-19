import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './DocumentUpload.css';

const DocumentUpload = ({ onUploadComplete }) => {
    const [uploading, setUploading] = React.useState(false);
    const [uploadStatus, setUploadStatus] = React.useState(null);

    const onDrop = useCallback(async (acceptedFiles) => {
        setUploading(true);
        setUploadStatus(null);

        const formData = new FormData();
        acceptedFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await fetch('http://localhost:8000/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setUploadStatus({
                    success: true,
                    message: data.message,
                    details: `Processed ${data.num_chunks} chunks from ${data.files_processed.length} file(s)`
                });
                onUploadComplete(data);
            } else {
                setUploadStatus({
                    success: false,
                    message: 'Upload failed',
                    details: data.detail || 'Unknown error'
                });
            }
        } catch (error) {
            setUploadStatus({
                success: false,
                message: 'Upload failed',
                details: error.message
            });
        } finally {
            setUploading(false);
        }
    }, [onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'text/plain': ['.txt'],
            'text/markdown': ['.md']
        },
        multiple: true
    });

    return (
        <div className="upload-container fade-in">
            <div className="upload-header">
                <h2>📚 Upload Your Documents</h2>
                <p className="upload-subtitle">
                    Upload PDFs, text files, or markdown documents to create your quiz
                </p>
            </div>

            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''} ${uploading ? 'uploading' : ''}`}
            >
                <input {...getInputProps()} />

                {uploading ? (
                    <div className="upload-loading">
                        <div className="spinner"></div>
                        <p>Processing your documents...</p>
                    </div>
                ) : (
                    <div className="dropzone-content">
                        <div className="upload-icon">📄</div>
                        {isDragActive ? (
                            <p className="dropzone-text">Drop the files here...</p>
                        ) : (
                            <>
                                <p className="dropzone-text">
                                    Drag & drop files here, or click to select
                                </p>
                                <p className="dropzone-hint">
                                    Supports PDF, TXT, and MD files
                                </p>
                            </>
                        )}
                    </div>
                )}
            </div>

            {uploadStatus && (
                <div className={`upload-status ${uploadStatus.success ? 'success' : 'error'} slide-in`}>
                    <div className="status-icon">
                        {uploadStatus.success ? '✓' : '✗'}
                    </div>
                    <div className="status-content">
                        <h3>{uploadStatus.message}</h3>
                        <p>{uploadStatus.details}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentUpload;
