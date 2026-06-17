# Changelog

## 0.1.7

### Changes

- [#42](https://github.com/IgorWarzocha/howaboua-pi-stuff/pull/42) [`f380d72`](https://github.com/IgorWarzocha/howaboua-pi-stuff/commit/f380d721c2fbd9956d730cae456aa7f38e4f0546) Thanks [@IgorWarzocha](https://github.com/IgorWarzocha)! - Bumps Pi package peer and runtime dependencies to 0.79.0.

  Updates `@howaboua/pi-subagent-review` review messages so isolated findings are triaged as advisory input, not treated as automatic implementation work.

## 0.1.6

### Changes

- [#24](https://github.com/IgorWarzocha/howaboua-pi-stuff/pull/24) [`008e017`](https://github.com/IgorWarzocha/howaboua-pi-stuff/commit/008e01742bad5d743d23f6f445d8defb04610ee3) Thanks [@IgorWarzocha](https://github.com/IgorWarzocha)! - Restore reasoning to the current agent turn's starting level instead of reusing the first level captured after extension load.

## 0.1.6

- Restored reasoning to the session's starting level instead of always resetting to `low`.
- Preserved agent-selected reasoning across retryable provider and transport failures.
- Added GitHub Sponsor button config.

## 0.1.1-0.1.5

- Initial package releases for the `change_reasoning` Pi tool.
- Refined reasoning-level prompt guidance and package metadata.
- Migrated Pi package imports to Earendil Works packages.
