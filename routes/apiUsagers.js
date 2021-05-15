'use strict';

var express = require('express');

var routerUsagers = express.Router();

// URL de base
var url_base = "https://tp3-bedardantoine.herokuapp.com/";
// ORM Mongoose
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken');

// Connection a la bd mongoDB
mongoose.connect('mongodb+srv://antoine:bedard@cluster0.haeor.mongodb.net/myFirstDatabase?retryWrites=true&w=majority/tp3WebAB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10
});

// Importation du modele usager.
var UsagerModele = require('../models/usagerModele').UsagerModele;


// token
// =================================
function verifierAuthentification(req, callback) {
    var auth = req.headers.authorization;
    if (!auth) {
        callback(false, null);
    } else {
        var authArray = auth.split(' ');
        if (authArray.length !== 2) {
            callback(false, null);
        } else {
            var jetonEncode = authArray[1];
            jwt.verify(jetonEncode, req.app.get('jwt-secret'), function (err, jetonDecode) {
                if (err) callback(false, null);
                else {
                    callback(true, jetonDecode);
                }
            });
        }
    }
}

// Route pour la création d'un usager. (Pas besoin d'être connecter).
routerUsagers.route('/usagers')
    .post(function (req, res) {
        if (req.body.Nom && req.body.Prenom && req.body.Adresse && req.body.Pseudo && req.body.MotDePasse && Object.keys(req.body).length === 5){
            // Les champs du body sont présent.
            var nouveauUsager = new UsagerModele(req.body);

            nouveauUsager.save(function (err) {
                if (err) throw err;
    
                res.status(201).location(url_base + 'usagers/' + nouveauUsager._id).json(nouveauUsager);
            });
        }
        else{
            res.status(400).end();
        }
    })
    // Tout les autres méthode qui ne sont pas préciser.
    .all(function (req, res) {
        console.log('Méthode HTTP non autorisé.');
        res.status(405).end();
    });


//  MidelWare
// =================================
routerUsagers.use(function (req, res, next) {
    verifierAuthentification(req, function (estAuthentifier, jetonDecode) {
        if (!estAuthentifier) res.status(401).end();
        else {
            req.jeton = jetonDecode;
            next();
        }
    });
});

// route de consultation d'un usager avec son id.
routerUsagers.route('/usagers/:usager_id')
    .get(function (req, res) {
        var usagerID = req.params.usager_id; // id de l'usager dans la request.
        
        // vérification si l'usager connecter a l'id fournis en params.
        if (req.jeton.usagerConnecterID === usagerID) {
            console.log("Consultation de l'usager avec l'id : " + usagerID);

            // Validation que l'id est bien de 24 char.
            if (usagerID.length === 24) {
                // Recherche l'usager qui a l'id fournis en params.
                UsagerModele.findById(usagerID, function (err, usager) {
                    console.log(usagerID);
                    if (err) throw err;
                    if (usager) res.status(200).json(usager); // return 200 et le json de l'usager trouver.
                    else res.status(404).end(); // return 404 si l'usager n'est pas trouvé.
                });
            } else {
                res.status(400).end();
            }
        } else {
            res.status(403).end();
        }
    })
    // Tout les autres méthode qui ne sont pas préciser.
    .all(function (req, res) {
        console.log('Méthode HTTP non autorisé.');
        res.status(405).end();
    });

// Exportation de l'objet routerUsagers pour pouvoir l'utiliser.
module.exports = routerUsagers;