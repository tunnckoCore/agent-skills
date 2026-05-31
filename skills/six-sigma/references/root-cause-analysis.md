# Root Cause Analysis Techniques

## Overview

Root cause analysis identifies the fundamental reason a problem occurs, not just its symptoms. For AI agents, this means finding why processes fail, not just that they fail.

## The 5 Whys Technique

**When to use**: Simple problems with clear cause-effect chains

**How it works**: Ask "Why?" five times to drill down to root cause

**Example: Weather Betting False Positives**

1. **Why did the bet lose?**  
   → Market prediction was wrong

2. **Why was the market prediction wrong?**  
   → NWS forecast didn't match actual temperature

3. **Why didn't the NWS forecast match?**  
   → Forecast data was stale (24+ hours old)

4. **Why was the forecast data stale?**  
   → No freshness check in the betting script

5. **Why is there no freshness check?**  
   → Feature never implemented in initial version

**Root Cause**: Missing data validation feature  
**Solution**: Add timestamp check, skip bets on stale data

**Tips**:
- Keep asking until you hit something you can control
- Root cause often involves a missing process/control
- If you hit "bad luck," keep digging—there's usually a system issue

## Fishbone Diagram (Ishikawa)

**When to use**: Complex problems with multiple potential causes

**Categories** (for AI agents):
- **Code/Logic**: Bugs, edge cases, algorithm issues
- **Data**: Quality, freshness, availability, format
- **Environment**: API outages, network issues, system load
- **Configuration**: Wrong parameters, thresholds, settings
- **Human Input**: Unclear instructions, changing requirements
- **Timing**: Race conditions, market hours, rate limits

**Example: Low Social Engagement**

```
Problem: 30% engagement rate on posts

Code/Logic          Data
    |                 |
    |                 |--- Stale trending topics
    |                 |--- Missing context from chat history
    |
    |--- Generic templates
    |--- No quality filter
    
Environment         Configuration
    |                 |
    |                 |--- Posting at wrong times
    |                 |--- Frequency too high
    |
    |--- Platform rate limits
    |--- Feed algorithm changes

Human Input         Timing
    |                 |
    |                 |--- Overlaps with high-volume periods
    |                 |--- Time zone mismatches
    |
    |--- Vague post requirements
```

**Root Causes Identified**:
1. Generic templates (Code)
2. Wrong posting times (Configuration)
3. No quality gate (Code)

**Solutions**:
1. Add quality scoring before posting
2. Optimize post timing based on engagement data
3. Remove template reliance, generate fresh content

## Pareto Analysis (80/20 Rule)

**When to use**: Prioritizing which problems to fix first

**Principle**: 80% of defects come from 20% of causes

**Process**:
1. List all defect categories
2. Count frequency of each
3. Sort by frequency (descending)
4. Calculate cumulative percentage
5. Focus on top 20% of causes

**Example: Trading Errors**

| Error Type | Count | % of Total | Cumulative % |
|------------|-------|------------|--------------|
| Wrong wallet address | 12 | 48% | 48% |
| Slippage too high | 8 | 32% | 80% |
| Gas estimation failed | 3 | 12% | 92% |
| Contract revert | 2 | 8% | 100% |

**Analysis**: 
- Top 2 causes = 80% of errors
- Fix wallet validation + slippage checks first
- Ignore contract reverts for now (8% of issues)

**Benefits**:
- Focus effort where it matters
- Quick wins for maximum impact
- Avoid wasting time on rare issues

## Data-Driven Root Cause Analysis

**When to use**: When you have measurement data

**Process**:
1. Plot metric over time
2. Identify when problems occur
3. Correlate with contextual factors
4. Test hypotheses with controlled changes

**Example: Heartbeat Check Waste**

**Data collected**:
```
Time      | Checks | Actionable | Waste %
----------|--------|------------|--------
00:00-06:00 | 12   | 1          | 92%
06:00-12:00 | 12   | 7          | 42%
12:00-18:00 | 12   | 9          | 25%
18:00-24:00 | 12   | 4          | 67%
```

**Pattern**: High waste rate during night/evening hours

**Hypothesis**: Undertow is asleep, markets are closed, no urgent activity

**Root Cause**: Static check frequency ignores activity patterns

**Solution**: 
- Reduce frequency 00:00-06:00 (every 2h → every 4h)
- Maintain frequency during active hours
- Add "last activity" check before running full heartbeat

## Common Root Causes for AI Agents

### 1. Missing Validation
**Symptom**: Random failures, unexpected errors  
**Root Cause**: No input validation, no safety checks  
**Solution**: Add validation gates, fail fast with clear errors

### 2. Stale Data
**Symptom**: Decisions based on outdated information  
**Root Cause**: No freshness checks, caching issues  
**Solution**: Add timestamp validation, implement TTL

### 3. Wrong Thresholds
**Symptom**: Too many false positives/negatives  
**Root Cause**: Arbitrary threshold values, no tuning  
**Solution**: Analyze distributions, optimize thresholds

### 4. Context Loss
**Symptom**: Repetitive mistakes, no learning  
**Root Cause**: Not reading/writing memory files  
**Solution**: Implement memory search, log learnings

### 5. Timing Issues
**Symptom**: Missed opportunities, race conditions  
**Root Cause**: Static schedules, no event-driven triggers  
**Solution**: Add event listeners, optimize timing

### 6. API Unreliability
**Symptom**: Intermittent failures, timeouts  
**Root Cause**: External dependency, no fallback  
**Solution**: Add retries, implement fallback paths

## Root Cause Documentation Template

Use this template in `analysis.md`:

```markdown
## Root Cause Analysis: [Problem]

**Problem Statement**: [Clear description of the issue]

**Impact**: [Quantify the problem - defect rate, lost value, etc.]

**Analysis Method**: [5 Whys / Fishbone / Pareto / Data-Driven]

**Findings**:
1. [First level cause]
   - Supporting evidence: [data, observations]
2. [Second level cause]
   - Supporting evidence: [data, observations]

**Root Cause**: [The fundamental, controllable cause]

**Validation**: [How we confirmed this is the root cause]

**Proposed Solutions**:
1. [Primary solution]
   - Expected impact: [quantified]
   - Effort: [low/medium/high]
2. [Alternative solution]
   - Expected impact: [quantified]
   - Effort: [low/medium/high]

**Next Steps**:
- [ ] Implement solution
- [ ] Measure before/after
- [ ] Monitor with control chart
```

## Tips for Effective Root Cause Analysis

1. **Use data, not assumptions** - Let measurements guide you
2. **Go deep enough** - Surface causes aren't root causes
3. **Look for patterns** - One failure = incident, multiple = system issue
4. **Focus on process, not blame** - The system failed, not you
5. **Test your hypothesis** - Implement fix, measure impact
6. **Document everything** - Future-you will forget
7. **Iterate** - First root cause might reveal deeper issues

## Combining Techniques

**Best practice**: Use multiple techniques together

1. **Pareto** → Identify top problem to solve
2. **Fishbone** → Brainstorm potential causes
3. **5 Whys** → Drill down on most likely causes
4. **Data-Driven** → Validate with measurements
5. **Control Chart** → Monitor fix effectiveness
