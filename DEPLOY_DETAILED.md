# Guide détaillé — héberger youpitennisclub.club gratuitement, en comprenant tout

Ce document est la version « longue et expliquée » de `DEPLOY.md`.
Public visé : quelqu'un à l'aise en informatique mais qui n'a jamais fait de
déploiement web moderne. Chaque étape explique **pourquoi** on la fait, **ce qui
se passe techniquement**, et **la commande exacte** à taper.

> Où trouver ces fichiers ? Ils sont à la **racine du projet**, à côté de
> `package.json`. Dans Lovable : bascule de *Preview* vers **Code** (sélecteur en
> haut de l'éditeur), puis regarde la liste des fichiers, tout en haut :
> `DEPLOY.md` et `DEPLOY_DETAILED.md`. Après export GitHub, ils sont aussi à la
> racine du repo, et GitHub les affiche en Markdown formaté.

---

## 0. Comprendre ce qu'est ce site (indispensable pour la suite)

Le site n'est **pas** un site statique (HTML + JS déposé sur un serveur). C'est
une application **TanStack Start** :

| Brique | Rôle | Où ça tourne |
| --- | --- | --- |
| React (front) | l'interface : pages, calendrier, formulaires | navigateur de l'élève |
| SSR (Server-Side Rendering) | rend le HTML de la première page côté serveur (bon pour le SEO et l'affichage rapide) | serveur |
| Server functions (`src/lib/*.functions.ts`) | logique privée : créer/annuler une réservation, envoyer les mails Resend | serveur |
| Base de données (Postgres/Supabase) | stocke `bookings` et `feedback` | service externe |
| Resend | envoie les mails (toi + l'élève) | service externe |

Conséquence directe : **il faut un hébergeur qui exécute du code serveur**, pas
seulement des fichiers. Les clés Resend ne doivent jamais partir dans le
navigateur, donc elles restent côté serveur. C'est pour ça qu'on choisit
**Cloudflare Workers** : le projet est déjà configuré pour cette cible (voir
`vite.config.ts`, qui utilise le preset Nitro *cloudflare*), et l'offre gratuite
suffit largement (100 000 requêtes/jour).

Vocabulaire utile :

- **Build** : transformer le code source en fichiers exécutables (`dist/`).
- **Nitro** : la couche qui emballe le serveur pour une cible donnée (Cloudflare,
  Node, Vercel…). Ici : Cloudflare Workers (runtime `workerd`, pas Node.js).
- **Variable d'environnement** : valeur injectée au moment du build ou de
  l'exécution, jamais écrite dans le code (`RESEND_API_KEY`, URL Supabase…).
- **`VITE_` préfixe** : convention Vite. Une variable préfixée `VITE_` est
  **incluse dans le bundle du navigateur** → uniquement pour du public
  (URL Supabase, clé *publishable*). Tout le reste reste serveur.

---

## 1. Exporter le code vers GitHub (et pourquoi)

**Pourquoi ?** Cloudflare ne sait pas lire le projet dans Lovable. Il a besoin
d'un dépôt Git : à chaque `git push`, il rebuild et redéploie automatiquement
(CI/CD). GitHub est aussi ta sauvegarde et ton historique.

**Comment ?** Dans Lovable, bouton **GitHub** en haut à droite → *Connect to
GitHub* → autoriser → *Create repository* (ex. `youpitennisclub`).
À partir de là, chaque modification faite dans Lovable est poussée
automatiquement sur la branche `main`.

**Vérifier en local** (optionnel mais recommandé, ça valide que le build passe
sur ta machine avant Cloudflare) :

```bash
git clone https://github.com/<ton-user>/youpitennisclub.git
cd youpitennisclub
npm install            # installe les dépendances listées dans package.json
npm run dev            # lance le serveur de dev sur http://localhost:8080
npm run build          # produit dist/ — c'est ce que Cloudflare exécutera
```

Ce que font ces commandes :

- `npm install` lit `package.json` + `package-lock.json` et remplit
  `node_modules/`. À faire une seule fois (ou après chaque changement de deps).
- `npm run dev` démarre Vite en mode développement : rechargement à chaud, code
  non optimisé, exécuté sous Node (donc plus permissif que Cloudflare).
- `npm run build` fait le vrai build de production : compile React, minifie,
  puis Nitro emballe le serveur pour Cloudflare dans `dist/`.
  **Si `npm run build` échoue, le déploiement échouera aussi** — c'est ton test
  de vérité.

Note : le projet est développé avec `bun` dans Lovable, mais `npm` fonctionne
aussi. Ne mélange pas : si tu utilises `npm`, garde `package-lock.json`, si tu
utilises `bun`, garde `bun.lockb`. Un seul lockfile, sinon builds imprévisibles.

---

## 2. Créer ta propre base de données Supabase (et pourquoi)

**Pourquoi ?** Aujourd'hui la base est fournie par *Lovable Cloud* (un projet
Supabase géré par Lovable). Si tu quittes l'abonnement, tu ne veux pas dépendre
de ce projet-là. Tu recrées donc un projet Supabase **à ton nom**, gratuit, et tu
y rejoues le schéma.

**Pourquoi une base du tout, alors que « c'est juste un formulaire » ?** Parce que
le calendrier doit savoir, en temps réel et pour tous les visiteurs, quels
créneaux sont pris, combien de places restent (max 6), quels prénoms afficher, et
quelle réservation annuler via un jeton. Un simple mail ne permet aucune de ces
lectures.

### 2.1 Créer le projet

1. [supabase.com](https://supabase.com) → *New project*.
2. Région : **Frankfurt (eu-central-1)** → latence minimale depuis Berlin et
   données hébergées en UE (RGPD).
3. Choisis un mot de passe Postgres fort et **note-le** (il ne se réaffiche pas).

### 2.2 Rejouer le schéma

Dans le repo, dossier `supabase/migrations/`, les fichiers sont nommés par
horodatage (`20250612093000_xxx.sql`). **L'ordre alphabétique = l'ordre
chronologique = l'ordre d'exécution obligatoire**, car une migration tardive
modifie ce qu'une plus ancienne a créé.

Méthode simple (interface web) : Supabase → **SQL Editor** → *New query* →
copie-colle le contenu du 1er fichier → *Run* → puis le 2e, etc.

Méthode CLI (reproductible, recommandée si tu es à l'aise) :

```bash
npm install -g supabase          # installe la CLI Supabase
supabase login                   # ouvre le navigateur pour l'authentification
supabase link --project-ref <ton-ref>   # <ton-ref> = l'identifiant du projet
supabase db push                 # applique toutes les migrations dans l'ordre
```

`<ton-ref>` est la partie variable de l'URL du projet :
`https://<ton-ref>.supabase.co`.

Ce que ces migrations recréent, et à quoi ça sert :

- type `tennis_level` (enum `beginner|intermediate|advanced`) : contraint le
  niveau à trois valeurs, impossible d'insérer n'importe quoi.
- table `bookings` : une ligne = une inscription (créneau, identité, téléphone,
  niveau, `cancel_token`, `cancelled_at`).
- table `feedback` : les avis élèves.
- **RLS (Row Level Security)** + policies : Postgres refuse par défaut toute
  lecture/écriture depuis le navigateur, sauf ce que les policies autorisent
  explicitement. C'est ce qui empêche un visiteur de lire les mails et
  téléphones de tous les élèves alors que la clé publique est, par nature,
  visible dans le navigateur.
- fonctions `get_public_bookings` / `get_public_feedback` : renvoient une vue
  **volontairement appauvrie** (prénom + 2 lettres du nom, pas de mail/tél) —
  c'est ce que le calendrier affiche.
- `submit_feedback` : insertion contrôlée d'un avis.
- `enforce_booking_capacity` + son trigger : refuse la 7e inscription sur un
  créneau, **au niveau base**. Un contrôle uniquement côté écran serait
  contournable et sujet aux réservations simultanées.

### 2.3 Récupérer les clés

Supabase → *Project Settings* → **API** :

- **Project URL** → `https://<ton-ref>.supabase.co`
- **clé publishable / anon** → clé **publique**, destinée au navigateur. Elle ne
  donne aucun droit par elle-même : tout passe par les RLS.
- la **service_role key** existe aussi : elle **contourne les RLS**. Elle ne doit
  jamais apparaître côté navigateur, ni dans une variable `VITE_*`, ni dans le
  repo.

### 2.4 Reprendre les réservations existantes (optionnel)

Les données actuelles sont dans la base Lovable Cloud, pas dans la nouvelle. Si
tu veux les conserver, demande-moi : je te génère un fichier d'`INSERT` SQL à
exécuter dans le SQL Editor de ton nouveau projet. Sinon, tu repars propre.

---

## 3. Les variables d'environnement, une par une

**Pourquoi ne pas les écrire dans le code ?** Parce que le code va sur GitHub. Une
clé API dans le repo est une clé compromise. Et parce que les valeurs changent
selon l'environnement (préproduction vs production) alors que le code reste le
même.

À définir dans Cloudflare : projet → **Settings → Variables and Secrets**.
« Variable » = valeur en clair, relisible. « Secret » = chiffré, non relisible
après enregistrement.

```
VITE_SUPABASE_URL=https://<ton-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<clé anon>
VITE_SUPABASE_PROJECT_ID=<ton-ref>

SUPABASE_URL=https://<ton-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<clé anon>
SUPABASE_PROJECT_ID=<ton-ref>

RESEND_API_KEY=re_...                                        # ← en Secret
EMAIL_FROM=Youpi Tennis Club <bookings@youpitennisclub.com>
SITE_URL=https://youpitennisclub.club
```

Détail du rôle de chacune :

- `VITE_SUPABASE_*` : lues **au moment du build** et écrites en dur dans le
  bundle navigateur. Conséquence importante : **modifier une `VITE_*` n'a aucun
  effet sans un nouveau déploiement**.
- `SUPABASE_*` (sans préfixe) : lues côté serveur, au moment de la requête. Le
  code (`src/integrations/supabase/client.ts`) essaie d'abord
  `import.meta.env.VITE_SUPABASE_URL`, puis retombe sur `process.env.SUPABASE_URL`
  pour le SSR. D'où les deux jeux de variables, avec la même valeur.
- `RESEND_API_KEY` : utilisée par `src/lib/mailer.server.ts`. Le suffixe
  `.server.ts` garantit que ce fichier n'est jamais bundlé pour le navigateur.
  Si la clé est absente, le code **n'échoue pas** : il journalise
  `[mail] RESEND_API_KEY missing` et continue. Donc « la réservation marche mais
  je ne reçois pas de mail » = variable manquante ou mal nommée.
- `EMAIL_FROM` : l'expéditeur. Il **doit** être sur un domaine vérifié dans
  Resend (`youpitennisclub.com` chez toi), sinon Resend refuse l'envoi.
  Attention : ton site est sur `.club` mais ton domaine mail vérifié est en
  `.com` — c'est parfaitement valable, ce sont deux choses indépendantes.
- `SITE_URL` : sert à construire les liens d'annulation
  (`${SITE_URL}/cancel?token=...`). S'il ne correspond pas exactement au domaine
  public, les liens envoyés par mail pointent vers un site qui ne connaît pas le
  jeton. À aligner sur le domaine final, sans slash final.

En local, ces valeurs vivent dans un fichier `.env` à la racine (déjà présent).
Ce fichier ne doit **pas** être commité avec la clé Resend.

---

## 4. Déployer sur Cloudflare (le mécanisme, puis les clics)

**Ce qui se passe réellement** : Cloudflare clone ton repo, exécute la commande de
build dans un conteneur, récupère `dist/`, en extrait le script Worker + les
assets statiques, et publie le tout sur son réseau mondial. Chaque visite
déclenche l'exécution du Worker (SSR + server functions), qui parle à Supabase et
Resend par HTTP.

Marche à suivre :

1. [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** →
   *Create* → *Pages* → **Connect to Git** → sélectionne le repo.
2. Réglages de build :
   - Framework preset : **None** (le preset est déjà géré par `vite.config.ts`)
   - Build command : `npm install && npm run build`
   - Build output directory : `dist`
3. **Ajoute toutes les variables de la section 3 AVANT le premier build**, sinon
   les `VITE_*` seront absentes du bundle et le site plantera au chargement avec
   `Missing Supabase environment variable(s)`.
4. *Save and Deploy*. Tu obtiens une URL `*.pages.dev` pour tester.

Si Pages refuse la sortie SSR (ça arrive selon les versions), utilise
**Workers → Import a repository** avec exactement la même commande de build :
Workers est la cible native de ce projet, Pages n'en est qu'un emballage.

Test en local du build de production, très utile car le runtime Cloudflare
(`workerd`) est plus strict que Node — pas de `child_process`, pas de `sharp`,
pas de `__dirname` :

```bash
npm run build
npx wrangler dev            # exécute dist/ dans le vrai runtime Cloudflare
```

Débogage : `npx wrangler tail` affiche en direct les logs (`console.error`) de ton
Worker en production. C'est là que tu verras les échecs d'envoi Resend.

---

## 5. Brancher le domaine (et ce que fait le DNS)

**Pourquoi c'est simple ici ?** `youpitennisclub.club` est déjà géré par
Cloudflare : les enregistrements DNS et le certificat TLS sont créés
automatiquement, sans copier-coller d'IP.

1. Projet Cloudflare → **Custom domains** → *Set up a domain* →
   `youpitennisclub.club`.
2. Recommence pour `www.youpitennisclub.club` (les visiteurs tapent les deux).
3. **Supprime les anciens enregistrements A qui pointent vers Lovable
   (185.158.133.1)**. Deux cibles pour un même nom = comportement aléatoire.
4. Attends la propagation (quelques minutes ici, jusqu'à 24 h dans le pire cas).

Vérifications en ligne de commande :

```bash
dig +short youpitennisclub.club            # doit renvoyer des IP Cloudflare
curl -I https://youpitennisclub.club       # doit renvoyer 200 et un certificat valide
```

N'oublie pas : après avoir figé le domaine final, remets `SITE_URL` à
`https://youpitennisclub.club` **et redéploie**, sinon les liens d'annulation
restent sur l'ancienne URL.

---

## 6. Ce qui change côté Lovable

- Tu peux repasser en plan gratuit : le projet reste **éditable** dans Lovable et
  continue de pousser sur GitHub → chaque modification redéclenche un déploiement
  Cloudflare. C'est ça, l'intérêt du montage.
- `youpitennisclub.lovable.app` peut cesser d'être servi : ton domaine n'en
  dépend plus.
- Une fois sur ton Supabase, tes données ne dépendent plus de Lovable Cloud.
- Attention : si Lovable continue d'éditer les fichiers `.env` du projet, ce sont
  les valeurs **Cloudflare** qui comptent en production. Les deux mondes ne se
  synchronisent pas.

---

## 7. Vérifier que tout marche (recette de bout en bout)

1. Ouvre `https://youpitennisclub.club` → la page d'accueil s'affiche
   (SSR OK, variables `VITE_*` OK).
2. Va sur `/book`, ouvre un créneau, réserve avec une vraie adresse mail.
   - un mail **RESERVATION** arrive sur `youpitennisclub@gmail.com`
   - un mail de confirmation arrive à l'élève
   - le prénom apparaît dans le calendrier après rechargement (base OK)
3. Clique « Cancel a booking » avec ce mail → mail contenant le lien, puis clic
   sur le lien → mails **CANCELLATION** et disparition du nom du calendrier.
4. Vérifie la règle des 24 h : sur un créneau à moins de 24 h, l'annulation doit
   être refusée.
5. Remplis un feedback → il apparaît sur la page d'accueil.

Si une étape échoue : `npx wrangler tail` en parallèle, l'erreur y sera lisible.

---

## 8. Panne fréquente → cause probable

| Symptôme | Cause la plus fréquente |
| --- | --- |
| Page blanche, `Missing Supabase environment variable(s)` | `VITE_SUPABASE_*` absentes au moment du build → ajoute-les puis **redeploy** |
| Réservation enregistrée mais aucun mail | `RESEND_API_KEY` absente/mal orthographiée, ou `EMAIL_FROM` sur un domaine non vérifié |
| Mail reçu mais lien d'annulation cassé | `SITE_URL` ≠ domaine public |
| `permission denied for table bookings` | migrations rejouées partiellement : les `GRANT`/policies manquent |
| Build OK en local, échec sur Cloudflare | variable absente côté Cloudflare, ou version de Node différente (fixe `NODE_VERSION=20`) |
| Marche en dev, casse en prod | dépendance qui exige Node (natif, `child_process`, filesystem) — teste toujours avec `npx wrangler dev` |
| Site lent au premier appel après plusieurs jours | projet Supabase gratuit mis en pause par inactivité ; la première requête le réveille |

---

## 9. Coûts et limites de l'offre gratuite

| Élément | Coût | Limite à connaître |
| --- | --- | --- |
| Domaine `.club` (Cloudflare) | ~10 €/an, déjà payé | — |
| Cloudflare Workers/Pages | 0 € | 100 000 requêtes/jour, 10 ms CPU par requête |
| Supabase | 0 € | 500 Mo de base, pause après ~1 semaine sans trafic |
| Resend | 0 € | 3 000 mails/mois, 100/jour |
| Lovable | 0 € | édition + push GitHub, sans domaine personnalisé |

Pour ton usage (un club, quelques dizaines de réservations par semaine), tu
restes très loin de chacun de ces plafonds.

---

## 10. Sauvegardes, la seule chose vraiment à ta charge

Le plan gratuit Supabase ne garantit pas de sauvegarde longue durée. Un export
mensuel suffit :

```bash
supabase db dump --file backup-$(date +%F).sql        # schéma + données
```

Garde le fichier ailleurs que sur ton disque principal. C'est aussi ce qui te
permettrait de tout reconstruire sur un autre hébergeur en une heure.
