#language: fr
Fonctionnalité: Spa PKCE Test

  @skip
  Scénario: Connexion avec succès
    Soit la page de démarrage
    * je clique sur "SPA PKCE"
    Quand je clique sur "Cliquez pour vous connecter"
    * je remplis le formulaire de connexion
    * je clique sur "Connexion"
    Alors je vois le message "Connexion réussie"
