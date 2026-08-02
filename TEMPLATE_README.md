# Deploy and Host the HonorBox Webhook Relay on Railway

The HonorBox Webhook Relay turns successful Stripe Checkout events into immediate GitHub `repository_dispatch` events for an HonorBox private operations repository. It is the optional low-latency companion to HonorBox's default scheduled fulfillment poll.

## About Hosting the HonorBox Webhook Relay

The relay verifies Stripe's webhook signature with a five-minute replay window before contacting GitHub. It rejects request bodies over 1 MiB with HTTP `413`. It forwards no buyer identity, email, amount, or raw Checkout Session ID. GitHub receives only the event type, mode, creation timestamp, and a short hash reference. If GitHub refuses the dispatch, the relay returns `502` so Stripe retries automatically.

This template deploys the relay only. Your storefront and fulfillment workflow remain in GitHub, exactly as HonorBox's architecture requires. Keep the scheduled poll enabled as a safety net.

## Common Use Cases

- Deliver private GitHub repository products within seconds of Stripe payment
- Add signed webhook validation without operating a general-purpose server
- Preserve HonorBox's polling fallback while reducing normal delivery latency

## Dependencies for HonorBox Webhook Relay Hosting

- An HonorBox private ops repository with `fulfill-on-sale.yml`
- A Stripe webhook endpoint signing secret
- A fine-grained GitHub token restricted to the ops repository
- Stripe events `checkout.session.completed` and `checkout.session.async_payment_succeeded`

### Deployment Dependencies

- [HonorBox](https://github.com/Honorboxx/honorbox)
- [Webhook mode documentation](https://github.com/Honorboxx/honorbox/tree/v0.6.0/webhook-mode)
- [MIT License](https://github.com/Honorboxx/honorbox/blob/v0.6.0/LICENSE)

### Why Deploy the HonorBox Webhook Relay on Railway?

Railway supplies HTTPS, secret variables, health checks, logs, and automatic restarts for the small dependency-free Node relay. No database or persistent volume is required.
