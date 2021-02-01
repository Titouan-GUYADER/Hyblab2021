'use strict';

/**
 * File that provides functions to request data from the API.
 */

/**
 * Used to retrieve the legends corresponding to the region and the type passed in parameter.
 * @param {number}      region      id of selected region.
 * @param {number}      type        id of selected type.
 * @param {function}    callback    function called when the data has been retrieved.
 * @return                          a Promise.
 */
async function getLegendes(region, type, callback) {
    // Retrieve data
    let result = (await (await fetchAsync(router.ROOT + router.API_URL + encodeURI(region) + '/' + encodeURI(type), 'GET')).json());
    //Data manipulation
    let legendes = [];
    for(let l of result.data) {
        legendes.push(new Legende(l.id, l.nom, l.departement, l.categorie, l.resume, l.histoire, l.latitude, l.longitude, l.adresse, l.baignade, l.toilettes, l.restaurant, l.photo, l.site, l.resume_lieu, l.nom_lieu));
    }
    // Transmit data
    callback(legendes);
    return legendes;
}

/**
 * Used to retrieve all the regions.
 * @param {function}    callback    function called when the data has been retrieved.
 * @return                          a Promise.
 */
async function getRegionsId(callback) {
    // Retrieve data
    let result = (await (await fetchAsync(router.ROOT + router.API_URL + router.API_REGIONS_ID, 'GET')).json());
    // Transmit data
    callback(result);
    return result;
}

/**
 * Used to retrieve all the types.
 * @param {function}    callback    function called when the data has been retrieved.
 * @return                          a Promise.
 */
async function getTypesId(callback) {
    // Retrieve data
    let result = (await (await fetchAsync(router.ROOT + router.API_URL + router.API_TYPES_ID, 'GET')).json());
    // Transmit data
    callback(result);
    return result;
}

/**
 * Used to retrieve the legend with the corresponding id.
 * @param {number}      id          id of selected legend.
 * @param {function}    callback    function called when the data has been retrieved.
 * @return                          a Promise.
 */
async function getLegendeById(id, callback) {
    // Retrieve data
    let result = (await (await fetchAsync(router.ROOT + router.API_URL + router.API_LEGENDE + id, 'GET')).json());
    // Transmit data
    callback(result);
    return result;
}

/**
 * Déclaration de la fonction permettant de récupérer le résultat d'une URL
 * @param {string} url      the url from which data must be retieved.
 * @param {string} method   the resquest method (GET, POST, ...).
 * @return                          a Promise.
 */
async function fetchAsync(url, method) {
    let options = null;
    if (method) {
        options = {method: method};
    }
    let fetch_res = await fetch(url, options);
    if (fetch_res.ok)
        return fetch_res;
    else {
        if (fetch_res.status === 401) {
            //...
        }
        console.error(await fetch_res.text());
    }
}
