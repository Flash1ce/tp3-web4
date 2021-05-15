// ORM mongoose
var mongoose = require('mongoose');


// Création du shéma usager
var usagerSchema = new mongoose.Schema({
    Nom: {
        type: String,
        require: true
    },
    Prenom: {
        type: String,
        require: true
    },
    Adresse: {
        type: String,
        require: true
    },
    Pseudo: {
        type: String,
        require: true
    },
    MotDePasse: {
        type: String,
        require: true
    }
});

// Crée le modèle à partir du schéma et l'Exporte pour pouvoir l'utiliser dans le reste du projet
module.exports.UsagerModele = mongoose.model('Usager', usagerSchema);
// Exportation du schema pour pouvoir l'utiliser dans un autres schema.
module.exports.usagerSchema = mongoose.Schema(usagerSchema);