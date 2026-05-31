#!/usr/bin/env python3
"""Analyze process measurements and generate insights."""

import argparse
import json
import statistics
from pathlib import Path
from datetime import datetime
from collections import defaultdict

def analyze_process(process):
    """Generate analysis report from measurements."""
    dir_name = process.lower().replace(" ", "-")
    project_dir = Path.home() / ".openclaw/workspace/six-sigma-projects" / dir_name
    
    if not project_dir.exists():
        print(f"Error: Project '{process}' not found.")
        return
    
    measurements_file = project_dir / "measurements.jsonl"
    
    if not measurements_file.exists() or measurements_file.stat().st_size == 0:
        print(f"Error: No measurements found. Run measure.py first.")
        return
    
    # Load all measurements
    measurements = []
    with open(measurements_file, "r") as f:
        for line in f:
            if line.strip():
                measurements.append(json.loads(line))
    
    # Group by metric
    metrics = defaultdict(list)
    for m in measurements:
        metrics[m["metric"]].append(m["value"])
    
    # Generate analysis
    analysis_lines = [
        f"# Analysis: {process}",
        f"Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
        f"",
        f"## Summary",
        f"Total measurements: {len(measurements)}",
        f"Metrics tracked: {len(metrics)}",
        f""
    ]
    
    for metric, values in metrics.items():
        n = len(values)
        mean = statistics.mean(values)
        
        analysis_lines.append(f"### {metric}")
        analysis_lines.append(f"- **Count**: {n}")
        analysis_lines.append(f"- **Mean**: {mean:.3f}")
        
        if n > 1:
            stdev = statistics.stdev(values)
            analysis_lines.append(f"- **Std Dev**: {stdev:.3f}")
            analysis_lines.append(f"- **Min**: {min(values):.3f}")
            analysis_lines.append(f"- **Max**: {max(values):.3f}")
            analysis_lines.append(f"- **Range**: {max(values) - min(values):.3f}")
            
            if n >= 3:
                median = statistics.median(values)
                analysis_lines.append(f"- **Median**: {median:.3f}")
            
            # Calculate process capability (rough sigma level)
            if stdev > 0:
                # Assuming target is mean, calculate how many std devs to limits
                # This is simplified - real Six Sigma uses spec limits
                sigma_level = 3.0  # Placeholder
                analysis_lines.append(f"- **Variation**: {(stdev/mean)*100:.1f}% of mean")
        
        analysis_lines.append("")
    
    # Identify outliers
    analysis_lines.append("## Potential Root Causes")
    analysis_lines.append("")
    
    for metric, values in metrics.items():
        if len(values) < 3:
            continue
        
        mean = statistics.mean(values)
        stdev = statistics.stdev(values)
        
        outliers = []
        for i, val in enumerate(values):
            z_score = (val - mean) / stdev if stdev > 0 else 0
            if abs(z_score) > 2:  # 2 standard deviations
                outliers.append((i, val, z_score))
        
        if outliers:
            analysis_lines.append(f"### {metric} outliers (>2σ)")
            for idx, val, z_score in outliers:
                analysis_lines.append(f"- Measurement #{idx+1}: {val:.3f} ({z_score:+.1f}σ)")
            analysis_lines.append("")
    
    analysis_lines.append("## Recommendations")
    analysis_lines.append("")
    analysis_lines.append("1. Investigate outliers for root causes")
    analysis_lines.append("2. Document contextual factors (time of day, market conditions, etc.)")
    analysis_lines.append("3. Test hypotheses with controlled changes")
    analysis_lines.append("4. Track improvements with improve.py")
    analysis_lines.append("")
    
    # Write analysis file
    analysis_file = project_dir / "analysis.md"
    with open(analysis_file, "w") as f:
        f.write("\n".join(analysis_lines))
    
    print(f"✓ Analysis complete: {analysis_file}")
    print(f"\n" + "\n".join(analysis_lines[:20]))  # Print first 20 lines
    if len(analysis_lines) > 20:
        print(f"\n... ({len(analysis_lines) - 20} more lines in file)")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Analyze process measurements")
    parser.add_argument("--process", required=True, help="Process name")
    
    args = parser.parse_args()
    
    analyze_process(args.process)
