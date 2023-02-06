'use strict';

const response = {};

response.success = (res, status, code, ...data) => {
  let message = '';

  switch (code) {
    case 'user_added':
      message = "L'utilisateur a été ajouté avec succès";
      break;
    case 'user_added_confirm':
      message =
        "L'utilisateur a été ajouté avec succès.\nUn email pour confirmer votre inscription a été envoyé";
      break;
    case 'user_authenticated':
      message = "L'utilisateur a été authentifié avec succès";
      break;
    case 'user_confirmed':
      message = "L'utilisateur a été confirmé avec succès";
      break;
    case 'user_updated':
      message = "L'utilisateur a été modifié avec succès";
      break;
    case 'password_updated':
      message = 'Le mot de passe a été modifié avec succès';
      break;
    case 'tokens_updated':
      message = 'Les tokens ont été mis à jour avec succès';
      break;
    case 'device_revoked':
      message =
        "L'accès à l'application pour cet appareil a été révoqué avec succès";
      break;
    case 'device_name_changed':
      message = "Le nom de l'appareil a été modifié avec succès";
      break;
    case 'result_found':
      message = 'Un ou plusieurs résultats ont été trouvé avec succès';
      break;
    case 'user_welcome':
      message = 'welcome vercel';
      break;
    case 'user_forgot':
      message =
        'Un email pour réinitialiser votre mot de passe a été envoyé avec succès';
      break;
    case 'result_empty':
      message = "Aucun résultat n'a été trouvé";
      break;
    case 'league_added':
      message = 'La ligue a été ajouté avec succès';
      break;
    default:
      message = 'unknown_command';
      break;
  }

  const success = {
    success: true,
    status,
    message,
    code,
    data,
  };

  // if (data.length === 0) {
  //   delete success.data;
  // }

  res.status(status);
  res.json(success);
};

response.successAdd = (res, code, location, data) => {
  res.location(process.env.API_VERSION + location);

  response.success(res, 201, code, data);
};

response.error = (res, status, errors = []) => {
  if (errors.length > 0) {
    const tab = [];

    errors.forEach((error) => {
      switch (error) {
        case 'missing_params':
          tab.push({
            message: 'Un ou plusieurs paramètre(s) est / sont manquant(s)',
            code: error,
          });
          break;

        case 'too_many_params':
          tab.push({
            message: 'Trop de paramètres ont été envoyés',
            code: error,
          });
          break;

        case 'mailer_failed':
          tab.push({
            message: 'Envoi du mail invalide',
            code: error,
          });
          break;

        case 'invalid_param_value':
          tab.push({
            message:
              "Valeur(s) d'un ou plusieurs paramètre est / sont invalide(s)",
            code: error,
          });
          break;

        case 'invalid_phone_number':
          tab.push({
            message: 'Numéro de téléphone invalide',
            code: error,
          });
          break;

        case 'invalid_email_address':
          tab.push({
            message: 'Adresse email invalide',
            code: error,
          });
          break;

        case 'email_address_not_confirmed':
          tab.push({
            message: 'Adresse email non vérifié',
            code: error,
          });
          break;

        case 'alias_too_short':
          tab.push({
            message: 'Alias trop court (4 caractères minimum)',
            code: error,
          });
          break;

        case 'password_too_short':
          tab.push({
            message: 'Mot de passe trop court (6 caractères minimum)',
            code: error,
          });
          break;

        case 'password_must_match':
          tab.push({
            message: 'Les mots de passe doivent être identique',
            code: error,
          });
          break;

        case 'new_password_too_short':
          tab.push({
            message: 'Nouveau mot de passe trop court (6 caractères minimum)',
            code: error,
          });
          break;

        case 'email_address_already_taken':
          tab.push({
            message: 'Cette adresse email est déjà existante',
            code: error,
          });
          break;

        case 'alias_already_taken':
          tab.push({
            message: 'Cet alias est déjà existant',
            code: error,
          });
          break;

        case 'invalid_user_type':
          tab.push({
            message: "Type d'utilisateur invalide",
            code: error,
          });
          break;

        case 'invalid_grant_type':
          tab.push({
            message: 'Type du grant invalide',
            code: error,
          });
          break;

        case 'invalid_credentials':
          tab.push({
            message: 'Identifiants invalides',
            code: error,
          });
          break;

        case 'invalid_access_token':
          tab.push({
            message: "Token d'accès invalide",
            code: error,
          });
          break;

        case 'invalid_refresh_token':
          tab.push({
            message: 'Token de rafraîchissement invalide',
            code: error,
          });
          break;

        case 'invalid_client':
          tab.push({
            message: 'Client invalide',
            code: error,
          });
          break;

        case 'invalid_method':
          tab.push({
            message: 'Méthode invalide',
            code: error,
          });
          break;

        case 'insufficient_rights':
          tab.push({
            message: 'Droits insuffisants',
            code: error,
          });
          break;

        case 'the_device_does_not_belong_to_the_user':
          tab.push({
            message: "Cet appareil n'existe pas ou n'est plus valide",
            code: error,
          });
          break;

        default:
          tab.push({
            message: error,
            code: 'unknown_command',
          });
          break;
      }
    });

    errors = tab;
  }

  const error = {
    success: false,
    status,
    errors,
  };

  res.status(status);
  res.json(error);
};

export default response;
