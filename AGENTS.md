# Project architecture decisions

- Shared public navigation and footer live in `SiteChrome` so all public content pages stay consistent.
- Membership, tournaments, and past events use separate routes because they are secondary shareable content and must not overload the winter homepage.
