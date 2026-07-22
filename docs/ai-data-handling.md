# AI data handling and governance

## Contract

AI is an authenticated suggestion command, not an editorial mutation. Input is capped at 180 title,
320 excerpt, 20,000 content and 500 instruction characters. Output is parsed through the same bounded
schema for mock and Gemini modes. The UI renders a preview and creates a revision only after the user
selects **Apply suggestion**.

The deterministic mock adapter is labeled `Mock / demo`, makes no network call and reports no token
counts. Configured mode uses `@google/genai`, structured JSON, 2,048 maximum output tokens, low
temperature and an eight-second abort signal. The official SDK notes that client abort does not
guarantee provider cancellation and applicable work may still be charged:
[GenerateContentConfig](https://googleapis.github.io/js-genai/release_docs/interfaces/types.GenerateContentConfig.html).

## Limits and retained data

- Five requests per authenticated user/workspace per minute, persisted in the database.
- Monthly workspace character budget configured by `AI_MONTHLY_CHARACTER_QUOTA`.
- The worst-case request/output budget is reserved transactionally before provider invocation and
  released on any failure; concurrent calls cannot oversubscribe the workspace.
- Success stores mode, provider, model, latency, input/output character counts and only token counts
  returned by the provider. No token count or cost is estimated.
- Prompt, draft body, suggestion body, API key, raw provider response and error details are not stored
  in usage or audit records.

Gemini receives the bounded draft and instruction when and only when `AI_MODE=gemini`; configured mode
therefore requires the operator to accept Google's data-processing terms. Demo/CI remain mock mode.

## Failure behavior

Timeout, cancellation, malformed JSON, schema violations and provider errors map to
`PROVIDER_UNAVAILABLE` with a correlation ID. Quota and rate failures occur before adapter access.
Secrets and provider messages are diagnostic-only and never enter public envelopes.
