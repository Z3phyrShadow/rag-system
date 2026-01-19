import React, { useState } from 'react';
import DocumentUpload from './components/DocumentUpload';
import JeopardyBoard from './components/JeopardyBoard';
import MetricsDashboard from './components/MetricsDashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('upload');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleUploadComplete = (data) => {
    setUploadComplete(true);
  };

  const handleGenerateQuiz = async (params) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (response.ok) {
        setQuestions(data.questions);
      } else {
        console.error('Error generating quiz:', data.detail);
        alert('Error generating quiz: ' + data.detail);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error generating quiz. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎓 RAG Jeopardy Quiz System</h1>
        <p className="app-tagline">
          AI-Powered Quiz Generation with Performance Analytics
        </p>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${currentView === 'upload' ? 'active' : ''}`}
          onClick={() => setCurrentView('upload')}
        >
          📚 Upload
        </button>
        <button
          className={`nav-btn ${currentView === 'quiz' ? 'active' : ''}`}
          onClick={() => setCurrentView('quiz')}
        >
          🎯 Quiz
        </button>
        <button
          className={`nav-btn ${currentView === 'metrics' ? 'active' : ''}`}
          onClick={() => setCurrentView('metrics')}
        >
          📊 Metrics
        </button>
      </nav>

      <main className="app-main container">
        {currentView === 'upload' && (
          <div>
            <DocumentUpload onUploadComplete={handleUploadComplete} />
            {uploadComplete && (
              <div className="upload-success-action">
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentView('quiz')}
                >
                  Continue to Quiz Generation →
                </button>
              </div>
            )}
          </div>
        )}

        {currentView === 'quiz' && (
          <JeopardyBoard
            onGenerateQuiz={handleGenerateQuiz}
            questions={questions}
            loading={loading}
          />
        )}

        {currentView === 'metrics' && <MetricsDashboard />}
      </main>

      <footer className="app-footer">
        <p>
          Built with FastAPI, React, Gemini AI, and FAISS Vector Store
        </p>
      </footer>
    </div>
  );
}

export default App;
