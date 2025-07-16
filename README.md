# EKonsilio | Test technique

## Choix techniques

### Gestionnaire de paquets : `pnpm`

- Excellent support pour les monorepos
- Système de cache performant, réduisant les temps d'installation

### Base de données : `PostgreSQL`

- Base de données relationnelle robuste
- Support des colonnes de type JSON, pratique pour les structures flexibles

### Backend

- **Hono** : mini-framework compatible avec tous les runtimes JavaScript (Node.js, Bun, Deno, Cloudflare, etc.). Bonne compatibilité avec TypeScript. Dispose d'une API simple pour la gestion des WebSockets.
- **Drizzle ORM** : API proche du SQL, permettant une meilleure lisibilité. Offre surtout des types TypeScript solides, facilitant le développement type-safe.
- **BetterAuth** : solution d’authentification légère, basée sur l’utilisation de cookies. Compatible avec les ORMs et bases de données modernes, notamment ici avec Drizzle.
- Inclut un client RPC façon tRPC, permettant de consommer facilement les routes depuis le frontend.

### Frontend

- **Vite.js** : rapide, moderne — inutile de le présenter davantage !
- **TanStack Router** : permet de gérer le routing, le chargement de données, etc. Très bonne compatibilité avec TypeScript.
- **Tailwind CSS** + **DaisyUI** : composants élégants, stylés uniquement via des classes HTML. Accélère fortement la mise en page.
