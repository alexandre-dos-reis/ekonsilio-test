# EKonsilio | Test technique

## Démo

Le lancement de la démo ne nécessite qu'une seule dépendance : `Docker` en `version 28` minimum.
Lancer la stack avec cette commande : `docker compose up -d`

### Accès aux applications frontend

Les deux applications frontend sont accessibles aux URL suivantes :

- **Live-Chat** : [http://localhost:5300](http://localhost:5300)
- **Admin-Chat** : [http://localhost:4300](http://localhost:4300)

> ⚠️ **Attention** : pour tester les deux applications simultanément, ouvrez-les dans **deux navigateurs différents**.  
> Les cookies étant partagés entre ports sur un même domaine (`localhost`), cela peut entraîner un écrasement de session.  
> Ce problème ne se produira pas en production, où chaque application disposera de son propre nom de domaine.

## Choix techniques

### Gestionnaire de paquets : `pnpm`

- Excellent support pour les monorepos
- Système de cache performant, réduisant les temps d'installation

### Base de données : `PostgreSQL`

- Language SQL.
- Les données de l'application sont relationnelles.
- Support des colonnes de type JSON, pratique pour les structures flexibles

### Backend

- **Hono** : mini-framework compatible avec tous les runtimes JavaScript (Node.js, Bun, Deno, Cloudflare, etc.). Bonne compatibilité avec TypeScript. Dispose d'une API simple pour la gestion des WebSockets.
  - Inclut un client RPC façon tRPC, permettant de consommer facilement les routes depuis le frontend.
- **Drizzle ORM** : API proche du SQL, permettant une meilleure lisibilité. Offre surtout des types TypeScript solides, facilitant le développement type-safe.
- **BetterAuth** : solution d’authentification légère, basée sur l’utilisation de cookies. Compatible avec les ORMs et bases de données modernes, notamment ici avec Drizzle.

### Frontend

- **Vite.js** : rapide, moderne — inutile de le présenter davantage !
- **TanStack Router** : permet de gérer le routing, le chargement de données, etc. Très bonne compatibilité avec TypeScript.
- **Tailwind CSS** + **DaisyUI** : composants élégants, stylés uniquement via des classes HTML. Accélère fortement la mise en page.
