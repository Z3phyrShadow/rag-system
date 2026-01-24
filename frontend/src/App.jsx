import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import MetricsDisplay from './components/MetricsDisplay';
import './App.css';

// Animated dots component
function AnimatedDots() {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '.';
        return prev + '.';
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return <span className="animated-dots">{dots}</span>;
}

// Question Card Component
function QuestionCard({ question }) {
  return (
    <div className="question-card">
      <div className="question-json">
        <span className="json-brace">{'{'}</span>
        <div className="json-content">
          <div className="json-line">
            <span className="json-key">"category"</span>: <span className="json-string">"{question.category}"</span>,
          </div>
          <div className="json-line">
            <span className="json-key">"points"</span>: <span className="json-number">{question.points}</span>,
          </div>
          <div className="json-line">
            <span className="json-key">"clue"</span>: <span className="json-string">"{question.clue}"</span>,
          </div>
          <div className="json-line">
            <span className="json-key">"answer"</span>: <span className="json-string">"{question.answer}"</span>
          </div>
        </div>
        <span className="json-brace">{'}'}</span>
      </div>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState('upload');
  const [uploadStage, setUploadStage] = useState('idle');
  const [uploadStatus, setUploadStatus] = useState(null);

  // State for Real Data
  const [ragQuestions, setRagQuestions] = useState([]);
  const [noRagQuestions, setNoRagQuestions] = useState([]);
  const [ragMetrics, setRagMetrics] = useState(null);
  const [noRagMetrics, setNoRagMetrics] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    setUploadStage('processing');
    setUploadStatus(null);

    const formData = new FormData();
    acceptedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      // 1. Upload Document
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadStage('generating');
        setUploadStatus({
          success: true,
          message: 'File Processed successfully',
          details: `${data.num_chunks} chunks from ${data.files_processed.length} file(s)`
        });

        // 2. Generate with RAG
        const ragRes = await fetch('http://localhost:8000/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: 'general', num_questions: 3, use_rag: true })
        });
        const ragData = await ragRes.json();

        if (ragRes.ok) {
          setRagQuestions(ragData.questions);
          setRagMetrics(ragData.metrics);
        }

        // 3. Generate without RAG
        const noRagRes = await fetch('http://localhost:8000/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: 'general', num_questions: 3, use_rag: false })
        });
        const noRagData = await noRagRes.json();

        if (noRagRes.ok) {
          setNoRagQuestions(noRagData.questions);
          setNoRagMetrics(noRagData.metrics);
        }

        setUploadStage('complete');
        // Small delay to show completion state before navigating
        setTimeout(() => setCurrentPage('questions'), 1500);

      } else {
        throw new Error(data.detail || 'Upload failed');
      }
    } catch (error) {
      console.error(error);
      setUploadStage('error');
      setUploadStatus({
        success: false,
        message: 'Error',
        details: error.message
      });
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    multiple: true,
    disabled: uploadStage === 'processing' || uploadStage === 'generating'
  });

  const resetUpload = () => {
    setUploadStage('idle');
    setUploadStatus(null);
    setRagQuestions([]);
    setNoRagQuestions([]);
    setRagMetrics(null);
    setNoRagMetrics(null);
    setCurrentPage('upload');
  };

  return (
    <div className="app">
      {/* Hero Bar - Fixed at top */}
      <header className="hero-bar">
        <div className="hero-logo">RAG Jeopardy Quiz System</div>
        <nav className="hero-nav">
          <a
            href="#"
            className={`nav-link ${currentPage === 'upload' || currentPage === 'questions' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); resetUpload(); }}
          >
            Home
          </a>
          <a
            href="#"
            className={`nav-link ${currentPage === 'about' ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); setCurrentPage('about'); }}
          >
            About
          </a>
          {/* DEBUG BUTTON - REMOVE IN PRODUCTION */}
          <button
            className="nav-link"
            style={{ border: '1px solid var(--error)', color: 'var(--error)' }}
            onClick={() => {
              // Generate many mock questions to test scrolling
              const mockQuestionsRag = Array.from({ length: 50 }, (_, i) => ({
                category: `Debug Category ${(i % 5) + 1}`,
                points: (i % 5 + 1) * 200,
                clue: `This is debug clue #${i + 1} generated for checking scroll behavior in the RAG column.`,
                answer: "What is scrolling?"
              }));

              const mockQuestionsNoRag = Array.from({ length: 50 }, (_, i) => ({
                category: `Standard Cat ${(i % 5) + 1}`,
                points: (i % 5 + 1) * 200,
                clue: `This is a standard clue #${i + 1} to ensure both columns scroll independently and correctly.`,
                answer: "What is flexbox?"
              }));

              setRagQuestions(mockQuestionsRag);
              setNoRagQuestions(mockQuestionsNoRag);
              setRagMetrics({
                method: "rag",
                prompt_tokens: 1500,
                completion_tokens: 300,
                total_tokens: 1800,
                time_seconds: 4.5,
                context_length: 5000
              });
              setNoRagMetrics({
                method: "no_rag",
                prompt_tokens: 100,
                completion_tokens: 300,
                total_tokens: 400,
                time_seconds: 1.2,
                context_length: 0
              });
              setCurrentPage('questions');
            }}
          >
            🐞 Debug View
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className={`main-content ${currentPage === 'questions' ? 'full-width no-padding' : ''}`}>
        {currentPage === 'upload' && (
          <div className="upload-wrapper">
            <div className="upload-header">
              <h1>Upload Documents</h1>
              <p className="upload-subtitle">Drop your files to get started</p>
            </div>

            <div
              {...getRootProps()}
              className={`dropzone ${isDragActive ? 'active' : ''} ${uploadStage !== 'idle' ? 'processing' : ''}`}
            >
              <input {...getInputProps()} />

              {uploadStage === 'idle' && (
                <div className="dropzone-content">
                  <div className="upload-icon">📄</div>
                  {isDragActive ? (
                    <p className="dropzone-text">Drop files here...</p>
                  ) : (
                    <>
                      <p className="dropzone-text">Drag & drop files here</p>
                      <p className="dropzone-hint">or click to browse • PDF, TXT, MD</p>
                    </>
                  )}
                </div>
              )}

              {uploadStage === 'processing' && (
                <div className="upload-loading">
                  <div className="spinner"></div>
                  <p className="loading-text">Processing File<AnimatedDots /></p>
                </div>
              )}

              {uploadStage === 'generating' && (
                <div className="upload-loading">
                  <div className="success-check">✓</div>
                  <p className="loading-text success">File Processed successfully</p>
                  <p className="loading-subtext">Generating Questions with RAG vs No-RAG<AnimatedDots /></p>
                </div>
              )}

              {uploadStage === 'complete' && (
                <div className="upload-complete">
                  <div className="success-check large">✓</div>
                  <p className="loading-text success">Comparison Ready!</p>
                  <p className="loading-subtext">Redirecting to results...</p>
                </div>
              )}

              {uploadStage === 'error' && (
                <div className="upload-error">
                  <div className="error-icon">✗</div>
                  <p className="loading-text error">{uploadStatus?.message}</p>
                  <p className="loading-subtext">{uploadStatus?.details}</p>
                  <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); resetUpload(); }}>
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentPage === 'questions' && (
          <div className="questions-page-container">
            {/* Section 1: Comparison View */}
            <section className="snap-section comparison-section">
              <div className="questions-header">
                <h1>Generated Questions</h1>
                <p className="questions-subtitle">Compare generated content quality</p>
              </div>

              <div className="questions-comparison">
                {/* RAG Enabled Column */}
                <div className="questions-column">
                  <h2 className="column-title rag-enabled">RAG Enabled</h2>
                  <div className="questions-scroll">
                    {ragQuestions.map((q, i) => (
                      <QuestionCard key={i} question={q} />
                    ))}
                  </div>
                  <button className="btn btn-primary generate-board-btn">Generate Board</button>
                </div>

                {/* RAG Disabled Column */}
                <div className="questions-column">
                  <h2 className="column-title rag-disabled">RAG Disabled</h2>
                  <div className="questions-scroll">
                    {noRagQuestions.map((q, i) => (
                      <QuestionCard key={i} question={q} />
                    ))}
                  </div>
                  <button className="btn btn-primary generate-board-btn">Generate Board</button>
                </div>
              </div>

              <div className="floating-scroll-hint">
                <div className="hint-content">
                  <span>↓</span> Scroll for Metrics
                </div>
              </div>
            </section>

            {/* Section 2: Metrics Dashboard */}
            {ragMetrics && noRagMetrics && (
              <section className="snap-section metrics-section">
                <div className="metrics-wrapper">
                  <MetricsDisplay ragMetrics={ragMetrics} noRagMetrics={noRagMetrics} />
                </div>
              </section>
            )}
          </div>
        )}

        {currentPage === 'about' && (
          <div className="about-page">
            <h1>About</h1>
            {/* About content remains the same */}
            <p>
              RAG Jeopardy Quiz System is an AI-powered application that generates
              trivia-style quiz questions from your documents using Retrieval-Augmented
              Generation (RAG) technology.
            </p>
            <ul className="features">
              <li><span className="feature-icon">📄</span> Multi-format document support</li>
              <li><span className="feature-icon">🧠</span> Powered by Gemini AI</li>
              <li><span className="feature-icon">⚡</span> Fast vector search with FAISS</li>
              <li><span className="feature-icon">📊</span> Performance metrics comparison</li>
            </ul>
          </div>
        )}
      </main>
    </div >
  );
}

export default App;
