/**
 * The file used to generate the database from the CSV.
 */

/**
 * Imports/Constants definition
 */
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const csv = require('csv-parser');
const fs = require('fs');

const config = require('./config.js');
const CONFIG = require('./config.js');

const verbose = true;

/**
 * Variables definition
 */
let db = null;
//var countIdDep = 1;
var countIdCat = 1;
var countIdLeg = 1;
var depList = [];
var catList = [];
var depFrontiereMer = [
                    { dep: 'Finistère', mer: 'left' },
                    { dep: 'Morbihan', mer: 'bottom' },
                    { dep: 'Côte d’Armor & Ille-et-Villaine', mer: 'top'},
                    ]
var personnages = { data: [{cat: 'Créatures Fantastiques',
                            //nom: 'Armelle',
                            phrasePerso: 'Les créatures et leurs contes fantastiques',
                            phraseDep: 'Bonjour à vous cher voyageur, cliquez sur l’un des points pour découvrir la légende qui y est associée.'},
                          {cat: 'Croyances Religion',
                            //nom: 'Saint-Paul',
                            phrasePerso: 'Le moine et ses légendes religieuses',
                            phraseDep: 'Chaque lieu renferme une légende, clique sur l’un des points pour faire ton choix mon enfant.'},
                          {cat: 'Histoires Maritimes',
                            //nom: 'Gwenaël',
                            phrasePerso: 'Le marin et ses histoires maritimes',
                            phraseDep: 'Place ton curseur sur un des points pour découvrir sa légende matelot !'}],
getPerso: (cat) => {
  for(perso of personnages.data) {
    if(perso.cat === cat) return perso;
  }
}};

/**
 * The main function in ASYNC.
 */
(async () => {
  // open database
  db = await open({filename: config.ROOT + config.DB_PATH, driver: sqlite3.Database});

  // SQL query to create the Departement table
  var sqlDepartement = `CREATE TABLE IF NOT EXISTS Departement (
    id INT PRIMARY KEY,
    nomDepartement VARCHAR(50) NOT NULL,
    frontiereMer VARCHAR(6) NOT NULL
  );`;

  // SQL query to create the Categorie table
  var sqlCategorie = `CREATE TABLE IF NOT EXISTS Categorie (
    id INT PRIMARY KEY,
    nomCategorie VARCHAR(30) NOT NULL,
    phrasePerso VARCHAR(250) NOT NULL,
    phraseDep VARCHAR(250) NOT NULL,
    imageURI VARCHAR(10)
  );`;
  // nomPersonnage VARCHAR(50) NOT NULL,

  // SQL query to create the Legende table
  var sqlLegende = `CREATE TABLE IF NOT EXISTS Legende (
    id INT PRIMARY KEY,
    nom VARCHAR(150) NOT NULL,
    departementId INT NOT NULL,
    categorieId INT NOT NULL,
    resume VARCHAR(250) NOT NULL,
    histoire VARCHAR(1000) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    adresse VARCHAR(200) NOT NULL,
    baignade BIT NOT NULL DEFAULT 0,
    toilettes BIT NOT NULL DEFAULT 0,
    restaurant BIT NOT NULL DEFAULT 0,
    photo VARCHAR(500),
    site VARCHAR(100),
    resume_lieu VARCHAR(1000) NOT NULL,
    nom_lieu VARCHAR(50) NOT NULL,
    FOREIGN KEY (departementId) REFERENCES Departement(id),
    FOREIGN KEY (categorieId) REFERENCES Categorie(id)
  );`;

  // If necessary
  //db.run('DROP TABLE IF EXISTS Departement;');
  //db.run('DROP TABLE IF EXISTS Categorie;');
  //db.run('DROP TABLE IF EXISTS Legende;');

  // Execute query
  db.run(sqlDepartement);
  db.run(sqlCategorie);
  db.run(sqlLegende);

  // If DB already existed, delete everything
  db.run("DELETE FROM Departement;");
  db.run("DELETE FROM Categorie;");
  db.run("DELETE FROM Legende;");

  // Fill the DB with the CSV content
  fs.createReadStream(config.ROOT + 'server/data.csv')
    .pipe(csv())
    .on('data', (row) => {
      var sql = '';
      if(!depList.includes(row.departement)) {
        // Insertion into Departement
        db.run(`INSERT INTO Departement VALUES (            
          ${row.numero_dep}, 
          '${(encodeURI(row.departement)).replace(/'/g, "`")}',
          '${depFrontiereMer.find((obj) => obj.dep === row.departement).mer}');\n`);
        depList.push(row.departement);
      }
      
      if(!catList.includes(row.categorie)) {
        let catPerso = personnages.getPerso(row.categorie);
        // Insersion into Categorie
        db.run(`INSERT INTO Categorie VALUES (
          ${countIdCat}, 
          '${(encodeURI(row.categorie)).replace(/'/g, "`")}',
          '${encodeURI(catPerso.phrasePerso)}',
          '${encodeURI(catPerso.phraseDep)}',
          '${encodeURI('assets/img/personnage/' + row.categorie.replace(' ', '_') + '.png')}');\n`);
        // '${encodeURI(catPerso.nom)}',
        catList.push(row.categorie);
        countIdCat++;
      }
      
      // Insertion into Legende
      sql = `INSERT INTO Legende VALUES (
          ${countIdLeg},
          '${(encodeURI(row.nom)).replace(/'/g, "`")}',
          ${row.numero_dep},
          ${catList.indexOf(row.categorie) + 1},
          '${(encodeURI(row.resume)).replace(/'/g, "`")}',
          '${(encodeURI(row.histoire)).replace(/'/g, "`")}',
          ${(row.latitude)},
          ${(row.longitude)},
          '${(encodeURI(row.adresse)).replace(/'/g, "`")}',
          ${(row.baignade === 'TRUE' ? 1 : 0)},
          ${(row.toilettes === 'TRUE' ? 1 : 0)},
          ${(row.restaurant === 'TRUE' ? 1 : 0)},
          '${(encodeURI(row.photo)).replace(/'/g, "`")}', 
          '${(encodeURI(row.site)).replace(/'/g, "`")}',
          '${(encodeURI(row.resume_lieu)).replace(/'/g, "`")}',
          '${(encodeURI(row.nom_lieu)).replace(/'/g, "`")}');\n`;
      if(verbose)console.log(sql);

      countIdLeg++;

      db.run(sql);
    })
    .on('end', () => {
      if(verbose) {
        console.log('CSV file successfully processed');
      }
    });

})();