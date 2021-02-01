class Legende {

    constructor(
        id,
        nom, 
        departement, 
        categorie, 
        resume, 
        histoire, 
        latitude, 
        longitude,
        adresse,
        baignade,
        toilettes, 
        restaurant, 
        photo, 
        site, 
        resume_lieu,
        nom_lieu) {

            this.id = id;
            this.nom = nom;
            this.departement = departement;
            this.categorie = categorie;
            this.resume = resume;
            this.histoire = histoire;
            this.latitude = latitude;
            this.longitude = longitude;
            this.adresse = adresse;
            this.baignade = baignade;
            this.toilettes = toilettes;
            this.restaurant = restaurant;
            this.photo = photo;
            this.site = site;
            this.resume_lieu = resume_lieu;
            this.nom_lieu = nom_lieu;
    }
}

module.exports = Legende;