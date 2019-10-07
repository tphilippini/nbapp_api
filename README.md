# NBA APP BACKEND API

## TODO:

0. Send forgot email
1. Create Youtube Channel Id list
1. Refacto determinePlayer dans les videos
1. Mettre les playersId dans les videos youtube schema
1. Mettre les videoId dans le playerSchema
1. Mettre les matchStat dans le playerSchema

- Si désactivation de compte : clear tokens de l'app + révoquer tous les devices de l'utilisateur

- Si déconnexion : clear tokens de l'app + révoquer device courant de l'utilisateur

- Si changement de mot de passe : révoquer tous les devices de l'utilisateur excepté le device courant

Imaginez un refresh token comme étant l'option "se souvenir de moi" dans une SPA.

Un refresh token réduira le champs d'action sur la durée pour un attaquant. En effet l'access_token est valide 1h, le refresh_token peut être valide bcp plus longtemps, même "à vie". J'ai tout de même préféré lui donner une durée de vie de 7 jours.

On pourra révoquer un refresh token, donc l'accès à un device spécifique.

Notre système d'authentification est multi-devices, il est possible d'être connecté sur un même compte via plusieurs clients car chaque device a son propre refresh_token

On veut que notre projet soit multi-devices, donc possibilité d'être authentifié sur plusieurs appareils en même temps. Par conséquent on par du principe qu'un utilisateur peut avoir plusieurs devices, qui eux vont être authentifié

Requête : /auth/token (email=xxx&password=xxx&user_typer=user&grant_type=password)
Réponse : https://i.gyazo.com/2f697fb402116b23c9a8f128982ba6c4.png
Requête : /ressource-protégée (Authorization: Bearer access_token)
Réponse : infos de la ressource protégée
Reproduire étape 3 et 4 jusqu'à ce que access_token expire (ou anticiper l'expiration avec expires_in retournée dans l'étape 2, à l'heure actuelle je ne sais pas encore ce que je vais faire ici)
Dans le cas où il n'y a pas d'anticipation, et que access_token a expiré. Réponse : https://i.gyazo.com/c18dc14c932b271a7f1c9eebd6a04f13.png
Requête : /auth/token (refresh_token=xxx&grant_type=refresh_token&client_id=xxx)
Réponse : pareil que l'étape 2 avec un nouveau access_token et refresh_token

Delete all device when user is remove
https://www.robinwieruch.de/mongodb-express-setup-tutorial/
userSchema.pre('remove', function(next) {
this.model('Device').deleteMany({ user: this.\_id }, next);
});

## Authors

- **tphilippini**
