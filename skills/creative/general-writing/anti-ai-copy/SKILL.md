---
name: anti-ai-copy
description: Edits any writing so it sounds specific, human, and not AI-polished. Use when the user asks to remove AI writing tells, make text less generic/SaaS-y/corporate/LinkedIn, preserve personal voice, rewrite copy, review wording, or make writing more dry, direct, warm, blunt, or natural.
---

# Anti-AI Copy

## Purpose
Edit writing so it sounds like a real person with a context, taste, and point of view wrote it. This skill is universal: use it for product pages, docs, READMEs, emails, social posts, bios, UI labels, articles, internal notes, and personal writing.

The goal is not to make text quirky. The goal is to remove model-polish: generic claims, soft transitions, smooth sameness, and words that make every topic sound like the same brochure.

## Core rules
1. **Preserve the writer’s voice.** Do not sand the text into a new house style unless asked.
2. **Do not synonym-swap banned words.** Rewrite the sentence around concrete meaning.
3. **Specific beats polished.** Prefer nouns, examples, constraints, numbers, names, and lived details.
4. **Do not over-humanize.** Forced slang, fake jokes, and random sentence fragments are also AI tells now.
5. **AI detection is not the goal.** Detectors are unreliable. The goal is better writing.

Bad fix:
- “unlock your workflow” → “open up your workflow”

Good fix:
- “unlock your workflow” → “keep the issue, diff, terminal, and review notes in one place”

## Scope notes
- The user asks for copywriting, editing, rewriting, wording, tone, tagline, messaging, or voice.
- The user says the text feels “AI”, “SaaS-y”, “generic”, “too polished”, “corporate”, “LinkedIn”, “marketing”, “soulless”, “not human”, “not me”, or “written by ChatGPT”.
- The user asks to make text more natural, dry, direct, blunt, warm, personal, specific, founder-written, less cringe, or less try-hard.
- You are reviewing public or identity-bearing text where trust depends on voice.

## Boundaries
- The task is only strict grammar/spelling cleanup and the user did not ask for voice changes.
- The writing is legal, medical, regulatory, safety, or compliance text where convention matters more than voice.
- The user wants academic style, citations, or formal precision rather than naturalness.
- The user explicitly asks for conventional corporate polish.

## Inputs expected
Required:
- the text to review, or the file/page containing it
- the intended audience/context, if not obvious

Optional:
- desired voice words, e.g. dry, kind, blunt, careful, playful
- phrases that must stay
- examples of the writer’s existing voice
- where the text will appear, e.g. landing page, email, README, tweet, issue, UI

## Workflow
1. **Identify the job of the text.**
   - What should the reader know, feel, or do?
   - What relationship does the writer have with the reader?
   - What level of polish is appropriate for the venue?

2. **Detect the current voice.**
   Preserve useful traits before editing:
   - sentence length and rhythm
   - formality level
   - humour or restraint
   - technical density
   - warmth, irritation, uncertainty, confidence

3. **Scan for AI tells.**
   Use `references/trope-checklist.md` for a full pass.
   Look for:
   - hype verbs: unlock, unleash, elevate, empower, transform
   - abstraction fog: landscape, ecosystem, journey, solution, capabilities
   - synthetic transitions: furthermore, additionally, it is important to note
   - symmetrical slogans: not just X but Y, more than X, where X meets Y
   - vague adjective stacks: seamless, powerful, robust, intuitive, innovative
   - cadence sameness: every paragraph has the same smooth shape

4. **Replace claims with evidence.**
   - Name the thing, not the vibe.
   - Add one concrete example where the text currently makes a broad claim.
   - Keep caveats if they make the text more trustworthy.

5. **Break the rhythm deliberately.**
   AI-ish writing is often too even. Vary sentence length. Let a short sentence stand. Cut throat-clearing. Keep one odd phrase if it belongs to the writer.

6. **Tune attitude to the context.**
   - Product/README: concrete, useful, lightly opinionated.
   - Email: direct, kind, not over-explained.
   - Social post: one point, less setup, more human rhythm.
   - Docs: clear first; personality only where it helps.
   - Bio/about: specific details over self-description.

7. **Return edits in the right format.**
   - Small text: provide a rewritten version directly.
   - Review: use a table with `Current`, `Issue`, and `Rewrite`.
   - File edit: edit the file, then summarize what changed.
   - If the user asks “what’s wrong”, diagnose first before rewriting.

## Validation
Before finalising, check:
- No “unlock”, “unleash”, “seamless”, “revolutionary”, “game-changing”, “in today’s landscape”, or similar phrases unless quoted, mocked, or genuinely required.
- No “not just X, but Y” structure unless it is intentionally preserved.
- No abstract value claim is left unsupported by concrete detail.
- Sentence rhythm is not uniformly smooth.
- The rewrite still sounds like the same writer, unless the user asked for a new voice.
- The text still tells the reader what to do next, when action is needed.
- The attitude does not obscure the message.

## Error handling
### Error: no text provided
Ask for the text, file, or page to review.

### Error: audience/context unclear
Make the smallest useful edit and state the assumption. Ask only if the rewrite would change drastically based on context.

### Error: requested voice conflicts with venue
Explain the tradeoff briefly. Example: “I can make this drier, but for a customer apology I’d keep the jokes out.”

### Error: a high-risk phrase is actually precise
Keep it. This is not a blind blacklist. Explain only if useful.

### Error: user wants “humanized” text to evade detection
Do not frame the work as evasion. Offer to improve clarity, specificity, rhythm, and voice.

## Output contract
When reviewing text, return:
- the main issues
- specific phrases to cut or rewrite
- replacement copy
- any remaining risks, e.g. too cute, too vague, too negative, too formal

When editing files, return:
- changed file paths
- a short before/after summary
- validation performed

## Examples
### Example 1: product fog
User says: “Make this less AI: Unlock seamless collaboration for modern developer teams.”

Expected behaviour:
1. Identify “unlock”, “seamless”, “modern”, and generic audience fog.
2. Ask what the product actually does if needed.
3. Rewrite concretely.

Possible rewrite:
> Keep review comments, terminal state, and project sessions in one place. Less tab archaeology.

### Example 2: email polish
User says: “Make this email sound less ChatGPT.”

Input:
> I hope this email finds you well. I wanted to reach out to discuss the possibility of collaborating on an exciting opportunity.

Possible rewrite:
> Hey Sam — I’ve got an idea for a small collaboration. Worth a quick look?

### Example 3: social post
User says: “This post feels LinkedIn.”

Bad:
> In today’s rapidly evolving AI landscape, adaptability is no longer optional.

Better:
> The weird part of AI work is how fast yesterday’s clever trick becomes plumbing.

### Example 4: too much sass
User says: “Make this sassy but not annoying.”

Bad:
> Your IDE could never. Ship code like a caffeinated raccoon.

Better:
> Not an IDE. Not a dashboard. A shell for the parts of agent work that keep getting lost.

### Example 5: personal bio
User says: “Make this bio less generic.”

Bad:
> Passionate technologist building innovative solutions at the intersection of design and engineering.

Better:
> I build small, opinionated tools for people who would rather ship than babysit dashboards.

## Supporting files
- `references/trope-checklist.md`: common AI/corporate copy tells, safer rewrite moves, and source notes.
