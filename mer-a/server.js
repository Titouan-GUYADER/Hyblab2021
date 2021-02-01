// Use strict mode
'use strict';

/**
 * This file contains the server handling.
 */

/**
 * Imports/Constants definition
 */
const express = require('express');
const path = require('path');

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// Load server CONFIG variables
const config = require('./server/config.js');
console.log(config);

// Load useful classes
const Legende = require('./server/classes/Legende.js');

/**
 * Variables definition
 */
// Create the application object
let app = express();

let db = null;

/**
 * Function that decode the strings of of an object with decodeURI().
 * @param {object} obj object to decode.
 */
function decodeURIObject(obj) {
  for(let attr in obj)
    if(typeof(obj[attr])==='string')
      obj[attr] = decodeURI(obj[attr]);
  return obj;
}


/**
 * Function called on load to open the link with the database.
 */
(async () => {
  db = await open({filename: config.ROOT + config.DB_PATH, driver: sqlite3.Database});
})();

/**
 * Route API/all/regions that returns all the content of the table Departement.
 */
app.get(`${config.API_URL}all/regions`, async (req, res) => {
  // Query SQL
  let sql = 'SELECT * FROM DEPARTEMENT;'
  const rows = await db.all(sql, []);
  // Process data
  rows.forEach((row) => {
    // Decode
    decodeURIObject(row);
  });
  console.log(rows);
  // Send data
  res.status(200).json(rows);
});

/**
 * Route API/all/types that returns all the content of the table Categorie.
 */
app.get(`${config.API_URL}all/types`, async (req, res) => {
  // Query SQL
  let sql = 'SELECT * FROM CATEGORIE;'
  const rows = await db.all(sql, []);
  // Process data
  rows.forEach((row) => {
    // Decode
    decodeURIObject(row);
  });
  console.log(rows);
  // Send data
  res.status(200).json(rows);
});

/**
 * Route API/legende/:id that returns the legend with the corresponding ID.
 * @param {number} id the id of the legend requested.
 */
app.get(`${config.API_URL}legende/:id`, async (req, res) => {
    // Query SQL
    var sql = `SELECT Legende.id as idLegende, Departement.id as idDepartement, Categorie.id as idCategorie, Legende.nom as nom, departementId, categorieId,
    resume, histoire, latitude, longitude, adresse, baignade, toilettes, restaurant,
    photo, site, resume_lieu, nom_lieu, nomDepartement, nomCategorie, imageURI
    FROM Legende INNER JOIN Departement ON Departement.id = departementId
    INNER JOIN Categorie ON Categorie.id = categorieId WHERE Legende.id = ?; `;

    const row = await db.get(sql, [req.params.id]);

    // Process data
    // Decode
    decodeURIObject(row);
    console.log(row);
    //Send data
    res.status(200).json(row);
});

/**
 * Route API/:region_id/:type_id that returns all the legends in the region of region_id and with the type of type_id.
 * @param {number} region       the id of the region requested.
 * @param {number} typeHistoire the id of the type requested.
 */
app.get(`${config.API_URL}:region/:typeHistoire`, async (req, res) => {
    // Declaration of the variables
    var legendes = [];
    var sql = `SELECT Legende.id as id, Legende.nom as nom, departementId, categorieId,
    resume, histoire, latitude, longitude, adresse, baignade, toilettes, restaurant,
    photo, site, resume_lieu, nom_lieu, nomDepartement, nomCategorie, imageURI
    FROM Legende INNER JOIN Departement ON Departement.id = departementId
                INNER JOIN Categorie ON Categorie.id = categorieId WHERE departementId = ?
                AND categorieId = ?;`;
    console.log(sql + `\ndep: "${req.params.region}",\ncat: "${req.params.typeHistoire}"`);

    // Get the query result
    const rows = await db.all(sql, [req.params.region, req.params.typeHistoire]);
    // Process the query result
    rows.forEach((row) => {
      // Decode
      decodeURIObject(row);
      // Cast to Legende
      var legende = new Legende(
          row.id,
          row.nom, 
          row.nomDepartement,
          row.nomCategorie,
          row.resume, 
          row.histoire, 
          row.latitude, 
          row.longitude, 
          row.adresse,
          (row.baignade === 1 ? true : false), 
          (row.toilettes === 1 ? true : false), 
          (row.restaurant === 1 ? true : false), 
          row.photo, 
          row.site, 
          row.resume_lieu, 
          row.nom_lieu);
      legendes.push(legende);
    });
    // Show and send processed query result
    console.log(legendes);
    res.status(200);
    res.json({data:legendes});
});

// Minimum routing: serve static content from the html directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../__common-logos__')));

// You can then add whatever routing code you need

// This module is exported and served by the main server.js located
// at the root of this set of projects. You can access it by lanching the main
// server and visiting http(s)://127.0.0.1:8080/name_of_you_project/ (if on a local server)
// or more generally: http(s)://server_name:port/name_of_you_project/

// Pour lancer depuis mer-a (npm start)
//app.listen(8080);

//Pour lancer depuis Hyblab2021 / racine (npm start)
module.exports = app;
