import React, { useState } from 'react';
import './JeopardyBoard.css';

const JeopardyBoard = ({ onGenerateQuiz, questions, loading }) => {
    const [topic, setTopic] = useState('');
    const [numQuestions, setNumQuestions] = useState(5);
    const [useRag, setUseRag] = useState(true);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [revealedQuestions, setRevealedQuestions] = useState(new Set());

    const handleGenerate = () => {
        if (topic.trim()) {
            onGenerateQuiz({ topic, num_questions: numQuestions, use_rag: useRag });
        }
    };

    const handleQuestionClick = (question, index) => {
        if (!revealedQuestions.has(index)) {
            setSelectedQuestion({ ...question, index });
            setRevealedQuestions(new Set([...revealedQuestions, index]));
        }
    };

    const closeModal = () => {
        setSelectedQuestion(null);
    };

    // Group questions by category
    const groupedQuestions = questions.reduce((acc, q, idx) => {
        if (!acc[q.category]) {
            acc[q.category] = [];
        }
        acc[q.category].push({ ...q, index: idx });
        return acc;
    }, {});

    return (
        <div className="jeopardy-container fade-in">
            <div className="jeopardy-header">
                <h2>🎯 Jeopardy Quiz Generator</h2>
            </div>

            <div className="quiz-controls card">
                <div className="control-group">
                    <label htmlFor="topic">Topic / Query</label>
                    <input
                        id="topic"
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., 'Ancient Rome' or 'Machine Learning'"
                        className="input-field"
                    />
                </div>

                <div className="control-row">
                    <div className="control-group">
                        <label htmlFor="numQuestions">Number of Questions</label>
                        <input
                            id="numQuestions"
                            type="number"
                            min="1"
                            max="10"
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                            className="input-field"
                        />
                    </div>

                    <div className="control-group">
                        <label className="toggle-label">
                            <input
                                type="checkbox"
                                checked={useRag}
                                onChange={(e) => setUseRag(e.target.checked)}
                                className="toggle-input"
                            />
                            <span className="toggle-text">
                                Use RAG {useRag ? '✓' : '✗'}
                            </span>
                        </label>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={loading || !topic.trim()}
                    className="btn btn-primary generate-btn"
                >
                    {loading ? (
                        <>
                            <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
                            Generating...
                        </>
                    ) : (
                        <>
                            ⚡ Generate Quiz
                        </>
                    )}
                </button>
            </div>

            {questions.length > 0 && (
                <div className="jeopardy-board">
                    {Object.entries(groupedQuestions).map(([category, categoryQuestions]) => (
                        <div key={category} className="category-column">
                            <div className="category-header">
                                {category}
                            </div>
                            {categoryQuestions.map((question) => (
                                <div
                                    key={question.index}
                                    className={`question-card ${revealedQuestions.has(question.index) ? 'revealed' : ''}`}
                                    onClick={() => handleQuestionClick(question, question.index)}
                                >
                                    <div className="question-front">
                                        ${question.points}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {selectedQuestion && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={closeModal}>×</button>
                        <div className="modal-header">
                            <span className="modal-category">{selectedQuestion.category}</span>
                            <span className="modal-points">${selectedQuestion.points}</span>
                        </div>
                        <div className="modal-clue">
                            {selectedQuestion.clue}
                        </div>
                        <div className="modal-answer">
                            <strong>Answer:</strong> {selectedQuestion.answer}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JeopardyBoard;
