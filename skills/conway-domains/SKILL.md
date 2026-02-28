---
name: conway-domains
description: "Search, register, and manage domain names via Conway Domains — check availability, register with x402 crypto payments, configure DNS records, and manage WHOIS privacy using the Conway MCP server tools."
---

# Conway Domains Skill

You have access to Conway Domains via MCP tools prefixed with `mcp__conway__`. Use them to search for domains, register them with x402 cryptocurrency payments, manage DNS records, and configure domain settings.

## Core Concepts

- **x402 payment**: Domains are purchased using USDC cryptocurrency via the HTTP 402 payment protocol. The MCP tools handle payment automatically from your wallet.
- **Wallet**: An x402 wallet on Base (EVM) that holds USDC for domain purchases. Check balance with `wallet_info`.
- **Domain tools**: `domain_*` tools interact with the Conway Domains registrar API.
- **DNS tools**: `domain_dns_*` tools manage DNS records for your registered domains.

## Workflows

### Search for Domains

Use `domain_search` to find available domains by keyword:

```
domain_search(query="myproject", tlds="com,io,ai,dev")
```

Returns availability status and pricing (registration + renewal) for each TLD.

For exact domain checks, use `domain_check`:

```
domain_check(domains="myproject.com,myproject.io,myproject.ai")
```

### Check Pricing

Get pricing for specific TLDs before purchasing:

```
domain_pricing(tlds="com,io,ai,xyz,dev")
```

Returns registration, renewal, and transfer costs per TLD.

### Register a Domain

1. **Check wallet balance**: `wallet_info()` — ensure you have enough USDC on Base.
2. **Search availability**: `domain_search(query="mydomain")` or `domain_check(domains="mydomain.com")`.
3. **Register**: `domain_register(domain="mydomain.com", years=1, privacy=true)`.

The `domain_register` tool handles x402 payment automatically. WHOIS privacy is enabled by default.

```
wallet_info()  # Check balance first
domain_search(query="coolproject")  # Find available options
domain_register(domain="coolproject.dev", years=1, privacy=true)  # Register
```

### Renew a Domain

```
domain_renew(domain="mydomain.com", years=1)
```

Payment is handled automatically via x402. Check your wallet balance first if unsure.

### Manage DNS Records

**List records**:
```
domain_dns_list(domain="mydomain.com")
```

**Add a record**:
```
domain_dns_add(domain="mydomain.com", type="A", host="@", value="1.2.3.4", ttl=3600)
domain_dns_add(domain="mydomain.com", type="CNAME", host="www", value="mydomain.com", ttl=3600)
domain_dns_add(domain="mydomain.com", type="MX", host="@", value="mail.example.com", ttl=3600, distance=10)
domain_dns_add(domain="mydomain.com", type="TXT", host="@", value="v=spf1 include:_spf.google.com ~all")
```

Supported record types: A, AAAA, CNAME, MX, TXT, SRV, CAA, NS.

**Update a record** (use record_id from `domain_dns_list`):
```
domain_dns_update(domain="mydomain.com", record_id="abc123", value="5.6.7.8")
```

**Delete a record**:
```
domain_dns_delete(domain="mydomain.com", record_id="abc123")
```

### Configure Domain Settings

**WHOIS privacy**:
```
domain_privacy(domain="mydomain.com", enabled=true)
```

**Custom nameservers**:
```
domain_nameservers(domain="mydomain.com", nameservers=["ns1.example.com", "ns2.example.com"])
```

### Point a Domain to a Conway Cloud Sandbox

Common pattern — register a domain and point it to a running sandbox:

1. Register: `domain_register(domain="myapp.dev")`
2. Get sandbox URL: use `sandbox_get_url` or `sandbox_expose_port` to get the sandbox's public URL.
3. Add DNS: `domain_dns_add(domain="myapp.dev", type="CNAME", host="@", value="{sandbox-url}")`

### List & Inspect Your Domains

```
domain_list()  # List all your registered domains
domain_info(domain="mydomain.com")  # Get details: status, expiry, nameservers, privacy
```

### Wallet & Payments

- **Check balance**: `wallet_info(network="eip155:8453")` — wallet address and USDC balance on Base.
- **Supported networks**: `wallet_networks()` — list all supported payment networks.
- **Discover endpoints**: `x402_discover(url="https://conway.domains")` — find available x402 API endpoints.
- **Check payment requirements**: `x402_check(url="https://api.conway.domains/domains/register")` — see cost before paying.
- **Manual fetch**: `x402_fetch(url, method, headers, body)` — call any x402-protected endpoint with auto-payment.

## MCP Tools Reference

| Tool | Description |
|------|-------------|
| `domain_search` | Search available domains by keyword (query, tlds) |
| `domain_check` | Check availability of exact domain names (domains) |
| `domain_pricing` | Get TLD pricing (tlds) |
| `domain_list` | List all your registered domains |
| `domain_info` | Get domain details (domain) |
| `domain_register` | Register a domain with x402 payment (domain, years, privacy) |
| `domain_renew` | Renew a domain with x402 payment (domain, years) |
| `domain_privacy` | Toggle WHOIS privacy (domain, enabled) |
| `domain_nameservers` | Update nameservers (domain, nameservers) |
| `domain_dns_list` | List DNS records (domain) |
| `domain_dns_add` | Add DNS record (domain, type, host, value, ttl, distance) |
| `domain_dns_update` | Update DNS record (domain, record_id, host, value, ttl) |
| `domain_dns_delete` | Delete DNS record (domain, record_id) |
| `wallet_info` | Get wallet address and USDC balance (network) |
| `wallet_networks` | List supported payment networks |
| `x402_discover` | Discover x402 endpoints for a URL |
| `x402_check` | Check if URL requires x402 payment |
| `x402_fetch` | Fetch URL with automatic x402 payment |

## Troubleshooting

### Registration fails — insufficient funds
1. Check balance: `wallet_info()`.
2. Check domain price: `domain_pricing(tlds="com")` or `domain_check(domains="example.com")`.
3. Deposit USDC to your wallet address on Base network. The wallet address is shown in `wallet_info()` output.

### Domain not resolving after DNS change
- DNS propagation takes time (minutes to hours depending on TTL).
- Verify records are set: `domain_dns_list(domain="mydomain.com")`.
- Check the TTL value — lower TTL means faster propagation.
- Ensure nameservers are correct: `domain_info(domain="mydomain.com")`.

### x402 payment errors
1. Ensure wallet has USDC on Base (network `eip155:8453`): `wallet_info()`.
2. Check if the endpoint requires payment: `x402_check(url="...")`.
3. Try `x402_fetch` directly for manual control over the request.

### Domain shows as unavailable
- The domain is already registered by someone else.
- Try alternative TLDs: `domain_search(query="myname", tlds="com,io,ai,dev,xyz,net,org")`.
- Check if it's a premium domain (higher price) vs truly unavailable.
