# Six Sigma Metrics for AI Agents

Focus on general + crypto/web3-specific metrics.

## Core Metrics (All Agents)

### Defect Rate
**Definition**: Errors or failures per 100 operations

**Formula**: `(Defects / Total Opportunities) × 100`

**Example**: 
- 6 failed trades out of 30 attempts = (6/30) × 100 = 20% defect rate

**When to use**: Tracking errors, failed transactions, incorrect outputs

**Target**: <3.4 defects per 100 (Six Sigma standard)

### Cycle Time
**Definition**: Time from start to completion of a process

**Formula**: `End Time - Start Time`

**Example**:
- Weather bet decision: 45 seconds from signal to execution
- Social post: 12 seconds from idea to published

**When to use**: Optimizing speed, identifying bottlenecks

**Target**: Minimize without sacrificing quality

### Throughput
**Definition**: Number of completed operations per time unit

**Formula**: `Completed Operations / Time Period`

**Example**:
- 15 alpha signals processed per hour
- 8 quality social posts per day

**When to use**: Measuring productivity, capacity planning

**Target**: Maximize while maintaining quality

### First-Time Yield (FTY)
**Definition**: Percentage of operations completed correctly on first attempt

**Formula**: `(Successful First Attempts / Total Attempts) × 100`

**Example**:
- 7 trades executed correctly without retry out of 10 = 70% FTY

**When to use**: Measuring process quality, reducing rework

**Target**: >95%

### Process Capability (Sigma Level)
**Definition**: How well a process meets specifications

**Calculation**:
1. Calculate mean and standard deviation
2. Determine upper/lower spec limits
3. Sigma level = (Spec Limit - Mean) / Std Dev

**Sigma Levels**:
- 1σ = 68.3% within spec (31.7% defects)
- 2σ = 95.4% within spec (4.6% defects)
- 3σ = 99.7% within spec (0.3% defects)
- 6σ = 99.9997% within spec (0.0003% defects)

**Example**:
- Mean trading accuracy: 65%
- Std dev: 10%
- Target: >50% accuracy
- Sigma level = (65 - 50) / 10 = 1.5σ

**When to use**: Assessing overall process maturity

**Target**: 3σ or higher (99.7% quality)

## AI Agent-Specific Metrics

### Conviction Accuracy
**Definition**: How often high-conviction predictions are correct

**Formula**: `(Correct High-Conviction Calls / Total High-Conviction Calls) × 100`

**Example**:
- 8 conviction ≥6/10 signals, 6 were profitable = 75% accuracy

**Tracking**: Log conviction score + outcome for each decision

### Response Quality Score
**Definition**: Subjective quality rating of agent outputs

**Scale**: 1-10 (1=spam, 10=exceptional value)

**Factors**:
- Relevance (does it answer the question?)
- Accuracy (is the information correct?)
- Engagement (does it spark discussion?)
- Originality (is it insightful?)

**Example**:
- Generic "gm" reply: 2/10
- Thoughtful analysis with data: 8/10

**Tracking**: Score each output, track distribution

### False Positive/Negative Rate
**Definition**: Incorrect signals in decision-making

**False Positive**: Signal fires when it shouldn't (e.g., bad trade signal)
**False Negative**: Signal misses when it should fire (e.g., missed opportunity)

**Formula**: 
- FP Rate = (False Positives / Total Negatives) × 100
- FN Rate = (False Negatives / Total Positives) × 100

**Example**:
- 20 bet signals generated
- 12 were profitable (true positives)
- 8 were losers (false positives)
- 5 opportunities missed (false negatives)
- FP Rate = (8/25) × 100 = 32%
- FN Rate = (5/17) × 100 = 29%

**When to use**: Optimizing signal thresholds, reducing noise

### Token Efficiency
**Definition**: Value per token consumed

**Formula**: `Output Value / Tokens Used`

**Example**:
- Generated $10 profit using 50k tokens = $0.0002/token
- Wrote useful skill using 100k tokens = subjective value

**When to use**: Optimizing context window usage, model selection

**Tracking**: Log token usage + outcome value

## Web3/Crypto-Specific Metrics

### Profit Factor
**Definition**: Ratio of gross profit to gross loss in trading

**Formula**: `Gross Profit / Gross Loss`

**Example**:
- 10 trades: 6 wins ($120 profit), 4 losses ($40 loss)
- Profit Factor = $120 / $40 = 3.0

**Targets**:
- PF < 1.0: Losing strategy
- PF = 1.0-1.5: Breakeven/marginal
- PF > 1.5: Good strategy
- PF > 2.0: Excellent strategy

**When to use**: Evaluating trading bot performance

### Sharpe Ratio
**Definition**: Risk-adjusted return (excess return per unit of risk)

**Formula**: `(Return - Risk-Free Rate) / Standard Deviation of Returns`

**Example**:
- Average return: 2% per trade
- Std dev: 5%
- Risk-free rate: 0.1%
- Sharpe = (0.02 - 0.001) / 0.05 = 0.38

**Targets**:
- Sharpe < 1: Poor risk-adjusted performance
- Sharpe 1-2: Good
- Sharpe > 2: Excellent

**When to use**: Comparing different trading strategies

### Gas Efficiency
**Definition**: Average gas cost per transaction and failure rate

**Metrics**:
- Average gas (ETH) per successful transaction
- Failed transaction rate (%)
- Gas waste (gas spent on failed txns)

**Example**:
- 100 txns, 95 succeeded
- Total gas: 0.05 ETH
- Avg gas per successful txn: 0.05 / 95 = 0.000526 ETH
- Failed txn rate: 5%
- Gas waste: 5 failed * 0.0005 ETH = 0.0025 ETH (wasted)

**Targets**:
- Failed txn rate: <2% (5σ)
- Gas optimization: Continuous improvement, track trend

**When to use**: Optimizing blockchain interaction efficiency

### Slippage Rate
**Definition**: Difference between expected and actual execution price

**Formula**: `|(Actual Price - Expected Price) / Expected Price| × 100`

**Example**:
- Expected: 1 ETH = 2000 USDC
- Actual: 1 ETH = 1980 USDC
- Slippage = |1980 - 2000| / 2000 × 100 = 1%

**Targets**:
- DEX swaps: <0.5% for liquid pairs, <2% for illiquid
- Large orders: Use TWAP/limit orders to reduce slippage

**When to use**: Trading execution quality, DEX selection

### Impermanent Loss (IL)
**Definition**: Loss from providing liquidity vs simply holding tokens

**Formula**: 
`IL = LP Value - HODL Value`
or as percentage:
`IL% = (LP Value / HODL Value - 1) × 100`

**Example**:
- Deposited 1 ETH + 2000 USDC (value: $4000)
- After 1 week: LP value = $3900, HODL value = $4100
- IL = $3900 - $4100 = -$200
- IL% = ($3900 / $4100 - 1) × 100 = -4.88%

**Mitigation**:
- Choose stable/correlated pairs (e.g., USDC/DAI)
- Target high APY to offset IL
- Use dynamic fee tiers (Uniswap V3)

**When to use**: LP farming strategy optimization

### Transaction Success Rate
**Definition**: Percentage of transactions that succeed on first attempt

**Formula**: `(Successful Txns / Total Attempts) × 100`

**Example**:
- 200 transactions attempted
- 196 succeeded, 4 failed
- Success rate: 98%
- DPMO: (4 / 200) × 1,000,000 = 20,000 DPMO (~3.8σ)

**Targets**:
- Critical operations (transfers, deployments): >99.5% (5σ)
- General transactions: >98% (4σ)

**When to use**: Measuring infrastructure reliability

### Smart Contract Defect Density
**Definition**: Number of bugs per 1000 lines of code (KLOC)

**Formula**: `(Total Bugs / Lines of Code) × 1000`

**Example**:
- 500 lines of Solidity
- 2 bugs found in audit (1 medium, 1 low)
- Defect density: (2 / 500) × 1000 = 4 bugs/KLOC

**Industry Targets**:
- Pre-audit: 10-20 bugs/KLOC (normal)
- Post-audit: <1 critical bug/KLOC
- Production: 0 critical bugs (6σ for security)

**When to use**: Smart contract development quality tracking

### LP APY Accuracy
**Definition**: Variance between projected and actual LP returns

**Formula**: `|Actual APY - Projected APY| / Projected APY × 100`

**Example**:
- Projected APY: 50%
- Actual APY (after 1 month annualized): 35%
- Variance: |35 - 50| / 50 × 100 = 30% error

**Root Causes**:
- IL not accounted for
- Fee estimates too optimistic
- Market volatility changed

**When to use**: LP farming ROI prediction accuracy

### Token Launch Success Rate
**Definition**: Successful deployments / total attempts

**Formula**: `(Successful Deployments / Total Attempts) × 100`

**Example**:
- 20 token deployments attempted
- 18 succeeded (2 failed due to gas issues)
- Success rate: 90%
- Target: >95% (3.5σ)

**When to use**: Deployment pipeline reliability

## Measurement Best Practices

1. **Consistency** - Measure the same way every time
2. **Frequency** - Measure every occurrence (not samples)
3. **Context** - Log relevant contextual factors
4. **Timeliness** - Record immediately (not from memory)
5. **Automation** - Script measurement where possible

## Data Collection Tips

**Use JSONL format** for time-series data:
```json
{"timestamp":"2026-02-11T12:00:00Z","metric":"accuracy","value":0.75,"context":"morning"}
{"timestamp":"2026-02-11T18:00:00Z","metric":"accuracy","value":0.60,"context":"evening"}
```

**Benefits**:
- Append-only (no rewrites)
- Line-by-line parsing
- Easy filtering
- Standard format

**Storage**:
```
~/.openclaw/workspace/six-sigma-projects/<process>/measurements.jsonl
```

## Common Pitfalls

1. **Measuring vanity metrics** - Track what matters, not what looks good
2. **Inconsistent definitions** - Define metrics once, follow strictly
3. **Too many metrics** - Start with 2-3 key metrics
4. **No baseline** - Record current state before improving
5. **Ignoring context** - Log environmental factors affecting performance
