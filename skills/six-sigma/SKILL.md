---
name: six-sigma
description: Apply Six Sigma methodology (DMAIC framework) to improve AI agent processes, workflows, and performance. Use when an agent needs to reduce errors, optimize efficiency, eliminate waste, analyze performance metrics, or systematically improve any repeatable process (trading strategies, social engagement, data processing, task execution, heartbeat routines, etc.). Provides tools for Define, Measure, Analyze, Improve, and Control phases.
---

# Six Sigma for AI Agents

Apply Six Sigma methodology to systematically improve your processes, reduce defects, and optimize performance.

## What This Skill Provides

- **DMAIC Framework**: Define, Measure, Analyze, Improve, Control
- **Process Metrics**: Track defects, cycle time, throughput, variation
- **Root Cause Analysis**: Identify bottlenecks and failure modes
- **Improvement Tracking**: Document changes and measure impact
- **Control Charts**: Monitor process stability over time

## Quick Start

### 1. Define a Process to Improve

```bash
scripts/dmaic_init.py --process "weather betting" --goal "reduce false positive bet signals"
```

Creates a project file in `six-sigma-projects/weather-betting/project.json`

### 2. Measure Current Performance

```bash
scripts/measure.py --process weather-betting --metric "bet_accuracy" --value 0.40
```

Logs metrics to `six-sigma-projects/weather-betting/measurements.jsonl`

### 3. Analyze Root Causes

```bash
scripts/analyze.py --process weather-betting
```

Generates analysis report identifying patterns, outliers, and potential causes.

### 4. Implement Improvements

Document improvements in the project file:
```bash
scripts/improve.py --process weather-betting --change "Added NWS data staleness check" --hypothesis "Stale forecasts cause false signals"
```

### 5. Control and Monitor

```bash
scripts/control_chart.py --process weather-betting --metric bet_accuracy
```

Generates control chart showing upper/lower bounds and process stability.

## Common Use Cases for AI Agents

### Trading Strategy Optimization (Crypto)
- **Define**: "Improve conviction threshold accuracy"
- **Measure**: Track win rate, profit factor, Sharpe ratio, false positives
- **Analyze**: Identify which market conditions cause errors (volatility, volume, time of day)
- **Improve**: Adjust thresholds, add filters (volatility gates, volume requirements)
- **Control**: Monitor ongoing performance vs baseline with control charts

### Token Launch Optimization (Web3)
- **Define**: "Reduce failed token deployments and improve liquidity parameters"
- **Measure**: Track deployment success rate, gas costs, initial liquidity depth
- **Analyze**: Identify failure modes (gas estimation, slippage, timing)
- **Improve**: Add pre-deployment validation, optimize gas strategies
- **Control**: Monitor deployment metrics, maintain >95% success rate

### LP Farming Efficiency (DeFi)
- **Define**: "Maximize APY while minimizing impermanent loss"
- **Measure**: Track actual APY, IL percentage, gas costs per rebalance
- **Analyze**: Find optimal pool selection criteria and rebalance frequency
- **Improve**: Refine pool filters, optimize rebalance triggers
- **Control**: Monitor IL/APY ratio weekly, adjust strategy when drift detected

### Gas Optimization (EVM Chains)
- **Define**: "Reduce gas costs and failed transaction rate"
- **Measure**: Track gas per transaction, failed txn rate, timing accuracy
- **Analyze**: Identify when/why transactions fail (gas estimation, network congestion)
- **Improve**: Add gas oracles, implement retry logic with backoff
- **Control**: Monitor gas efficiency, maintain <2% failure rate

### Smart Contract Quality (Development)
- **Define**: "Reduce bugs and audit findings in deployed contracts"
- **Measure**: Track bugs per KLOC, audit severity scores, test coverage
- **Analyze**: Root cause analysis of vulnerabilities (reentrancy, overflow, access control)
- **Improve**: Add automated testing, formal verification, security gates
- **Control**: Monitor bug density over time, trend toward zero critical findings

### Social Engagement Quality
- **Define**: "Reduce low-value replies on 4claw/botchan"
- **Measure**: Track reply quality scores, engagement rates
- **Analyze**: Identify what triggers low-quality responses
- **Improve**: Add quality gates, refine criteria
- **Control**: Track quality metrics over time

### Wallet Security & Error Reduction
- **Define**: "Eliminate wallet address errors and failed transactions"
- **Measure**: Track error rate, error types, transaction success rate
- **Analyze**: Root cause analysis of mistakes (checksum validation, confirmation steps)
- **Improve**: Add validation, multi-sig confirmation for large transfers
- **Control**: Monitor error rate trend, maintain zero-defect target

## Methodologies

### DMAIC (Improve Existing Processes)

Used when optimizing an existing process (trading strategy, LP farming, social engagement, etc.)

#### Define Phase
- Identify the process to improve
- Set specific, measurable goals
- Define success criteria
- Document current state

**Script**: `scripts/dmaic_init.py`

#### Measure Phase
- Collect baseline data
- Identify key metrics (defects, cycle time, throughput)
- Establish measurement system
- Calculate process capability

**Script**: `scripts/measure.py`  
**Reference**: `references/metrics.md`

#### Analyze Phase
- Identify root causes
- Use data to find patterns
- Validate cause-and-effect relationships
- Prioritize improvement opportunities

**Script**: `scripts/analyze.py`  
**Reference**: `references/root-cause-analysis.md`

#### Improve Phase
- Design solutions
- Test changes
- Measure impact
- Document learnings

**Script**: `scripts/improve.py`

#### Control Phase
- Monitor ongoing performance
- Detect process drift
- Maintain improvements
- Update documentation

**Script**: `scripts/control_chart.py`  
**Reference**: `references/control-charts.md`

### DMADV (Design New Processes)

**Also known as "Design for Six Sigma"** - Used when creating new protocols, systems, or strategies from scratch.

#### Define Phase
- Define design goals aligned with user/market demands
- Set quality targets (e.g., <1% failed transactions)
- Document requirements and constraints

**Example**: Designing a new automated LP rebalancing protocol

#### Measure Phase
- Identify CTQs (Critical To Quality characteristics)
- Measure capabilities of components/dependencies
- Assess risks and failure modes

**Example**: Measure gas costs, slippage ranges, network latency for LP rebalancing

#### Analyze Phase
- Develop design alternatives
- Simulate/model different approaches
- Analyze trade-offs (cost vs performance vs reliability)

**Example**: Compare rebalance strategies (time-based vs threshold-based vs ML-based)

#### Design Phase
- Select optimal design from analysis
- Create detailed specifications
- Build prototype or MVP

**Example**: Implement chosen LP rebalancing strategy with safeguards

#### Verify Phase
- Test design with pilot runs
- Validate against CTQs
- Measure actual vs expected performance
- Hand off to operations (Control phase)

**Example**: Deploy LP rebalancer on testnet, then small-scale mainnet, verify gas costs and IL metrics

**When to use DMADV vs DMAIC:**
- DMADV: Designing new token, building new trading bot, creating new protocol
- DMAIC: Improving existing strategy, optimizing current LP positions, fixing known issues

## Key Metrics

### General Metrics (All Agents)
- **Defect Rate**: Errors per 100 operations
- **Cycle Time**: Time to complete a task
- **Throughput**: Tasks completed per hour/day
- **First-Time Yield**: Success rate without rework
- **Process Capability**: Sigma level (higher = better)

### Web3/Crypto-Specific Metrics
- **Trade Win Rate**: Profitable trades / total trades
- **Profit Factor**: Gross profit / gross loss (>1.5 = good)
- **Sharpe Ratio**: Risk-adjusted returns
- **Gas Efficiency**: Average gas per transaction, failed txn rate
- **Slippage Rate**: Actual price vs expected price
- **Impermanent Loss (IL)**: LP position loss vs holding
- **Smart Contract Defect Density**: Bugs per 1000 lines of code
- **Transaction Success Rate**: Successful txns / attempted txns
- **LP APY Accuracy**: Actual APY vs projected APY
- **Token Launch Success**: Deployments succeeded / attempted

See `references/metrics.md` for detailed metric definitions.

## Process Improvement Examples

### Example 1: Weather Betting False Positives

**Before Six Sigma:**
- 10 bets executed
- 4 wins, 6 losses
- 40% accuracy

**After DMAIC:**
- Added NWS data staleness check (Define)
- Tracked bet timing vs data freshness (Measure)
- Found stale data caused 80% of losses (Analyze)
- Implemented <48h freshness filter (Improve)
- Monitor freshness violations weekly (Control)

**Result:** 70% accuracy (from 40%)

### Example 2: Social Engagement Quality

**Before Six Sigma:**
- 20 posts/day
- 30% engagement rate
- Many "gm" low-value replies

**After DMAIC:**
- Define quality criteria (Define)
- Score each post 1-10 (Measure)
- Found <5 score posts had 10% engagement (Analyze)
- Added pre-post quality gate (Improve)
- Weekly quality score monitoring (Control)

**Result:** 60% engagement with 8 posts/day

## Data Storage

All Six Sigma project data stored in:
```
~/.openclaw/workspace/six-sigma-projects/
├── <process-name>/
│   ├── project.json          # Project definition
│   ├── measurements.jsonl    # Metric data (time-series)
│   ├── analysis.md           # Analysis findings
│   ├── improvements.jsonl    # Change log
│   └── control-chart.png     # Latest control chart
```

## Tips for AI Agents

1. **Start small** - Pick one process causing pain
2. **Measure consistently** - Log metrics every time the process runs
3. **Use data, not gut** - Let the numbers show root causes
4. **Test incrementally** - Change one thing at a time
5. **Document everything** - Future-you will thank you
6. **Review weekly** - Check control charts, adjust as needed

## Technical Reference: Sigma Levels

### What is "Six Sigma"?

Six Sigma means the process mean is 6 standard deviations (σ) away from the nearest specification limit. At this level, defects are extremely rare.

**The 1.5 Sigma Shift:**
Real processes drift over time. Six Sigma accounts for this by assuming a 1.5σ shift in the process mean. So a "6σ process" actually performs at 4.5σ (accounting for drift), which produces 3.4 defects per million opportunities (DPMO).

### Sigma Level Table (with 1.5σ shift)

| Sigma | DPMO | Defect % | Yield % | Example (Crypto) |
|-------|------|----------|---------|------------------|
| 1σ | 691,462 | 69% | 31% | 69% of trades fail |
| 2σ | 308,538 | 31% | 69% | 31% of transactions fail |
| 3σ | 66,807 | 6.7% | 93.3% | 6.7% of LP rebalances fail |
| 4σ | 6,210 | 0.62% | 99.38% | 6 failed txns per 1000 |
| 5σ | 233 | 0.023% | 99.977% | 2.3 failed txns per 10,000 |
| 6σ | 3.4 | 0.00034% | 99.99966% | 3.4 failed txns per million |

**Practical Targets for Crypto Agents:**
- **Trading strategies**: 4σ (99.38% win rate unrealistic, but 4σ process capability for execution)
- **Transaction execution**: 5σ (<0.023% failure rate)
- **Smart contracts**: 6σ (near-zero critical bugs)
- **Wallet operations**: 6σ (zero tolerance for address errors)

**Note**: Not every process needs 6σ! Choose appropriate sigma level based on:
- Cost of failure (wallet errors = 6σ, social posts = 3σ is fine)
- Customer expectations (users expect high transaction success)
- Economic viability (cost to achieve vs value gained)

### DPMO Calculation

**DPMO** = (Defects / Opportunities) × 1,000,000

**Example**: 
- 100 trades executed
- 8 losses (defects)
- DPMO = (8 / 100) × 1,000,000 = 80,000 DPMO
- Lookup table: ~2.7σ process (between 2σ and 3σ)

**For Web3:**
- **Gas optimization**: 1000 txns, 5 failed = 5,000 DPMO (~4.1σ)
- **Token launches**: 20 deployments, 1 failed = 50,000 DPMO (~3.1σ)
- **LP farming**: 50 rebalances, 0 failed = 0 DPMO (>6σ, but small sample)

## References

- `references/metrics.md` - Detailed metric definitions and calculations
- `references/root-cause-analysis.md` - Techniques for finding root causes (5 Whys, Fishbone, Pareto)
- `references/control-charts.md` - How to read and interpret control charts
- `references/dmaic-examples.md` - Real examples from AI agent process improvements

## Advanced: Combining with Other Skills

- **memory_search** - Find past process failures to analyze
- **session_status** - Track token usage as a process metric
- **cron** - Schedule weekly control chart reviews
- **memory files** - Log DMAIC learnings for continuity
