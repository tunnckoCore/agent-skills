#!/usr/bin/env python3
"""Generate control charts for process monitoring."""

import argparse
import json
import statistics
from pathlib import Path
from collections import defaultdict

def generate_control_chart(process, metric):
    """Generate ASCII control chart (PNG requires matplotlib)."""
    dir_name = process.lower().replace(" ", "-")
    project_dir = Path.home() / ".openclaw/workspace/six-sigma-projects" / dir_name
    
    if not project_dir.exists():
        print(f"Error: Project '{process}' not found.")
        return
    
    measurements_file = project_dir / "measurements.jsonl"
    
    # Load measurements
    measurements = []
    with open(measurements_file, "r") as f:
        for line in f:
            if line.strip():
                m = json.loads(line)
                if m["metric"] == metric:
                    measurements.append(m["value"])
    
    if len(measurements) < 3:
        print(f"Error: Need at least 3 measurements for {metric}")
        return
    
    # Calculate control limits
    mean = statistics.mean(measurements)
    stdev = statistics.stdev(measurements)
    
    ucl = mean + (3 * stdev)  # Upper Control Limit
    lcl = mean - (3 * stdev)  # Lower Control Limit
    
    # ASCII control chart
    print(f"\n{'='*60}")
    print(f"Control Chart: {process} - {metric}")
    print(f"{'='*60}")
    print(f"Mean (CL):  {mean:.3f}")
    print(f"UCL (+3σ):  {ucl:.3f}")
    print(f"LCL (-3σ):  {lcl:.3f}")
    print(f"Std Dev:    {stdev:.3f}")
    print(f"Sample size: {len(measurements)}")
    print(f"{'='*60}\n")
    
    # Simple ASCII plot
    print(f"{'Point':<8} {'Value':<10} {'Status':<15} {'Plot'}")
    print("-" * 60)
    
    for i, val in enumerate(measurements, 1):
        # Determine status
        if val > ucl:
            status = "OUT (high)"
            marker = "!"
        elif val < lcl:
            status = "OUT (low)"
            marker = "!"
        else:
            status = "IN CONTROL"
            marker = "·"
        
        # Simple visual
        # Map value to 50-char width
        chart_min = min(lcl, min(measurements))
        chart_max = max(ucl, max(measurements))
        chart_range = chart_max - chart_min
        
        if chart_range > 0:
            pos = int(((val - chart_min) / chart_range) * 40)
            plot = " " * pos + marker
        else:
            plot = marker
        
        print(f"{i:<8} {val:<10.3f} {status:<15} {plot}")
    
    print("-" * 60)
    
    # Detect out-of-control signals
    out_of_control = sum(1 for v in measurements if v > ucl or v < lcl)
    
    if out_of_control > 0:
        print(f"\n⚠️  Warning: {out_of_control} out-of-control points detected")
        print("   Investigate special causes (unusual events, changes)")
    else:
        print(f"\n✓ Process is in statistical control")
    
    # Trend detection (simple)
    if len(measurements) >= 7:
        last_7 = measurements[-7:]
        if all(last_7[i] < last_7[i+1] for i in range(6)):
            print("   📈 Upward trend detected (7+ points)")
        elif all(last_7[i] > last_7[i+1] for i in range(6)):
            print("   📉 Downward trend detected (7+ points)")
    
    print("")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate control chart")
    parser.add_argument("--process", required=True, help="Process name")
    parser.add_argument("--metric", required=True, help="Metric to chart")
    
    args = parser.parse_args()
    
    generate_control_chart(args.process, args.metric)
