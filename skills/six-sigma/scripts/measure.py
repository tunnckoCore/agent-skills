#!/usr/bin/env python3
"""Log process measurements for Six Sigma analysis."""

import argparse
import json
from datetime import datetime
from pathlib import Path

def log_measurement(process, metric, value, context=None):
    """Append a measurement to the JSONL log."""
    dir_name = process.lower().replace(" ", "-")
    project_dir = Path.home() / ".openclaw/workspace/six-sigma-projects" / dir_name
    
    if not project_dir.exists():
        print(f"Error: Project '{process}' not found. Run dmaic_init.py first.")
        return
    
    measurements_file = project_dir / "measurements.jsonl"
    
    measurement = {
        "timestamp": datetime.utcnow().isoformat(),
        "metric": metric,
        "value": float(value)
    }
    
    if context:
        measurement["context"] = context
    
    with open(measurements_file, "a") as f:
        f.write(json.dumps(measurement) + "\n")
    
    print(f"✓ Logged: {metric} = {value}")
    print(f"  Project: {process}")
    print(f"  File: {measurements_file}")
    
    # Calculate running stats
    measurements = []
    with open(measurements_file, "r") as f:
        for line in f:
            if line.strip():
                measurements.append(json.loads(line))
    
    # Filter to this metric
    metric_values = [m["value"] for m in measurements if m["metric"] == metric]
    
    if len(metric_values) > 1:
        avg = sum(metric_values) / len(metric_values)
        print(f"\n  Running avg: {avg:.3f} (n={len(metric_values)})")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Log a process measurement")
    parser.add_argument("--process", required=True, help="Process name (from dmaic_init)")
    parser.add_argument("--metric", required=True, help="Metric name (e.g., 'accuracy', 'cycle_time')")
    parser.add_argument("--value", required=True, type=float, help="Metric value")
    parser.add_argument("--context", help="Optional context (e.g., 'morning run', 'high volatility')")
    
    args = parser.parse_args()
    
    log_measurement(args.process, args.metric, args.value, args.context)
