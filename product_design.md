# General Product Design principles

- Don't verify with browsers or computer use unless the user explicitly agrees or requests it.
- When browser verify is requested by user, always use the AgentBrowser skill, it is agentic browser that works and gives you full control, you can find it and read it from `~/skills/skills/creative/visual/agent-browser/SKILL.md`

## Establish a strong hierarchy

- Lead each page with one unmistakable idea. Use a small technical eyebrow, an oversized display statement, and a concise supporting explanation.
- Let headings behave like editorial composition rather than ordinary UI labels. Deliberate line breaks, tight leading, and strong contrast should create rhythm without sacrificing comprehension.
- Keep supporting copy quieter and narrower than the headline. The eye should encounter promise, explanation, evidence, then action in that order.
- Give protocol results and identity values their own hierarchy. Labels, values, explanations, metadata, and actions must not compete at the same visual weight.
- Use generous vertical space between major ideas and compact spacing inside one data relationship.

```html
<div class="section-heading">
  <h2>ASK FOR LESS.<br />REVEAL LESS.</h2>
  <p>Identity works without turning profile data into a permanent key.</p>
</div>
```

The heading carries the argument. The paragraph clarifies it; it does not repeat it.

## Use typography as structure

- Use the display face for promises, outcomes, section titles, and decisive status. Use the monospaced face for protocol language, controls, metadata, claims, and explanatory copy.
- Favor bold, tightly tracked display type and calm, highly legible monospaced text.
- Keep tiny uppercase labels purposeful. They should identify a category or state, never carry essential long-form information.
- Preserve readable body sizes. Small technical labels may be compact, but claim values and user-facing explanations must remain comfortably legible.
- Wrap identifiers and URLs safely without shrinking them into insignificance.
- Balance headings and pretty-wrap prose, but use explicit line breaks when the composition depends on a specific phrase boundary.

## Treat color as a signal

- Build from a near-black field, warm white text, restrained gray surfaces, and thin neutral rules.
- Reserve coral-orange for identity signals, verified states, selected controls, important values, and primary actions.
- Use secondary blue for keyboard focus and danger red only for destructive or failed states.
- Do not distribute accent color decoratively. A colored element must communicate state, priority, or identity.
- Keep contrast high and verify that muted text remains readable. Never rely on color alone to convey meaning.
- Avoid gradients, glass effects, soft shadows, and decorative glow. Depth comes from hierarchy, spacing, borders, and contrast.

## Expose the underlying system

- Present identity and protocol information as ledgers, manifests, tickets, and ordered flows rather than generic cards.
- Use hairline borders to reveal page structure. Borders should connect related regions and make the information architecture visible.
- Prefer square or nearly square corners. Components should feel engineered and direct, not soft or ornamental.
- Let real protocol vocabulary appear where it helps understanding: `pairwise_sub`, `account_sub`, `provider_sub`, PKCE, JWKS, issuer, and expiry.
- Pair technical names with plain explanations. Precision should make the product more understandable, not more exclusive.
- Show security and privacy properties as concrete data behavior, not as trust badges or vague claims.

```html
<dl class="claim-ledger">
  <div>
    <dt>pairwise_sub</dt>
    <dd>pws_9c0e...</dd>
    <p>Stable inside one app. Different client, different identifier.</p>
  </div>
</dl>
```

The label names the contract, the value demonstrates its shape, and the description explains its consequence.

## Write with confidence and restraint

- Use short declarative sentences and active verbs.
- Make the primary message memorable, then make the supporting copy exact.
- Avoid inflated marketing language, cute metaphors, and generic claims such as "seamless," "powerful," or "next-generation."
- Prefer concrete promises: what is shared, what is withheld, what changes per client, and what gets verified.
- Keep button labels decisive and specific: `APPROVE CONNECTION`, `RUN ANOTHER FLOW`, `SIGN OUT`.
- Use punctuation and capitalization consistently. Uppercase is a visual device for short labels and actions, not for paragraphs.

## Compose pages, do not assemble templates

- Give each major page a distinct composition suited to its job while preserving the same typography, palette, rules, and interaction language.
- Use asymmetry when it strengthens hierarchy: a large statement beside compact evidence, or a protocol example beside an ordered explanation.
- Avoid interchangeable dashboard grids, floating card collections, pill-heavy navigation, and repeated centered sections.
- Keep the number of visual primitives small. Recombine headings, ledgers, rules, status marks, code windows, and decisive buttons instead of inventing a new component for every section.
- Make whitespace carry structure. Empty space should separate arguments and create tension, not merely pad containers.
- Keep decoration subordinate to information. Every visible shape should frame content, indicate state, or guide reading.

## Make interaction states explicit

- Every asynchronous surface needs clear idle, working, success, failure, and recovery states.
- Disable controls only when the action is genuinely unavailable, and explain why nearby.
- Keep consent factual. List exactly what the client requests; do not present mandatory claims as optional controls.
- Separate verified claims from token metadata and follow-up actions so users can understand what was shared.
- Preserve keyboard focus, minimum touch targets, semantic elements, labels, live regions, and reduced-motion behavior.
- Motion should confirm a transition or active check. Keep it brief, restrained, and removable through reduced-motion preferences.

## Recompose for narrow screens

- Preserve hierarchy rather than scaling the desktop page down uniformly.
- Collapse multi-column ledgers into readable label-value-explanation sequences.
- Reduce headline sizes enough to preserve intentional line breaks and prevent isolated words.
- Stack actions and page regions when needed, while retaining clear borders and spacing between phases.
- Keep identifiers, code, and URLs wrap-safe at every width.
- Test the actual composition at mobile and desktop sizes; responsive correctness includes visual rhythm, not only the absence of overflow.

## Preserve the visual system

- Extend existing tokens and primitives before introducing new ones.
- Reuse the established black, white, gray, coral, blue, and red roles consistently.
- Review neighboring sections before changing a component. A local improvement must still belong to the whole page.
- Do not copy a fashionable layout or default component-library pattern into Triad. Derive the design from the page's message and data.
- Treat screenshots as evidence of hierarchy and composition problems, not merely pixel differences.
- When a design feels weak, strengthen the idea, contrast, grouping, or wording before adding decoration.
