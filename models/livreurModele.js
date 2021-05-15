// ORM mongoose
var mongoose = require('mongoose');


// Création du shéma usager
var livreurSchema = new mongoose.Schema({
    Nom: {
        type: String,
        require: true
    },
    Prenom: {
        type: String,
        require: true
    },
    Voiture: {
        type: String,
        require: true
    },
    Quartier: {
        type: String,
        require: true
    }
});

// Crée le modèle à partir du schéma et l'Exporte pour pouvoir l'utiliser dans le reste du projet
module.exports.LivreurModele = mongoose.model('Livreur', livreurSchema);
// exportation du shéma pour pouvoir l'utiliser dans un autres shcéma.
module.exports.livreurSchema = mongoose.Schema(livreurSchema);