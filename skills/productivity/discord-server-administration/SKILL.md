---
name: discord-server-administration
description: "Manage Discord servers through Hermes: privacy, roles, channels, invites, moderation, and extending Hermes Discord admin tools when the action surface is missing."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos]
metadata:
  hermes:
    tags: [discord, server-admin, moderation, gateway, hermes]
    related_skills: [hermes-agent, test-driven-development]
---

# Discord Server Administration

## When to Use

Load this skill when the user asks Hermes to configure or manage a Discord server, especially:

- Make a server or channel private / members-only.
- Rename a server, category, channel, or role.
- Create, edit, delete, or assign roles.
- Create, edit, delete, or privatize channels/categories.
- Revoke invites or audit active invite links.
- Kick, ban, or unban members.
- Troubleshoot why the bot has Discord permissions but Hermes cannot perform an admin action.
- Extend Hermes' Discord admin tool surface for common admin/moderation operations.

The user dislikes configuring Discord servers manually. If the bot has permissions and Hermes is missing a general admin action, prefer closing the tool gap instead of giving only manual Discord UI instructions.

## Fast Path: Existing Hermes Discord Admin Tool

1. Confirm the current session exposes `discord_admin` actions. If the tool is available, use it directly.
2. If the action needs IDs, discover first:
   - `list_guilds` → guild/server IDs.
   - `list_channels(guild_id)` → channel/category IDs.
   - `list_roles(guild_id)` → role IDs.
   - `search_members(guild_id, query)` or `member_info` → member IDs.
3. For privacy changes, be explicit about the access model:
   - Deny `@everyone` `VIEW_CHANNEL` on the target channel/category.
   - Allow the member role/user(s) that should retain access.
   - Avoid locking out the bot: ensure its role keeps `VIEW_CHANNEL` and relevant management permissions.
4. For destructive moderation or deletion actions, confirm scope unless the user has clearly specified it.

## If Bot Has Admin but Hermes Says It Cannot

Do not assume Discord permissions are the problem. There are two layers:

1. Discord permission layer — the bot role may have Administrator or specific guild/channel permissions.
2. Hermes tool layer — the running session must expose callable actions for the desired Discord API operation.

If the user says the bot has admin permissions but Hermes lacks an action:

1. Inspect the Hermes Discord tool implementation, usually `tools/discord_tool.py`.
2. Check the current `_ACTIONS`, `_ACTION_MANIFEST`, `_REQUIRED_PARAMS`, schema properties, handler defaults, and `_run_discord_action` signature.
3. If the requested operation is a general admin/mod task, add it rather than stopping at a manual workaround.
4. Use strict TDD:
   - Add tests in `tests/tools/test_discord_tool.py` for the API method/path/body and response shape.
   - Run targeted tests and watch them fail for the expected missing-action reason.
   - Implement the action and schema plumbing.
   - Run the full Discord tool test file.
5. Restart the gateway from outside the gateway process so new tool schemas are loaded.

## Common Discord REST Actions Worth Supporting

These are broad admin/mod operations, not the entire Discord API:

- Server/guild: `PATCH /guilds/{guild_id}` for server rename/common settings.
- Channels:
  - `POST /guilds/{guild_id}/channels`
  - `PATCH /channels/{channel_id}`
  - `DELETE /channels/{channel_id}`
  - `PUT /channels/{channel_id}/permissions/{overwrite_id}`
- Privacy shortcut:
  - Deny `@everyone` `VIEW_CHANNEL` (`1 << 10`, decimal string `1024`).
  - Allow the target role/user `VIEW_CHANNEL`.
- Roles:
  - `POST /guilds/{guild_id}/roles`
  - `PATCH /guilds/{guild_id}/roles/{role_id}`
  - `DELETE /guilds/{guild_id}/roles/{role_id}`
  - Add/remove role from member via member role endpoints.
- Invites:
  - `GET /guilds/{guild_id}/invites`
  - `DELETE /invites/{invite_code}`
- Moderation:
  - Kick: `DELETE /guilds/{guild_id}/members/{user_id}`
  - Ban: `PUT /guilds/{guild_id}/bans/{user_id}`
  - Unban: `DELETE /guilds/{guild_id}/bans/{user_id}`

See `references/hermes-discord-admin-actions.md` for a concrete implementation pattern from a prior Hermes extension session.

## Config: Responding Without Mentions

For Discord gateway sessions, Hermes may require a mention in normal channels. To let Hermes respond without a mention everywhere:

```bash
hermes config set discord.require_mention false
hermes gateway restart
```

If only some channels should be free-response, prefer configuring `discord.free_response_channels` rather than disabling mentions globally.

Gateway restart cannot be run from inside the gateway process; it is intentionally blocked to avoid restart loops. Ask the user to run `hermes gateway restart` from an external shell, or use an external supervisor if available.

## Pitfalls

- Bot Administrator permission does not automatically mean Hermes has the needed callable tool action.
- Tool schema changes require a new gateway session/restart before Discord chat can use the new action.
- Avoid one-off narrow tools. Add class-level admin/mod actions with schema docs, required params, tests, and 403 guidance.
- `@everyone` role ID equals the guild ID for channel overwrites.
- Channel permission overwrite `type`: `0` for role, `1` for member.
- Discord permission bitfields are serialized as decimal strings in REST bodies for overwrites/role permissions.
- Do not claim a server was changed unless the tool call actually returned success from Discord.
