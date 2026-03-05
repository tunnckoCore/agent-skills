# Control Charts for Process Monitoring

## Purpose

Control charts distinguish between:
- **Common Cause Variation**: Normal process fluctuation
- **Special Cause Variation**: Unusual events requiring investigation

## Basic Control Chart Components

```
UCL (Upper Control Limit) -------- +3σ from mean
                          ·    ·
                       ·     ·    ·
CL (Center Line - Mean) -------- Process average
                       ·     ·    ·
                          ·    ·
LCL (Lower Control Limit) -------- -3σ from mean
```

**UCL/LCL**: Calculated as Mean ± 3 Standard Deviations
**CL**: Process mean (average)

## Interpreting Control Charts

### In Control Signals
✓ Points randomly distributed around mean  
✓ Most points near center line  
✓ No points outside control limits  
✓ No obvious patterns or trends

**Action**: Process is stable, continue monitoring

### Out of Control Signals

#### 1. Point Outside Control Limits
```
UCL --------
         ·  !  ← Special cause!
    · · ·
CL  --------
    · · ·
LCL --------
```

**Meaning**: Unusual event occurred  
**Action**: Investigate what was different

**AI Agent Examples**:
- Trading accuracy spikes to 95% → What worked? Replicate it
- Accuracy drops to 20% → What failed? Prevent it

#### 2. Run of 7+ Points on One Side
```
UCL --------
    · · · · · · ·  ← All above mean
CL  -------- - - -
       
LCL --------
```

**Meaning**: Process has shifted  
**Action**: Identify what changed

**AI Agent Examples**:
- 7 consecutive profitable trades → New strategy working?
- 7 consecutive low-quality posts → Quality gate broken?

#### 3. Trend (7+ Points in Same Direction)
```
UCL --------
              · ·  ← Upward trend
           · ·
        · ·
CL  · · --------
   
LCL --------
```

**Meaning**: Process is drifting  
**Action**: Find root cause of drift

**AI Agent Examples**:
- Response quality declining → Fatigue? Data staleness?
- Cycle time increasing → System slowdown? API delays?

#### 4. Cyclic Pattern
```
UCL --------
    ·     ·     ·
      · ·   · ·    ← Repeating pattern
CL  --------
      · ·   · ·
    ·     ·     ·
LCL --------
```

**Meaning**: Systematic variation (time-based)  
**Action**: Identify the cycle period

**AI Agent Examples**:
- Trading accuracy varies by time of day
- Social engagement varies by day of week

## Control Chart Types for AI Agents

### Individual-X Chart (Most Common)
**Use**: Tracking individual measurements (accuracy, cycle time, etc.)

**Example**: Trading win rate per trade
```
Trade | Win Rate | UCL=0.85 | CL=0.65 | LCL=0.45
------|----------|----------|---------|----------
1     | 0.70     | ·        |         |
2     | 0.60     |          | ·       |
3     | 0.75     | ·        |         |
4     | 0.40     |          |         | !
```

### p-Chart (Proportion Defective)
**Use**: Tracking defect rates, success rates

**Example**: Error rate per 100 operations
```
Sample | Errors | Rate | Plot
-------|--------|------|-----
1      | 5/100  | 5%   | ·
2      | 3/100  | 3%   | ·
3      | 12/100 | 12%  | !  ← Out of control
```

### u-Chart (Defects per Unit)
**Use**: Tracking defects when opportunities vary

**Example**: Bugs per 1000 lines of code written
```
Session | Lines | Bugs | Rate | Plot
--------|-------|------|------|-----
1       | 500   | 2    | 4.0  | ·
2       | 1200  | 3    | 2.5  | ·
3       | 800   | 8    | 10.0 | !
```

## Calculating Control Limits

### For Individual Measurements

1. Collect baseline data (20-30 points minimum)
2. Calculate mean: `μ = Σx / n`
3. Calculate standard deviation: `σ = sqrt(Σ(x-μ)² / (n-1))`
4. Set limits:
   - UCL = μ + 3σ
   - CL = μ
   - LCL = μ - 3σ

**Example**:
```python
measurements = [0.65, 0.70, 0.60, 0.75, 0.68, ...]  # 25 points
mean = 0.67
std_dev = 0.08
UCL = 0.67 + (3 * 0.08) = 0.91
LCL = 0.67 - (3 * 0.08) = 0.43
```

### For Proportions (p-Chart)

1. Calculate overall proportion: `p̄ = Total defects / Total units`
2. Calculate standard deviation: `σ = sqrt(p̄(1-p̄) / n)`
3. Set limits:
   - UCL = p̄ + 3σ
   - LCL = p̄ - 3σ (minimum 0)

## Using Control Charts in Practice

### Step 1: Establish Baseline
- Collect 20-30 measurements during stable period
- Calculate initial control limits
- Document baseline in project.json

### Step 2: Monitor Process
- Plot new measurements
- Check for out-of-control signals
- Update control limits periodically (monthly)

### Step 3: Investigate Special Causes
When a point is out of control:
1. Document what was different that time
2. If beneficial (above UCL on quality metric):
   - Try to replicate the conditions
   - Make it standard practice
3. If harmful (below LCL on quality metric):
   - Prevent recurrence
   - Add safeguards

### Step 4: Recalculate After Improvements
After implementing a process change:
1. Mark the change point on chart
2. Collect new baseline (20-30 points post-change)
3. Recalculate control limits
4. Compare before/after means

## Control Chart Best Practices

### DO:
✓ Use at least 20-30 points for initial limits  
✓ Update limits after confirmed process changes  
✓ Investigate all out-of-control signals  
✓ Document findings in analysis.md  
✓ Review charts weekly or monthly  

### DON'T:
✗ React to every point (common cause variation is normal)  
✗ Adjust limits after single outlier  
✗ Use control charts with <10 points  
✗ Ignore trends or patterns  
✗ Calculate limits from unstable data  

## AI Agent Control Chart Workflow

```bash
# 1. Initialize project
dmaic_init.py --process "social-engagement" --goal "maintain quality"

# 2. Collect baseline (20-30 measurements)
for i in {1..25}; do
  measure.py --process social-engagement --metric quality_score --value $SCORE
done

# 3. Generate control chart
control_chart.py --process social-engagement --metric quality_score

# 4. Continue monitoring
measure.py --process social-engagement --metric quality_score --value $NEW_SCORE
control_chart.py --process social-engagement --metric quality_score

# 5. After improvements
improve.py --process social-engagement --change "Added quality gate"
# Continue measuring with new baseline
```

## Example: Trading Accuracy Control Chart

**Scenario**: Monitor trading win rate to detect when strategy degrades

**Setup**:
```bash
dmaic_init.py --process "trading-strategy" \
  --goal "maintain 60%+ win rate" \
  --baseline-metric "win_rate" \
  --baseline-value 0.62
```

**Baseline Data** (25 trades):
```
Mean: 0.62
Std Dev: 0.12
UCL: 0.98 (capped at 1.0)
LCL: 0.26
```

**Monitoring**:
```
Trade 26: 0.70 → In control
Trade 27: 0.55 → In control
Trade 28: 0.20 → OUT! Investigate
```

**Investigation** (Trade 28):
- What was different? High volatility, news event
- Special cause: Strategy doesn't work in high vol
- Action: Add volatility filter before trading

**Result**:
- New mean: 0.68 (improved from 0.62)
- New UCL/LCL calculated from post-filter data
- Process more stable

## Control Chart Template

```markdown
## Control Chart: [Process] - [Metric]

**Period**: [Date range]  
**Sample Size**: [Number of measurements]  
**Control Limits**: Calculated from [baseline period]

| Statistic | Value |
|-----------|-------|
| Mean (CL) | X.XX  |
| UCL (+3σ) | X.XX  |
| LCL (-3σ) | X.XX  |
| Std Dev   | X.XX  |

**Status**: [In Control / Out of Control]

**Out-of-Control Points**:
- Point #X: [Value] on [Date] - [Investigation findings]

**Trends/Patterns**:
- [Describe any trends or cycles observed]

**Actions Taken**:
- [List any process changes made]

**Next Review**: [Date]
```

## Advanced: Process Capability Index (Cpk)

**Purpose**: Quantify how well process meets specifications

**Formula**: `Cpk = min((USL - μ) / 3σ, (μ - LSL) / 3σ)`
- USL = Upper Specification Limit (e.g., 80% target)
- LSL = Lower Specification Limit (e.g., 50% minimum)

**Interpretation**:
- Cpk < 1.0: Process not capable (produces defects)
- Cpk = 1.0: Just capable (3σ at spec limits)
- Cpk > 1.33: Good capability
- Cpk > 2.0: Excellent capability (Six Sigma)

**Example**:
```
Trading win rate:
- Mean: 65%
- Std Dev: 8%
- Minimum acceptable: 50% (LSL)
- Target: 80% (USL)

Cpk = min((80-65)/24, (65-50)/24) = min(0.625, 0.625) = 0.625
```

**Result**: Process not capable (Cpk < 1.0), needs improvement
