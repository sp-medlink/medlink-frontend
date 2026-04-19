# `(static)` route group

Static, content-first pages: terms of service, privacy policy, about, contact,
changelog, etc. Prefer server components rendering Markdown/MDX so these pages
stay cheap to ship and easy to review.

Keep dynamic behavior out of this group — if a page needs React Query,
WebSockets, or session state, it belongs elsewhere.
