# DMAIC Examples for AI Agents

Real examples of Six Sigma process improvements for AI agents, with focus on crypto/web3 use cases.

## Example 1: Gas Optimization for Trading Bot (Crypto)

### Define Phase
**Problem**: High gas costs and 8% failed transaction rate on Base  
**Goal**: Reduce failed transactions to <2% and decrease average gas cost by 30%  
**Metric**: Transaction success rate, average gas per trade

```bash
scripts/dmaic_init.py \
  --process "trading-gas-optimization" \
  --goal "Reduce failed txns to <2%, cut gas 30%" \
  --baseline-metric "success_rate" \
  --baseline-value 0.92
```

### Measure Phase
**Data Collection** (100 transactions):
```bash
# Log every transaction
scripts/measure.py --process trading-gas-optimization --metric success_rate --value 1  # success
scripts/measure.py --process trading-gas-optimization --metric success_rate --value 0  # failed
scripts/measure.py --process trading-gas-optimization --metric gas_cost --value 0.00045  # ETH
# ... 97 more trades
```

**Results**:
- 92 successes, 8 failures (8% failure rate)
- Average gas: 0.00052 ETH (~$1.04)
- Pattern: Failures clustered during high network congestion (>50 gwei base fee)

### Analyze Phase
```bash
scripts/analyze.py --process trading-gas-optimization
```

**Findings**:
- 7/8 failures occurred when base fee >60 gwei
- Gas estimation was static (always 200k gas limit)
- No retry logic for failed transactions
- **Root Cause**: Static gas parameters don't adapt to network conditions

**Pareto Analysis**:
| Failure Type | Count | % |
|--------------|-------|---|
| Out of gas | 5 | 62.5% |
| Slippage exceeded | 2 | 25% |
| Nonce collision | 1 | 12.5% |

### Improve Phase
**Changes Implemented**:
```bash
scripts/improve.py \
  --process trading-gas-optimization \
  --change "Added dynamic gas estimation + retry logic with exponential backoff" \
  --hypothesis "Adaptive gas + retries will reduce failures" \
  --expected-impact "-75% failure rate, -30% avg gas cost"
```

**Code Changes**:
```python
# Before
gas_limit = 200000  # Static
max_priority_fee = 2 * 10**9  # 2 gwei fixed

# After  
gas_estimate = await estimate_gas() * 1.2  # 20% buffer
base_fee = await get_base_fee()
if base_fee > 60 * 10**9:  # >60 gwei
    wait_for_congestion_drop()  # Delay non-urgent trades
max_priority_fee = min(base_fee * 0.1, 5 * 10**9)  # Dynamic tip
# Add retry logic with backoff (3 attempts max)
```

### Control Phase
**Ongoing Monitoring** (100 transactions post-fix):
```bash
scripts/control_chart.py --process trading-gas-optimization --metric success_rate
```

**Results**:
- Success rate: 99% (from 92%)
- Average gas: 0.00037 ETH (~$0.74, 29% reduction)
- Failure rate: 1% (<2% target achieved)
- UCL: 100%, LCL: 96% (process stable)

**Lesson**: Dynamic parameters beat static configs for blockchain interactions

---

## Example 2: Token Launch Success Rate (Web3)

### Define Phase
**Problem**: 3 out of 10 token deployments failed (30% failure rate)  
**Goal**: Achieve >95% deployment success rate  
**Metrics**: Deployment success, gas costs, time to liquidity

```bash
scripts/dmaic_init.py \
  --process "token-deployment" \
  --goal "95%+ success rate" \
  --baseline-metric "deployment_success" \
  --baseline-value 0.70
```

### Measure Phase
**Data** (20 deployment attempts):
- 14 successes, 6 failures (70% success)
- Failures: 3 gas estimation errors, 2 slippage on initial liquidity, 1 contract revert

### Analyze Phase
**Root Causes**:
1. **Gas estimation** - Used default estimate, didn't account for contract complexity
2. **Liquidity parameters** - Fixed slippage tolerance, failed in volatile markets
3. **Contract validation** - No pre-deployment testing on fork/testnet

### Improve Phase
**Changes**:
```bash
scripts/improve.py \
  --process token-deployment \
  --change "Added testnet validation + dynamic slippage + 30% gas buffer" \
  --expected-impact "+25% success rate"
```

**Validation Gate**:
```python
def deploy_token(name, symbol):
    # 1. Test on fork first
    fork_result = test_on_fork(name, symbol)
    if not fork_result.success:
        return Error("Failed on fork")
    
    # 2. Dynamic gas
    gas_estimate = fork_result.gas_used * 1.3  # 30% buffer
    
    # 3. Check market conditions for liquidity add
    volatility = get_market_volatility()
    slippage = 0.5 if volatility < 0.02 else 1.0  # Adaptive
    
    # 4. Deploy with retry logic
    return deploy_with_retries(gas_estimate, slippage)
```

### Control Phase
**Results** (20 deployments post-fix):
- Success rate: 95% (19/20)
- Only 1 failure (extreme network congestion, manual retry succeeded)
- Process capability: 3.5σ

**Lesson**: Pre-flight validation prevents costly mainnet failures

---

## Example 3: Weather Betting Accuracy

### Define Phase
**Problem**: Low accuracy on weather bets (40%)  
**Goal**: Achieve 70%+ accuracy  
**Metric**: Win rate (successful bets / total bets)

```bash
scripts/dmaic_init.py \
  --process "weather-betting" \
  --goal "Achieve 70%+ accuracy" \
  --baseline-metric "win_rate" \
  --baseline-value 0.40
```

### Measure Phase
**Data Collection** (20 bets):
```bash
scripts/measure.py --process weather-betting --metric win_rate --value 1  # win
scripts/measure.py --process weather-betting --metric win_rate --value 0  # loss
# ... 18 more bets
```

**Results**:
- 8 wins, 12 losses
- Win rate: 40%
- Pattern: Losses clustered on older forecasts

### Analyze Phase
```bash
scripts/analyze.py --process weather-betting
```

**Findings**:
- 10/12 losses used forecasts >24 hours old
- 7/8 wins used forecasts <12 hours old
- **Root Cause**: Stale forecast data causes false signals

### Improve Phase
**Change Implemented**:
```bash
scripts/improve.py \
  --process weather-betting \
  --change "Added <48h freshness check to bet filter" \
  --hypothesis "Stale forecasts cause false signals" \
  --expected-impact "+30% accuracy"
```

**Code Change**:
```python
# Before
if edge > 0.10:
    place_bet()

# After
if edge > 0.10 and forecast_age_hours < 48:
    place_bet()
```

### Control Phase
**Ongoing Monitoring**:
```bash
# After 20 more bets with freshness check
scripts/control_chart.py --process weather-betting --metric win_rate
```

**Results**:
- New win rate: 70% (from 40%)
- UCL: 0.90, LCL: 0.50
- Process stable, no out-of-control points

**Lesson**: Data quality matters more than signal quality

---

## Example 2: Social Engagement Quality

### Define Phase
**Problem**: Low engagement on 4claw/botchan posts  
**Goal**: 60%+ engagement rate with fewer posts  
**Metrics**: Engagement rate, quality score (1-10)

```bash
scripts/dmaic_init.py \
  --process "social-engagement" \
  --goal "60% engagement with quality posts" \
  --baseline-metric "engagement_rate" \
  --baseline-value 0.30
```

### Measure Phase
**Data Collection** (30 posts):
```bash
# Log each post with quality score + engagement
scripts/measure.py --process social-engagement --metric quality_score --value 7 --context "thoughtful reply"
scripts/measure.py --process social-engagement --metric engagement_rate --value 0.65 --context "same post"

scripts/measure.py --process social-engagement --metric quality_score --value 2 --context "generic gm"
scripts/measure.py --process social-engagement --metric engagement_rate --value 0.10 --context "same post"
```

**Results**:
- Posts with quality <5: 10% avg engagement
- Posts with quality ≥7: 70% avg engagement
- 40% of posts scored <5 (wasting effort)

### Analyze Phase
```bash
scripts/analyze.py --process social-engagement
```

**Findings** (Pareto Analysis):
| Post Type | Count | Engagement |
|-----------|-------|------------|
| Generic replies (gm, nice) | 12 | 10% |
| Thoughtful analysis | 8 | 75% |
| Questions/discussion | 6 | 60% |
| Data/insights | 4 | 80% |

**Root Cause**: No quality gate before posting → low-value posts dilute engagement

### Improve Phase
**Changes Implemented**:
```bash
scripts/improve.py \
  --process social-engagement \
  --change "Added pre-post quality gate: score ≥6 required" \
  --expected-impact "+30% engagement, -60% post volume"
```

**Quality Gate**:
```python
def should_post(content):
    score = rate_quality(content)  # 1-10
    if score < 6:
        return False  # Don't post low-quality
    return True
```

### Control Phase
**Monitoring** (weekly control chart):
```bash
scripts/control_chart.py --process social-engagement --metric engagement_rate
```

**Results**:
- Engagement rate: 60% (from 30%)
- Posts per day: 8 (from 20)
- Quality score avg: 7.5 (from 5.2)
- Process stable

**Lesson**: Quality > quantity for social engagement

---

## Example 3: Heartbeat Check Efficiency

### Define Phase
**Problem**: Too many wasted heartbeat checks (nothing actionable)  
**Goal**: 50%+ actionable rate during waking hours  
**Metric**: Actionable checks / total checks

```bash
scripts/dmaic_init.py \
  --process "heartbeat-checks" \
  --goal "50% actionable rate" \
  --baseline-metric "actionable_rate" \
  --baseline-value 0.25
```

### Measure Phase
**Data Collection** (48 checks over 24h):
```bash
# Log every heartbeat with outcome
scripts/measure.py --process heartbeat-checks --metric actionable_rate --value 1 --context "00:30 - nothing"
scripts/measure.py --process heartbeat-checks --metric actionable_rate --value 1 --context "01:00 - nothing"
# ... (0 = actionable, 1 = waste)
```

**Results by Time**:
| Time Range | Checks | Actionable | Waste Rate |
|------------|--------|------------|------------|
| 00:00-06:00 | 12 | 1 | 92% |
| 06:00-12:00 | 12 | 7 | 42% |
| 12:00-18:00 | 12 | 9 | 25% |
| 18:00-24:00 | 12 | 4 | 67% |

### Analyze Phase
**Root Cause**: Static check frequency ignores activity patterns

**Findings**:
- User asleep 00:00-06:00 → no urgent activity
- Markets active 09:00-16:00 → higher value checks
- Evening low activity → less urgent

### Improve Phase
**Changes**:
```bash
scripts/improve.py \
  --process heartbeat-checks \
  --change "Dynamic frequency: 4h during sleep, 30min during market hours, 2h otherwise" \
  --hypothesis "Time-based frequency matches activity patterns"
```

**Implementation**:
```python
def get_check_interval():
    hour = datetime.now().hour
    if 0 <= hour < 6:
        return 4 * 3600  # 4 hours
    elif 9 <= hour < 16:
        return 30 * 60   # 30 minutes
    else:
        return 2 * 3600  # 2 hours
```

### Control Phase
**Results** (after 7 days):
- Actionable rate: 55% (from 25%)
- Checks per day: 18 (from 48)
- Coverage maintained during key hours

**Lesson**: Match process frequency to value delivered

---

## Example 4: Wallet Address Error Elimination

### Define Phase
**Problem**: Sent $58 to wrong wallet (60% of portfolio lost)  
**Goal**: Zero wallet address errors  
**Metric**: Address validation failures / total transactions

```bash
scripts/dmaic_init.py \
  --process "wallet-validation" \
  --goal "Zero address errors" \
  --baseline-metric "error_rate" \
  --baseline-value 0.05  # 1 error in 20 txns
```

### Measure Phase
**Historical Data** (100 transactions):
```bash
# Review past transactions, log errors
scripts/measure.py --process wallet-validation --metric error_rate --value 1  # error
scripts/measure.py --process wallet-validation --metric error_rate --value 0  # success
# ... 98 more
```

**Results**:
- 5 address errors / 100 transactions = 5% error rate
- All errors: Mixed up similar addresses or copy/paste errors

### Analyze Phase
**5 Whys**:
1. Why did I send to wrong address? → Copied wrong address
2. Why did I copy wrong address? → Multiple addresses in chat history
3. Why didn't I validate before sending? → No validation step
4. Why is there no validation step? → Never implemented
5. Why never implemented? → Didn't seem necessary until $58 loss

**Root Cause**: Missing validation step before transaction

### Improve Phase
**Changes**:
```bash
scripts/improve.py \
  --process wallet-validation \
  --change "Added 3-step validation: checksum, known-address list, user confirmation" \
  --expected-impact "Zero errors"
```

**Validation Gate**:
```python
def validate_address(addr):
    # 1. Checksum validation
    if not is_valid_checksum(addr):
        raise ValueError("Invalid checksum")
    
    # 2. Known address check
    if addr not in known_addresses and addr not in recent_recipients:
        warn("Unknown address - confirm with user")
    
    # 3. Display truncated address for confirmation
    display(f"Send to {addr[:8]}...{addr[-6:]}?")
    confirm = await get_user_confirmation()
    
    return confirm
```

### Control Phase
**Monitoring** (100 transactions post-fix):
```bash
scripts/control_chart.py --process wallet-validation --metric error_rate
```

**Results**:
- Error rate: 0% (from 5%)
- 3 near-misses caught by validation
- Process stable

**Lesson**: Validation gates prevent costly errors

---

## Example 5: Trading Conviction Threshold Optimization

### Define Phase
**Problem**: Conviction threshold too conservative (7/10) → missing opportunities  
**Goal**: Optimize threshold for max profit without excess risk  
**Metric**: Profit per trade, trades per week

```bash
scripts/dmaic_init.py \
  --process "conviction-threshold" \
  --goal "Optimize profit vs opportunity cost" \
  --baseline-metric "profit_per_trade" \
  --baseline-value 2.50
```

### Measure Phase
**Data Collection** (testing different thresholds):
```bash
# Threshold 7/10 (baseline)
scripts/measure.py --process conviction-threshold --metric trades_per_week --value 2
scripts/measure.py --process conviction-threshold --metric profit_per_trade --value 2.50

# Threshold 6/10
scripts/measure.py --process conviction-threshold --metric trades_per_week --value 5
scripts/measure.py --process conviction-threshold --metric profit_per_trade --value 2.20

# Threshold 5.5/10
scripts/measure.py --process conviction-threshold --metric trades_per_week --value 8
scripts/measure.py --process conviction-threshold --metric profit_per_trade --value 1.90
```

**Results**:
| Threshold | Trades/Week | Profit/Trade | Total Profit |
|-----------|-------------|--------------|--------------|
| 7/10 | 2 | $2.50 | $5/week |
| 6/10 | 5 | $2.20 | $11/week |
| 5.5/10 | 8 | $1.90 | $15.20/week |

### Analyze Phase
**Finding**: Lower threshold = more trades = higher total profit despite lower per-trade profit

**Calculation**:
- 5.5/10 threshold: 3x more trades with only -24% profit/trade
- Net: +204% weekly profit

**Root Cause**: Initial threshold was arbitrary, not data-driven

### Improve Phase
```bash
scripts/improve.py \
  --process conviction-threshold \
  --change "Adjusted threshold from 7/10 to 5.5/10" \
  --hypothesis "Volume increase outweighs quality decrease"
```

### Control Phase
**Monitoring** (4 weeks):
```bash
scripts/control_chart.py --process conviction-threshold --metric weekly_profit
```

**Results**:
- Avg weekly profit: $14.80 (from $5)
- Win rate: 62% (vs 75% at 7/10 threshold)
- Process stable

**Lesson**: Data beats intuition for threshold optimization

---

## Common Patterns

### Pattern 1: Data Quality Issues
**Symptoms**: Inconsistent results, random errors  
**Root Cause**: Stale, invalid, or missing data  
**Solution**: Add validation, freshness checks, fallbacks

### Pattern 2: Missing Validation Gates
**Symptoms**: Preventable errors slip through  
**Root Cause**: No quality/safety checks  
**Solution**: Add pre-execution validation

### Pattern 3: Static vs Dynamic Configuration
**Symptoms**: Process works sometimes, not others  
**Root Cause**: One-size-fits-all settings  
**Solution**: Adapt to context (time, volatility, etc.)

### Pattern 4: Quality vs Quantity Tradeoffs
**Symptoms**: High volume, low value output  
**Root Cause**: No quality filter  
**Solution**: Add quality gates, reduce volume

### Pattern 5: Arbitrary Thresholds
**Symptoms**: Gut-feeling settings underperform  
**Root Cause**: No data-driven optimization  
**Solution**: Test, measure, optimize
