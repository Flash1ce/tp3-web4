'use strict';

var express = require('express');

var routerCommande = express.Router();

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

// importation du model usager.
var UsagerModele = require('../models/usagerModele').UsagerModele;
// Importation du modele usager.
var CommandeModele = require('../models/commandeModele').CommandeModele;
// Importation du modele plats
var PlatsModele = require('../models/platsModele').PlatsModele;
// const {
//     LivreurModele
// } = require('../models/livreurModele');
var LivreurModele = require('../models/livreurModele').LivreurModele;

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

//  MidelWare
// =================================
routerCommande.use(function (req, res, next) {
    verifierAuthentification(req, function (estAuthentifier, jetonDecode) {
        if (!estAuthentifier) res.status(401).end();
        else {
            req.jeton = jetonDecode;
            next();
        }
    });
});

routerCommande.route('/usagers/:usager_id/commandes')
    // Permet de créé une commande sans livreur, sans plat pour l'id usager_id.
    .post(function (req, res) {
        var usagerID = req.params.usager_id; // id de l'usager dans la request.
        // vérification si l'usager connecter a l'id fournis en params.
        if (req.jeton.usagerConnecterID === usagerID) {
            if (req.body.DateArrivee&& Object.keys(req.body).length === 1) {
                console.log("Création de la commande sans livreur et sans plat.");

                UsagerModele.findById(usagerID, function (err, usager) {
                    if (err) throw err;
    
                    // Création de la commande
                    var nouvelleCommande = new CommandeModele({
                        'DateArrivee': req.body.DateArrivee,
                        'Usager': usager
                    });
    
                    // Sauvegarde de la nouvelle commande.
                    nouvelleCommande.save(function (err) {
                        if (err) throw err;
    
                        res.status(201).location(url_base + 'usagers/' + usagerID + '/commandes/' + nouvelleCommande._id).json(nouvelleCommande);
                    });
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

routerCommande.route('/usagers/:usager_id/commandes/:commande_id')
    // Permet de consulter la commande ayant l'id commande_id".
    .get(function (req, res) {
        var usagerID = req.params.usager_id; // id de l'usager dans la request.
        var commandeID = req.params.commande_id; // id de la commande dans la request.

        // vérification si l'usager connecter a l'id fournis en params.
        if (req.jeton.usagerConnecterID === usagerID) {
            console.log("Consultation de la commande ayant l'id : " + commandeID);

            // Validation que l'id est bien de 24 char.
            if (commandeID.length === 24) {
                // Recherche la commande qui a l'id fournis en params.
                CommandeModele.findById(commandeID, function (err, commande) {
                    if (err) throw err;
                    if (commande) res.status(200).json(commande); // return 200 et le json de la commande trouver.
                    else res.status(404).end(); // return 404 si la commande n'est pas trouvé.
                });
            } else {
                res.status(400).end();
            }
        } else {
            res.status(403).end();
        }
    })
    // Permet de créé ou modifié la commande ayant l'id commande_id.
    .put(function (req, res) {
        var usagerID = req.params.usager_id; // id de l'usager dans la request.
        var commandeID = req.params.commande_id; // id de la commande dans la request.

        // vérification si l'usager connecter a l'id fournis en params.
        if (req.jeton.usagerConnecterID === usagerID) {
            // Validation que l'id est bien de 24 char.
            if (commandeID.length === 24) {
                // Recherche la commande qui a l'id fournis en params.
                CommandeModele.findById(commandeID, function (err, commande) {
                    if (err) throw err;

                    // Vérifie si il y a seulement la date a modifier.
                    if (Object.keys(req.body).length === 1 && req.body.DateArrivee !== undefined) {
                        // Commande n'existe pas elle vas donc être créé.
                        if (commande) {
                            // Trouve par l'id et modifie la date de la commande.
                            CommandeModele.findByIdAndUpdate(commandeID, {
                                DateArrivee: req.body.DateArrivee
                            }, {
                                new: true,
                                runValidators: true
                            }, function (err, commande) {
                                if (err) throw err;
                                res.status(200).location(
                                    url_base + 'usagers/' + usagerID + '/commandes/' + commandeID).json(commande);
                            });
                        } else {
                            UsagerModele.findById(usagerID, function (err, usager) {
                                if (err) throw err;

                                // Création de la commande
                                var nouvelleCommande = new CommandeModele({
                                    'DateArrivee': req.body.DateArrivee,
                                    'Usager': usager
                                });
                                nouvelleCommande.save(function (err) {
                                    if (err) throw err;
                                    res.status(201).location(
                                        url_base + 'usagers/' + usagerID + '/commandes/' + nouvelleCommande._id).json(nouvelleCommande);
                                });
                            });
                        }
                    } else {
                        // Return 403, car il y a pas seulement la date a modifier.
                        res.status(403).end();
                    }
                });
            } else {
                res.status(400).end();
            }
        } else {
            res.status(403).end();
        }
    }) // Fin du put de la modification de la commande.
    // Permet de supprimer la commande ayant l'id commande_id
    .delete(function (req, res) {
        var usagerID = req.params.usager_id; // id de l'usager dans la request.
        var commandeID = req.params.commande_id; // id de la commande dans la request.

        // vérification si l'usager connecter a l'id fournis en params.
        if (req.jeton.usagerConnecterID === usagerID) {
            // Vérification que l'id est de bon format.
            if (commandeID.length === 24) {
                // Suppresion de la commande avec sont id.
                CommandeModele.findByIdAndDelete(commandeID, function (err) {
                    if (err) throw err;

                    res.status(204).end();
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

routerCommande.route('/usagers/:usager_id/commandes/:commande_id/livreur')
    // Permet d'assosier un livreur à la commande ayant l'id commande_id.
    .put(function (req, res) {
        var usagerID = req.params.usager_id; // id de l'usager dans la request.
        var commandeID = req.params.commande_id; // id de la commande dans la request.

        // vérification si l'usager connecter a l'id fournis en params.
        if (req.jeton.usagerConnecterID === usagerID) {
            if (req.body._id && req.body.Nom && req.body.Prenom && req.body.Voiture && req.body.Quartier && Object.keys(req.body).length === 6) {
                // Vérification si l'id de la commande respect le format de 24 char.
                if (commandeID.length === 24 && req.body._id.length === 24) {

                    // Trouve la commande avec sont id.
                    CommandeModele.findById(commandeID, function (err, commande) {
                        if (err) throw err;

                        // Validation si la commande existe.
                        if (commande) {
                            // récupère le livreur avec sont id.
                            LivreurModele.findById(req.body._id, function (err, livreur) {
                                if (err) throw err;

                                // Vérification si le livreur ayant l'id existe dans la bd.
                                if (livreur) {
                                    // Vérifier si le livreur du body est le même que lui de la bd.
                                    if (JSON.stringify(livreur) === JSON.stringify(req.body)) {
                                        // Valider si la commande a un livreur.
                                        if (commande.Livreur === undefined) {
                                            console.log("Ajout d'un livreur a la commande.");
                                            // ajout du livreur a la commande.
                                            CommandeModele.findByIdAndUpdate(commandeID, {
                                                "Livreur": req.body
                                            }, {
                                                new: true,
                                                runValidators: true
                                            }, function (err, commande) {
                                                if (err) throw err;

                                                res.status(201).json(commande);
                                            });
                                        } else {
                                            // Modification du livreur de la commande.
                                            console.log("Modification du livreur de la commande.");

                                            CommandeModele.findByIdAndUpdate(commandeID, {
                                                "Livreur": req.body
                                            }, {
                                                new: true,
                                                runValidators: true
                                            }, function (err, commande) {
                                                if (err) throw err;

                                                res.status(200).json(commande);
                                            });
                                        }
                                    } else {
                                        // Le livreur de la bd ne corespond pas au livreur du body.
                                        res.status(400).end(); // Mauvaise requete donc code 400.
                                    }
                                } else {
                                    if (req.body.Nom && req.body.Prenom && req.body.Voiture && 
                                        req.body.Quartier && req.body._id && Object.keys(req.body).length === 6) {
                                        console.log("Création du livreur et ajout a la commande.");
                                        // Le livreur n'existe pas donc il est créé.
                                        var nouveauLivreur = new  LivreurModele(req.body);
        
                                        nouveauLivreur.save(function (err) {
                                            if (err) throw err;
        
                                            // Ajout du Livreur a la commande.
                                            CommandeModele.findByIdAndUpdate(commandeID, {
                                                "Livreur": nouveauLivreur
                                            }, {
                                                new: true,
                                                runValidators: true
                                            }, function (err, commande) {
                                                if (err) throw err;
        
                                                res.status(201).json(commande);
                                            });
                                        });
                                    } else {
                                        res.status(400).end();
                                    }
                                }
                            });
                        } else {
                            // la commande n'existe pas.
                            res.status(404).end();
                        }
                    });
                } else {
                    res.status(400).end();
                }
            } else {
                res.status(400).end();
            }
        } else {
            res.status(403).end();
        }
    }) // Fin du put modifier/ajouter livreur commande.
    // Tout les autres méthode qui ne sont pas préciser.
    .all(function (req, res) {
        console.log('Méthode HTTP non autorisé.');
        res.status(405).end();
    });

routerCommande.route('/usagers/:usager_id/commandes/:commande_id/plats')
    // Permet de consulter les plats dans la commande ayant l'id commande_id.
    .get(function (req, res) {
        var usagerID = req.params.usager_id; // id de l'usager dans la request.
        var commandeID = req.params.commande_id; // id de la commande dans la request.

        // vérification si l'usager connecter a l'id fournis en params.
        if (req.jeton.usagerConnecterID === usagerID) {
            // vérification que l'id de la commande respecte bien le format.
            if (commandeID.length === 24) {
                // Obtenir la list des plats d'une commande.
                CommandeModele.findById(commandeID, function (err, commande) {
                    if (err) throw err;

                    if (commande) {
                        res.status(200).json(commande.Plats);
                    } else {
                        res.status(404).end(); // la commande existe pas.
                    }
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

routerCommande.route('/usagers/:usager_id/commandes/:commande_id/plats/:plat_id')
    // Permet d'associer un plat ayant l'id plat_id a la commande commande_id.
    .put(function (req, res) {
        var usagerID = req.params.usager_id; // id de l'usager dans la request.
        var commandeID = req.params.commande_id; // id de la commande dans la request.
        var platID = req.params.plat_id; // id du plat dans la request.

        // vérification si l'usager connecter a l'id fournis en params.
        if (req.jeton.usagerConnecterID === usagerID) {
            // Vérifie que l'id du plat et de la commande sont du bon format.
            if (commandeID.length === 24 && platID.length === 24) {
                // Récupère le plat avec sont id.
                PlatsModele.findById(platID, function (err, plat) {
                    if (err) throw err;

                    // Vérification si le plats ayant l'id existe dans la bd.
                    if (plat) {
                        // Vérifier si le plat dans le body = plats trouver dans la bd.
                        if (JSON.stringify(plat) === JSON.stringify(req.body)) {
                            // Ajout du plat a la commande.
                            CommandeModele.findByIdAndUpdate(commandeID, {
                                $push: {
                                    "Plats": req.body
                                }
                            }, {
                                safe: true,
                                upsert: true,
                                new: true,
                                runValidators: true
                            }, function (err, commande) {
                                if (err) throw err;

                                res.status(200).json(commande);
                            });
                        } else {
                            // Le plat de la bd ne corespond pas au plat du body.
                            res.status(400).end(); // Mauvaise requete donc code 400.
                        }
                    } else {
                        // Validation que le body soit le bon.
                        if (req.body.Nom && req.body.NbrPortions && 
                            req.body._id && Object.keys(req.body).length === 4) {
                            // Le plat n'existe pas donc il est créé.
                            var nouveauPlat = new PlatsModele(req.body);

                            nouveauPlat.save(function (err) {
                                if (err) throw err;
    
                                // Ajout du plat a la commande.
                                CommandeModele.findByIdAndUpdate(commandeID, {
                                    $push: {
                                        "Plats": nouveauPlat
                                    }
                                }, {
                                    safe: true,
                                    upsert: true,
                                    new: true,
                                    runValidators: true
                                }, function (err, commande) {
                                    if (err) throw err;
    
                                    res.status(201).json(commande);
                                });
                            });
                        } else { res.status(400).end();}
                    }
                });
            } else {
                res.status(400).end();
            }
        } else {
            res.status(403).end();
        }
    }) // Fin put
    // Permet de retirer le plat ayant l'id plat_id de la commande commande_id.
    .delete(function (req, res) {
        var usagerID = req.params.usager_id; // id de l'usager dans la request.
        var commandeID = req.params.commande_id; // id de la commande dans la request.
        var platID = req.params.plat_id; // id du plat dans la request.

        // vérification si l'usager connecter a l'id fournis en params.
        if (req.jeton.usagerConnecterID === usagerID) {
            if (commandeID.length === 24 && platID.length === 24) {
                // Supprime le premier plats ayant l'id.
                CommandeModele.findByIdAndUpdate(commandeID, {
                    $pull: {
                        "Plats": {
                            "_id": platID
                        }
                    }
                }, {
                    safe: true,
                    upsert: true,
                    new: true,
                    runValidators: true
                }, function (err, commande) {
                    if (err) throw err;

                    res.status(204).json(commande);
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
module.exports = routerCommande;