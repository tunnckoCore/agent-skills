# Hermes Discord Admin Tool Extension Pattern

This reference captures a concrete pattern for extending Hermes' Discord admin surface when the bot has Discord permissions but Hermes lacks a callable action.

## Context

A Discord user asked Hermes to make a server private and rename it. The bot had full/admin Discord permissions, but the running Hermes Discord tool only exposed a limited action set (guild/channel/role listing, pins, delete message, create thread, add/remove role). The correct fix was to extend the Hermes tool layer, not tell the user Discord permissions were insufficient.

## Files Touched

- `tools/discord_tool.py`
- `tests/tools/test_discord_tool.py`

## TDD Flow Used

1. Add tests for representative admin/mod actions:
   - `update_server` calls `PATCH /guilds/{guild_id}` with `{"name": ...}`.
   - `create_role` calls `POST /guilds/{guild_id}/roles`.
   - `create_channel` calls `POST /guilds/{guild_id}/channels`.
   - `edit_channel` calls `PATCH /channels/{channel_id}`.
   - `set_channel_private` issues two permission overwrites: deny `@everyone` and allow target role.
   - `list_invites` calls `GET /guilds/{guild_id}/invites`.
   - `delete_invite` calls `DELETE /invites/{invite_code}`.
   - `ban_member` calls `PUT /guilds/{guild_id}/bans/{user_id}`.
2. Run targeted pytest and verify failure from missing action/signature, not test typo.
3. Implement action functions and wire them through:
   - `_ACTIONS`
   - `_ACTION_MANIFEST`
   - `_REQUIRED_PARAMS`
   - `_build_schema` properties
   - `_run_discord_action` signature/forwarding
   - `_HANDLER_DEFAULTS`
4. Run the Discord tool suite.

## Verification Command

```bash
python -m pytest tests/tools/test_discord_tool.py -q
```

In the captured session, a temporary venv was needed only because the local environment lacked pytest. The durable lesson is the TDD/implementation pattern, not that pytest is globally missing.

## Important Implementation Details

- Use Discord API v10 paths already centralized in `tools/discord_tool.py`.
- Keep handler return values JSON strings.
- Include new actions in the manifest so the schema description stays accurate.
- Include new parameters in both schema and handler defaults; otherwise gateway calls drop them before reaching the handler.
- Required-param validation depends on `local_vars`; add nonstandard required params such as `overwrite_id` and `invite_code` there.
- `VIEW_CHANNEL` is bit `1 << 10`, decimal string `1024`.
- For making a channel private:
  - PUT `/channels/{channel_id}/permissions/{guild_id}` with `{"type": 0, "allow": "0", "deny": "1024"}` to deny `@everyone`.
  - PUT `/channels/{channel_id}/permissions/{role_id}` with `{"type": 0, "allow": "1024", "deny": "0"}` to allow a role.
  - User-specific allow uses `type: 1`.
- In Discord, the `@everyone` role ID is the guild ID.

## Operational Follow-up

After changing Hermes tool code/config, restart the gateway from outside the gateway process:

```bash
hermes gateway restart
```

Running that command from inside a Discord gateway session is blocked to prevent restart loops.
