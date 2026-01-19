import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import './MetricsDashboard.css';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const MetricsDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            const response = await fetch('http://localhost:8000/metrics');
            const data = await response.json();
            setMetrics(data);
        } catch (error) {
            console.error('Error fetching metrics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="metrics-loading">
                <div className="spinner"></div>
                <p>Loading metrics...</p>
            </div>
        );
    }

    if (!metrics || metrics.total_generations === 0) {
        return (
            <div className="metrics-empty card">
                <h3>📊 No Metrics Yet</h3>
                <p>Generate some quizzes to see performance comparisons!</p>
            </div>
        );
    }

    const { rag, no_rag, comparison } = metrics;

    // Token Usage Comparison
    const tokenData = {
        labels: ['RAG', 'No RAG'],
        datasets: [
            {
                label: 'Average Total Tokens',
                data: [rag.avg_tokens, no_rag.avg_tokens],
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                ],
                borderColor: [
                    'rgba(99, 102, 241, 1)',
                    'rgba(139, 92, 246, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };

    // Response Time Comparison
    const timeData = {
        labels: ['RAG', 'No RAG'],
        datasets: [
            {
                label: 'Average Response Time (seconds)',
                data: [rag.avg_time, no_rag.avg_time],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                ],
                borderWidth: 2,
            },
        ],
    };

    // Token Breakdown
    const tokenBreakdownData = {
        labels: ['Prompt Tokens', 'Completion Tokens'],
        datasets: [
            {
                label: 'RAG',
                data: [rag.avg_prompt_tokens, rag.avg_completion_tokens],
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
            },
            {
                label: 'No RAG',
                data: [no_rag.avg_prompt_tokens, no_rag.avg_completion_tokens],
                backgroundColor: 'rgba(139, 92, 246, 0.8)',
                borderColor: 'rgba(139, 92, 246, 1)',
                borderWidth: 2,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#f8fafc',
                    font: {
                        size: 12,
                        family: 'Inter',
                    },
                },
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                borderColor: 'rgba(148, 163, 184, 0.2)',
                borderWidth: 1,
            },
        },
        scales: {
            y: {
                ticks: { color: '#cbd5e1' },
                grid: { color: 'rgba(148, 163, 184, 0.1)' },
            },
            x: {
                ticks: { color: '#cbd5e1' },
                grid: { color: 'rgba(148, 163, 184, 0.1)' },
            },
        },
    };

    return (
        <div className="metrics-container fade-in">
            <div className="metrics-header">
                <h2>📊 Performance Metrics</h2>
                <p className="metrics-subtitle">
                    Comparing RAG vs Non-RAG Quiz Generation
                </p>
            </div>

            {/* Summary Cards */}
            <div className="metrics-summary">
                <div className="summary-card card">
                    <div className="summary-icon">🎯</div>
                    <div className="summary-content">
                        <h3>{metrics.total_generations}</h3>
                        <p>Total Generations</p>
                    </div>
                </div>

                <div className="summary-card card">
                    <div className="summary-icon">⚡</div>
                    <div className="summary-content">
                        <h3>{rag.count}</h3>
                        <p>RAG Queries</p>
                    </div>
                </div>

                <div className="summary-card card">
                    <div className="summary-icon">💭</div>
                    <div className="summary-content">
                        <h3>{no_rag.count}</h3>
                        <p>Non-RAG Queries</p>
                    </div>
                </div>

                <div className="summary-card card">
                    <div className="summary-icon">📈</div>
                    <div className="summary-content">
                        <h3>{comparison.token_difference.toFixed(0)}</h3>
                        <p>Token Difference</p>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="charts-grid">
                <div className="chart-card card">
                    <h3>Token Usage Comparison</h3>
                    <div className="chart-wrapper">
                        <Bar data={tokenData} options={chartOptions} />
                    </div>
                </div>

                <div className="chart-card card">
                    <h3>Response Time Comparison</h3>
                    <div className="chart-wrapper">
                        <Bar data={timeData} options={chartOptions} />
                    </div>
                </div>

                <div className="chart-card card">
                    <h3>Token Breakdown</h3>
                    <div className="chart-wrapper">
                        <Bar data={tokenBreakdownData} options={chartOptions} />
                    </div>
                </div>

                <div className="chart-card card">
                    <h3>Method Distribution</h3>
                    <div className="chart-wrapper">
                        <Doughnut
                            data={{
                                labels: ['RAG', 'No RAG'],
                                datasets: [
                                    {
                                        data: [rag.count, no_rag.count],
                                        backgroundColor: [
                                            'rgba(99, 102, 241, 0.8)',
                                            'rgba(139, 92, 246, 0.8)',
                                        ],
                                        borderColor: [
                                            'rgba(99, 102, 241, 1)',
                                            'rgba(139, 92, 246, 1)',
                                        ],
                                        borderWidth: 2,
                                    },
                                ],
                            }}
                            options={{
                                ...chartOptions,
                                scales: undefined,
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Detailed Stats */}
            <div className="detailed-stats">
                <div className="stats-section card">
                    <h3>RAG Statistics</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-label">Avg Tokens:</span>
                            <span className="stat-value">{rag.avg_tokens.toFixed(0)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Avg Time:</span>
                            <span className="stat-value">{rag.avg_time.toFixed(2)}s</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Prompt Tokens:</span>
                            <span className="stat-value">{rag.avg_prompt_tokens.toFixed(0)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Completion Tokens:</span>
                            <span className="stat-value">{rag.avg_completion_tokens.toFixed(0)}</span>
                        </div>
                    </div>
                </div>

                <div className="stats-section card">
                    <h3>Non-RAG Statistics</h3>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-label">Avg Tokens:</span>
                            <span className="stat-value">{no_rag.avg_tokens.toFixed(0)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Avg Time:</span>
                            <span className="stat-value">{no_rag.avg_time.toFixed(2)}s</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Prompt Tokens:</span>
                            <span className="stat-value">{no_rag.avg_prompt_tokens.toFixed(0)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Completion Tokens:</span>
                            <span className="stat-value">{no_rag.avg_completion_tokens.toFixed(0)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={fetchMetrics} className="btn btn-secondary refresh-btn">
                🔄 Refresh Metrics
            </button>
        </div>
    );
};

export default MetricsDashboard;
