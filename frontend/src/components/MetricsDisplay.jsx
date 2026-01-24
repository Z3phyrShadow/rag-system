import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './MetricsDashboard.css'; // We'll create this or reuse styles

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const MetricsDisplay = ({ ragMetrics, noRagMetrics }) => {
    // --- Data Preparation ---

    // 1. Token Usage Comparison
    const tokenData = useMemo(() => ({
        labels: ['Prompt Tokens', 'Completion Tokens'],
        datasets: [
            {
                label: 'RAG Enabled',
                data: [ragMetrics.prompt_tokens, ragMetrics.completion_tokens],
                backgroundColor: 'rgba(16, 185, 129, 0.7)', // Success Green
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1,
            },
            {
                label: 'No RAG',
                data: [noRagMetrics.prompt_tokens, noRagMetrics.completion_tokens],
                backgroundColor: 'rgba(107, 114, 128, 0.7)', // Gray
                borderColor: 'rgba(107, 114, 128, 1)',
                borderWidth: 1,
            },
        ],
    }), [ragMetrics, noRagMetrics]);

    // 2. Latency Comparison
    const latencyData = useMemo(() => ({
        labels: ['Generation Time (seconds)'],
        datasets: [
            {
                label: 'RAG Enabled',
                data: [ragMetrics.time_seconds],
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1,
            },
            {
                label: 'No RAG',
                data: [noRagMetrics.time_seconds],
                backgroundColor: 'rgba(107, 114, 128, 0.7)',
                borderColor: 'rgba(107, 114, 128, 1)',
                borderWidth: 1,
            },
        ],
    }), [ragMetrics, noRagMetrics]);

    // 3. Operational Metrics Calculations
    // Gemini Pro pricing approximation (Input: $0.125/1M tokens, Output: $0.375/1M tokens) - Example rates
    const calculateCost = (metrics) => {
        const inputCost = (metrics.prompt_tokens / 1_000_000) * 0.125;
        const outputCost = (metrics.completion_tokens / 1_000_000) * 0.375;
        return (inputCost + outputCost) * 1000; // Cost per 1k runs
    };

    const ragCost = calculateCost(ragMetrics);
    const noRagCost = calculateCost(noRagMetrics);

    const ragThroughput = (ragMetrics.total_tokens / ragMetrics.time_seconds).toFixed(1);
    const noRagThroughput = (noRagMetrics.total_tokens / noRagMetrics.time_seconds).toFixed(1);

    // --- Chart Options ---
    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top', labels: { color: '#9ca3af' } },
            title: { display: false },
        },
        scales: {
            y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(255, 255, 255, 0.1)' } },
            x: { ticks: { color: '#9ca3af' }, grid: { display: false } },
        },
    };

    return (
        <div className="metrics-dashboard fade-in">
            <div className="metrics-header">
                <h2>📊 Performance Analytics</h2>
                <p className="metrics-subtitle">Real-world impact analysis of RAG integration</p>
            </div>

            {/* Summary Cards: Operational Metrics */}
            <div className="metrics-grid summary-section">
                <div className="metric-card highlight">
                    <div className="metric-icon">💰</div>
                    <div className="metric-content">
                        <h3>Est. Cost (1k Runs)</h3>
                        <div className="metric-comparison">
                            <div className="metric-value rag">
                                ${ragCost.toFixed(4)} <span>RAG</span>
                            </div>
                            <div className="metric-value no-rag">
                                ${noRagCost.toFixed(4)} <span>Std</span>
                            </div>
                        </div>
                        <p className="metric-delta">
                            +{((ragCost - noRagCost) / noRagCost * 100).toFixed(0)}% Cost Increase
                        </p>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon">⚡</div>
                    <div className="metric-content">
                        <h3>System Throughput</h3>
                        <div className="metric-comparison">
                            <div className="metric-value">
                                {ragThroughput} <span>tok/s</span>
                            </div>
                            <div className="metric-value dim">
                                vs {noRagThroughput}
                            </div>
                        </div>
                        <p className="metric-label">Token Generation Speed</p>
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-icon">📚</div>
                    <div className="metric-content">
                        <h3>Context Density</h3>
                        <div className="metric-value big">
                            {ragMetrics.context_length.toLocaleString()}
                            <span className="unit">chars</span>
                        </div>
                        <p className="metric-label">Retrieved Content Processed</p>
                    </div>
                </div>
            </div>

            {/* Detailed Charts */}
            <div className="charts-container">
                <div className="chart-card">
                    <h3>Token Usage Breakdown</h3>
                    <div className="chart-wrapper">
                        <Bar data={tokenData} options={barOptions} />
                    </div>
                    <p className="chart-insight">
                        RAG drastically increases prompt tokens due to injected context.
                    </p>
                </div>

                <div className="chart-card">
                    <h3>Latency Impact</h3>
                    <div className="chart-wrapper">
                        <Bar data={latencyData} options={barOptions} />
                    </div>
                    <p className="chart-insight">
                        Retrieval and processing context adds to generation latency.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MetricsDisplay;
