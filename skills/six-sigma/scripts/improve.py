#!/usr/bin/env python3
"""Document process improvements and track impact."""

import argparse
import json
from datetime import datetime
from pathlib import Path

def log_improvement(process, change, hypothesis=None, expected_impact=None):
    """Log a process improvement change."""
    dir_name = process.lower().replace(" ", "-")
    project_dir = Path.home() / ".openclaw/workspace/six-sigma-projects" / dir_name
    
    if not project_dir.exists():
        print(f"Error: Project '{process}' not found.")
        return
    
    improvements_file = project_dir / "improvements.jsonl"
    
    improvement = {
        "timestamp": datetime.utcnow().isoformat(),
        "change": change,
        "status": "implemented"
    }
    
    if hypothesis:
        improvement["hypothesis"] = hypothesis
    
    if expected_impact:
        improvement["expected_impact"] = expected_impact
    
    with open(improvements_file, "a") as f:
        f.write(json.dumps(improvement) + "\n")
    
    # Update project phase
    project_file = project_dir / "project.json"
    with open(project_file, "r") as f:
        project = json.load(f)
    
    project["phase"] = "improve"
    project["last_updated"] = datetime.utcnow().isoformat()
    
    with open(project_file, "w") as f:
        json.dump(project, f, indent=2)
    
    print(f"✓ Improvement logged: {change}")
    print(f"  Project: {process}")
    if hypothesis:
        print(f"  Hypothesis: {hypothesis}")
    if expected_impact:
        print(f"  Expected impact: {expected_impact}")
    
    print(f"\nNext steps:")
    print(f"  1. Continue measuring with measure.py")
    print(f"  2. Compare before/after metrics")
    print(f"  3. Generate control chart with control_chart.py")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Log a process improvement")
    parser.add_argument("--process", required=True, help="Process name")
    parser.add_argument("--change", required=True, help="Description of the change")
    parser.add_argument("--hypothesis", help="Why you think this will help")
    parser.add_argument("--expected-impact", help="Expected improvement (e.g., '+20% accuracy')")
    
    args = parser.parse_args()
    
    log_improvement(args.process, args.change, args.hypothesis, args.expected_impact)
