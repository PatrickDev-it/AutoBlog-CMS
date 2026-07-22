# Guided demo

1. Open `/sign-in` and enter as **Author**. These are seeded database identities with normal
   HTTP-only sessions; no authentication bypass is used.
2. Select the first seeded draft, edit it and observe the saving/saved state. Reload to prove
   persistence; open history to compare and restore an old revision as a new one.
3. Submit for review. Sign out, enter as **Reviewer**, select the post and approve or request changes.
4. Enter as **Editor**, publish or schedule the approved immutable revision. Open the public preview.
5. Generate an AI suggestion in visibly labeled mock mode. Confirm the post remains unchanged until
   **Apply suggestion**; the accepted result then follows ordinary autosave/version rules.
6. Upload a PNG/JPEG/WebP cover. Replacement activates the verified object before cleanup of the old
   one. Editor can delete it.
7. Enter as **Owner** and use **Reset demo data**, then **Confirm reset**. Only `ws-demo` is rebuilt;
   user sessions and any configured workspace remain intact.

The checklist in the workspace derives completion from persisted version/state/publication data.
Reset is Owner-only, origin-checked, limited to three distinct operations per hour and durable across
restart. Repeating the same idempotency key returns the original result without another reset.
