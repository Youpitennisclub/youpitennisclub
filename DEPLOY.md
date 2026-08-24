# Héberger youpitennisclub.club gratuitement (hors Lovable)

Le site est une app **TanStack Start** (React + SSR + server functions) qui se build
pour **Cloudflare Workers**. Il tourne donc parfaitement sur **Cloudflare Workers /
Pages** avec l'offre gratuite, et ton domaine est déjà chez Cloudflare.

---

## 1. Exporter le code vers GitHub

Dans Lovable : bouton **GitHub** (en haut à droite) → *Connect to GitHub* → créer le repo
(ex. `youpitennisclub`). Tout le code est poussé et resynchronisé automatiquement.

## 2. Backend : base de données + mails

Deux briques externes sont nécessaires :

| Brique | Aujourd'hui | Après export |
| --- | --- | --- |
| Base réservations / feedback | Lovable Cloud (Supabase géré) | ton propre projet Supabase gratuit |
| Envoi des mails | Resend (ton compte) | inchangé, ton compte Resend |

Resend est déjà à toi : rien à refaire (domaine `youpitennisclub.com` vérifié).

### Créer ton propre projet Supabase (gratuit)

1. supabase.com → *New project* (région Frankfurt).
2. SQL Editor → colle et exécute le script `supabase/migrations/*.sql` du repo
   (dans l'ordre des noms de fichiers). Cela recrée : type `tennis_level`, tables
   `bookings` et `feedback`, RLS + policies, fonctions
   `get_public_bookings`, `get_public_feedback`, `submit_feedback`,
   `enforce_booking_capacity` + son trigger.
3. Si tu veux conserver les réservations existantes, je peux t'exporter les lignes
   actuelles en `INSERT` SQL — demande-le-moi.
4. Récupère dans *Project Settings → API* :
   - Project URL
   - clé publishable (anon)

## 3. Variables d'environnement à reporter

À définir dans Cloudflare (Workers → Settings → Variables, et *Secret* pour la clé Resend) :

```
VITE_SUPABASE_URL=https://<ton-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<clé anon>
VITE_SUPABASE_PROJECT_ID=<ton-ref>

SUPABASE_URL=https://<ton-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<clé anon>
SUPABASE_PROJECT_ID=<ton-ref>

RESEND_API_KEY=re_...            # secret
EMAIL_FROM=Youpi Tennis Club <bookings@youpitennisclub.com>
SITE_URL=https://youpitennisclub.club
```

`SITE_URL` sert à construire les liens magiques d'annulation : il doit correspondre
exactement au domaine public, sinon les liens d'annulation pointent au mauvais endroit.

## 4. Déployer sur Cloudflare

1. dash.cloudflare.com → **Workers & Pages** → *Create* → *Pages* → *Connect to Git* →
   choisis le repo GitHub.
2. Réglages de build :
   - Framework preset : *None*
   - Build command : `npm install && npm run build`
   - Build output directory : `dist`
3. Ajoute les variables ci-dessus **avant** le premier build (les `VITE_*` sont
   injectées au moment du build : tout changement nécessite un redeploy).
4. Déploie. Tu obtiens une URL `*.pages.dev` pour tester.

> Le build utilise Nitro avec la cible Cloudflare (déjà configuré dans `vite.config.ts`),
> donc le SSR et les server functions (mails, réservations) fonctionnent nativement.
> Si Pages refuse la sortie SSR, utilise **Workers → Import a repository** avec la même
> commande de build : c'est la cible native.

## 5. Brancher le domaine

Dans le projet Cloudflare Pages/Workers → **Custom domains** → *Set up a domain* →
`youpitennisclub.club`, puis ajoute aussi `www.youpitennisclub.club`.
Comme le domaine est déjà dans ton compte Cloudflare, les DNS et le certificat SSL se
configurent automatiquement en quelques minutes. **Supprime les anciens enregistrements A
pointant vers Lovable (185.158.133.1)** s'il y en a.

## 6. Ce qui change côté Lovable

- Tu peux repasser en plan gratuit : le projet reste éditable dans Lovable et le code
  continue d'être poussé sur GitHub, donc chaque modif redéploie sur Cloudflare.
- L'URL `youpitennisclub.lovable.app` peut cesser d'être servie : ton domaine ne dépend
  plus d'elle.
- Une fois passé sur ton propre Supabase, les données ne dépendent plus de Lovable Cloud.

## Coûts

| Élément | Coût |
| --- | --- |
| Domaine `.club` chez Cloudflare | ~10 €/an (déjà payé) |
| Cloudflare Pages/Workers | gratuit (100 000 requêtes/jour) |
| Supabase | gratuit (500 Mo, projet mis en pause après 1 semaine d'inactivité) |
| Resend | gratuit (3 000 mails/mois) |
| Lovable | gratuit (édition uniquement) |
