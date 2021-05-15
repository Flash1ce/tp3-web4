'use strict';

var express = require('express');
var PORT = process.env.PORT;
var app = express();
var hateoasLinker = require('express-hateoas-links');

// Permet de récupérer du JSON dans le corps de la requête
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// Swagger
var swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json');

// Swagger documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Json Web Token
var jwt = require('jsonwebtoken');

// Importation des routers.
var routerCommande = require('./routes/apiCommandes.js');
var routerLivreur = require('./routes/apiLivreur.js');
var routerPlats = require('./routes/apiPlats.js');
var routerUsagers = require('./routes/apiUsagers.js');

var config = require('./config');
app.set('jwt-secret', config.secret);

var UsagerModele = require('./models/usagerModele').UsagerModele;

// connexion
app.route('/connexions')
    // route pour ce connecter et crée le token.
    .post(function (req, res) {
        // Filtre pour valider la connexion.
        var filter = {
            $and: [{
                'Pseudo': req.body.Pseudo
            }, {
                'MotDePasse': req.body.MotDePasse
            }, {
                'Adresse': req.body.Adresse
            }, {
                'Nom': req.body.Nom
            }, {
                'Prenom': req.body.Prenom
            }]
        };
        // Recherche de l'usager qui a le bon mdp et pseudo.
        UsagerModele.findOne(filter, function (err, usager) {
            if (err) throw err;
            if (usager) {
                // met l'id de l'usager connecter dans le payload.
                var payload = {
                    usagerConnecterID: usager._id
                };

                var jwtToken = jwt.sign(payload, app.get('jwt-secret'), {
                    expiresIn: 120
                });
                res.status(201).json({
                    "token": jwtToken
                });
            } else res.status(400).end();
        });
    });

// Remplace le fonctionnement normal d'une réponse pour le nouveau.
app.use(hateoasLinker);

// Indique a l'app d'utiliser le router.
app.use('/', routerUsagers);
app.use('/', routerLivreur);
app.use('/', routerPlats);
app.use('/', routerCommande);

// Gestion de l'erreur 404.
app.all('*', function (req, res) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(404).send('Erreur 404 : Ressource inexistante !');
});

// Démarage du serveur
app.listen(PORT, function () {
});