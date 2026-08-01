## 1. Hero photo & yellow decorations

- Replace the poster image with the newly uploaded court photo (registered as a CDN asset, imported in `src/routes/index.tsx`). Also used for the social-share preview image.
- Remove the yellow frame/shadow around the photo, the two floating yellow/pink bubbles next to it, and the yellow squiggle line under "borders".

## 2. Homepage content edits

- **Club section:** delete the whole black CTA block ("You want to play unlimited… Contact me for more information").
- **How it works:** remove the line "Simple rules so everyone gets a fair, focused session on court." Change the block background from yellow to red/clay, and make the 4 rules much more prominent (bigger type, each rule in its own clear card).
- **Coach section:** remove the badge pills (DTB Tennisassistent, 5+ years coaching, Meisterklasse, WTA 500, ALBA, EN·FR·DE).
- **Manifesto (No place in a club?):** remove all the yellow `#hashtag` pills, and add a new paragraph:
  "Want to train with your partner or with your friends? I can build a group for you — and I really take care of grouping players by level so everyone enjoys it. Something most coaches don't do." plus a large, bold statement: **Client satisfaction is what matters most to me.**

## 3. Colors

- Every "Book your lesson / Book your tennis session" button across the site becomes the same violet (new `--violet` design token in `src/styles.css`).
- The last sections of the page (Winter season + final Book CTA) switch from dark-green/yellow to **sky blue + dark blue** (new `--sky` and `--navy` tokens).

## 4. Social tennis — two new cards

- **Singles vs. Couples tournament:** singles players team up against couples in a friendly, fun tournament.
- **Summer Camp:** 2 coaches, 2 groups of max 6 players, 12.08–17.08, 2h per day, **€100 for 3 sessions of 2h**.

## 5. Booking calendar (`src/routes/book.tsx`)

- Add **Summer Camp** slots on **12.08, 14.08 and 17.08, 18:00–20:00**, displayed in red and clearly labelled.
- Label every regular slot with its level, varied across the week, e.g.:
  - Mon 17:00 Beginner · 18:00 Intermediate · 19:30 Advanced
  - Tue 17:00 Intermediate · 18:00 Advanced · 19:30 Beginner
  - Wed 17:00 Advanced · 18:00 Beginner · 19:30 Intermediate
  - Thu / Fri: further rotations
  - Sat 10:00 Beginner · 11:30 Intermediate · 13:00 Advanced · 14:30 Beginner
- The level shown for the selected slot pre-fills the level in the booking form.

## 6. Security fixes

The scan found 3 warnings, all around the database:

- `get_public_bookings` and the capacity trigger function are `SECURITY DEFINER` and executable by anyone. Fix: revoke `EXECUTE` from `anon`/`authenticated` on the trigger function (it only needs to run as a trigger), and keep `get_public_bookings` public but restrict it so it can only return the already-anonymised fields (first name + 2 initials), which it does today.
- `bookings` has an INSERT policy but no SELECT policy, so nobody can read customer emails/phones through the API. Confirm and lock this in explicitly (no public SELECT policy added), and add a rate-limit-friendly length/format validation on insert.
- Security memory updated so future scans know the anonymised RPC is intentional.

## Technical notes

- New color tokens added to `src/styles.css` (`--violet`, `--sky`, `--navy`) and mapped in `@theme inline`; no hard-coded hex in components.
- Migration applied for the function grants; no schema change to `bookings` columns.
