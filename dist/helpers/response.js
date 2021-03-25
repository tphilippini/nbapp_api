'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var response = {};

response.success = function (res, status, code) {
  var message = '';
  if (code === 'user_added') message = "L'utilisateur a été ajouté avec succès";

  if (code === 'user_authenticated') {
    message = "L'utilisateur a été authentifié avec succès";
  }

  if (code === 'user_confirmed') {
    message = "L'utilisateur a été confirmé avec succès";
  }

  if (code === 'user_updated') {
    message = "L'utilisateur a été modifié avec succès";
  }

  if (code === 'password_updated') {
    message = 'Le mot de passe a été modifié avec succès';
  }

  if (code === 'tokens_updated') {
    message = 'Les tokens ont été mis à jour avec succès';
  }

  if (code === 'device_revoked') {
    message = "L'accès à l'application pour cet appareil a été révoqué avec succès";
  }

  if (code === 'device_name_changed') {
    message = "Le nom de l'appareil a été modifié avec succès";
  }

  if (code === 'result_found') {
    message = 'Un ou plusieurs résultats ont été trouvé avec succès';
  }

  if (code === 'user_welcome') {
    message = 'Welcome on Nba App API';
  }

  if (code === 'user_forgot') {
    message = 'Un email pour réinitialiser votre mot de passe a été envoyé avec succès';
  }

  if (code === 'result_empty') message = "Aucun résultat n'a été trouvé";
  if (code === 'league_added') message = 'La ligue a été ajouté avec succès';

  for (var _len = arguments.length, data = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    data[_key - 3] = arguments[_key];
  }

  var success = {
    success: true,
    status,
    message,
    code,
    data
  }; // if (data.length === 0) {
  //   delete success.data;
  // }

  res.status(status);
  res.json(success);
};

response.successAdd = (res, code, location, data) => {
  res.location(process.env.API_VERSION + location);
  response.success(res, 201, code, data);
};

response.error = function (res, status) {
  var errors = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

  if (errors.length > 0) {
    var tab = [];
    errors.forEach(error => {
      switch (error) {
        case 'missing_params':
          tab.push({
            message: 'Un ou plusieurs paramètre(s) est / sont manquant(s)',
            code: error
          });
          break;

        case 'too_many_params':
          tab.push({
            message: 'Trop de paramètres ont été envoyés',
            code: error
          });
          break;

        case 'mailer_failed':
          tab.push({
            message: 'Envoi du mail invalide',
            code: error
          });
          break;

        case 'invalid_param_value':
          tab.push({
            message: "Valeur(s) d'un ou plusieurs paramètre est / sont invalide(s)",
            code: error
          });
          break;

        case 'invalid_phone_number':
          tab.push({
            message: 'Numéro de téléphone invalide',
            code: error
          });
          break;

        case 'invalid_email_address':
          tab.push({
            message: 'Adresse email invalide',
            code: error
          });
          break;

        case 'alias_too_short':
          tab.push({
            message: 'Alias trop court (4 caractères minimum)',
            code: error
          });
          break;

        case 'password_too_short':
          tab.push({
            message: 'Mot de passe trop court (6 caractères minimum)',
            code: error
          });
          break;

        case 'password_must_match':
          tab.push({
            message: 'Les mots de passe doivent être identique',
            code: error
          });
          break;

        case 'new_password_too_short':
          tab.push({
            message: 'Nouveau mot de passe trop court (6 caractères minimum)',
            code: error
          });
          break;

        case 'email_address_already_taken':
          tab.push({
            message: 'Cette adresse email est déjà existante',
            code: error
          });
          break;

        case 'alias_already_taken':
          tab.push({
            message: 'Cet alias est déjà existant',
            code: error
          });
          break;

        case 'invalid_user_type':
          tab.push({
            message: "Type d'utilisateur invalide",
            code: error
          });
          break;

        case 'invalid_grant_type':
          tab.push({
            message: 'Type du grant invalide',
            code: error
          });
          break;

        case 'invalid_credentials':
          tab.push({
            message: 'Identifiants invalides',
            code: error
          });
          break;

        case 'invalid_access_token':
          tab.push({
            message: "Token d'accès invalide",
            code: error
          });
          break;

        case 'invalid_refresh_token':
          tab.push({
            message: 'Token de rafraîchissement invalide',
            code: error
          });
          break;

        case 'invalid_client':
          tab.push({
            message: 'Client invalide',
            code: error
          });
          break;

        case 'invalid_method':
          tab.push({
            message: 'Méthode invalide',
            code: error
          });
          break;

        case 'insufficient_rights':
          tab.push({
            message: 'Droits insuffisants',
            code: error
          });
          break;

        case 'the_device_does_not_belong_to_the_user':
          tab.push({
            message: "Cet appareil n'existe pas ou n'est plus valide",
            code: error
          });
          break;

        default:
          tab.push({
            message: error,
            code: 'unknown_command'
          });
          break;
      }
    });
    errors = tab;
  }

  var error = {
    success: false,
    status,
    errors
  };
  res.status(status);
  res.json(error);
};

var _default = response;
exports.default = _default;