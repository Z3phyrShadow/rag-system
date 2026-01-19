from typing import List, Dict, Any
from datetime import datetime


class MetricsTracker:
    def __init__(self):
        self.metrics_history: List[Dict[str, Any]] = []
    
    def add_metric(self, metric_data: Dict[str, Any]):
        """Add a new metric entry with timestamp"""
        metric_data["timestamp"] = datetime.now().isoformat()
        self.metrics_history.append(metric_data)
    
    def get_comparison(self) -> Dict[str, Any]:
        """
        Get comparison statistics between RAG and non-RAG methods.
        Returns aggregated metrics for visualization.
        """
        rag_metrics = [m for m in self.metrics_history if m.get("method") == "rag"]
        no_rag_metrics = [m for m in self.metrics_history if m.get("method") == "no_rag"]
        
        def calculate_averages(metrics_list: List[Dict]) -> Dict[str, float]:
            if not metrics_list:
                return {
                    "avg_tokens": 0,
                    "avg_time": 0,
                    "avg_prompt_tokens": 0,
                    "avg_completion_tokens": 0,
                    "count": 0
                }
            
            return {
                "avg_tokens": sum(m.get("total_tokens", 0) for m in metrics_list) / len(metrics_list),
                "avg_time": sum(m.get("time_seconds", 0) for m in metrics_list) / len(metrics_list),
                "avg_prompt_tokens": sum(m.get("prompt_tokens", 0) for m in metrics_list) / len(metrics_list),
                "avg_completion_tokens": sum(m.get("completion_tokens", 0) for m in metrics_list) / len(metrics_list),
                "count": len(metrics_list)
            }
        
        rag_stats = calculate_averages(rag_metrics)
        no_rag_stats = calculate_averages(no_rag_metrics)
        
        return {
            "rag": rag_stats,
            "no_rag": no_rag_stats,
            "comparison": {
                "token_difference": rag_stats["avg_tokens"] - no_rag_stats["avg_tokens"],
                "time_difference": rag_stats["avg_time"] - no_rag_stats["avg_time"],
                "rag_efficiency": (
                    ((no_rag_stats["avg_time"] - rag_stats["avg_time"]) / no_rag_stats["avg_time"] * 100)
                    if no_rag_stats["avg_time"] > 0 else 0
                )
            },
            "total_generations": len(self.metrics_history)
        }
    
    def get_all_metrics(self) -> List[Dict[str, Any]]:
        """Get all metrics history"""
        return self.metrics_history
    
    def clear(self):
        """Clear all metrics"""
        self.metrics_history = []
