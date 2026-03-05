#!/usr/bin/env python3
"""Initialize a new Six Sigma DMAIC project."""

import argparse
import json
import os
from datetime import datetime
from pathlib import Path

def init_project(process_name, goal, baseline_metric=None, baseline_value=None):
    """Create a new DMAIC project directory and config."""
    # Sanitize process name for directory
    dir_name = process_name.lower().replace(" ", "-")
    project_dir = Path.home() / ".openclaw/workspace/six-sigma-projects" / dir_name
    project_dir.mkdir(parents=True, exist_ok=True)
    
    # Create project definition
    project = {
        "process_name": process_name,
        "goal": goal,
        "created_at": datetime.utcnow().isoformat(),
        "phase": "define",
        "baseline": {},
        "status": "active"
    }
    
    if baseline_metric and baseline_value is not None:
        project["baseline"] = {
            "metric": baseline_metric,
            "value": float(baseline_value),
            "recorded_at": datetime.utcnow().isoformat()
        }
    
    # Write project file
    project_file = project_dir / "project.json"
    with open(project_file, "w") as f:
        json.dump(project, f, indent=2)
    
    # Create empty measurement file
    measurements_file = project_dir / "measurements.jsonl"
    measurements_file.touch()
    
    # Create placeholder analysis file
    analysis_file = project_dir / "analysis.md"
    with open(analysis_file, "w") as f:
        f.write(f"# Analysis: {process_name}\n\n")
        f.write(f"**Goal:** {goal}\n\n")
        f.write("## Root Cause Analysis\n\n")
        f.write("_Findings will be added during the Analyze phase._\n")
    
    # Create improvements log
    improvements_file = project_dir / "improvements.jsonl"
    improvements_file.touch()
    
    print(f"✓ Project initialized: {project_dir}")
    print(f"  Process: {process_name}")
    print(f"  Goal: {goal}")
    if baseline_metric:
        print(f"  Baseline: {baseline_metric} = {baseline_value}")
    print(f"\nNext steps:")
    print(f"  1. Log measurements: measure.py --process {dir_name} --metric <name> --value <number>")
    print(f"  2. Analyze data: analyze.py --process {dir_name}")
    print(f"  3. Track improvements: improve.py --process {dir_name} --change 'description'")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Initialize a Six Sigma DMAIC project")
    parser.add_argument("--process", required=True, help="Process name (e.g., 'weather betting')")
    parser.add_argument("--goal", required=True, help="Improvement goal (e.g., 'reduce false positives')")
    parser.add_argument("--baseline-metric", help="Initial metric name (e.g., 'accuracy')")
    parser.add_argument("--baseline-value", type=float, help="Initial metric value")
    
    args = parser.parse_args()
    
    init_project(args.process, args.goal, args.baseline_metric, args.baseline_value)
