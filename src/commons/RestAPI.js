/** eslint verified */
import axios from 'axios';

class RestAPI {
  /** **************** */
  /** HOME INFORMATION */
  /** **************** */

  /**
   * Request anh areas list
   */
  static requestANHAreas() {
    return RestAPI.makeGetRequest('anh_areas');
  }

  /**
   * Request anh area from list
   *
   * @param name from anh areas list to be searched
   */
  static requestAreaSelected(name) {
    return RestAPI.makeGetRequest(`anh_areas/${name}`);
  }

  /**
   * Request sedimentary basins list
   */
  static requestSedimentaryBasins() {
    return RestAPI.makeGetRequest('sedimentary_basins');
  }

  /** ******************* */
  /** SUMMARY INFORMATION */
  /** ******************* */


  /**
   * Request area geometry by name
   *
   * @param {String} name anh area to request geometry divided by biomes
   */
  static requestGeometryByArea(name) {
    return RestAPI.makeGetRequest(`anh_areas/${name}/geometry`);
  }


  /**
   * Request area geometry with biomes by name
   *
   * @param {String} name anh area to request geometry divided by biomes
   */
  static requestBiomesGeometryWithArea(name) {
    return RestAPI.makeGetRequest(`anh_areas/${name}/biomes/geometry`);
  }

  /**
   * Request biomes data for graphs by name
   *
   * @param {String} name anh area to request biomes data
   */

  static requestBiomesDataByArea(name) {
    return RestAPI.makeGetRequest(`anh_areas/${name}/biomes`);
  }

  /** ********************** */
  /** INDICATORS INFORMATION */
  /** ********************** */

  /**
   * Request indicators list by area
   *
   * @param {String} name name area to request
   * @param {String} indicatorIds string with all ids in area to request in query param structure
   */
  static requestIndicatorsByArea(name, indicatorIds) {
    if (indicatorIds) return RestAPI.makeGetRequest(`anh_areas/${name}/indicators?${indicatorIds}`);
    return RestAPI.makeGetRequest(`anh_areas/${name}/indicators`);
  }

  /**
   * Request indicators metadata by its id
   *
   * @param {String} id indicator id to request
   */
  static requestMetadataById(id) {
    return RestAPI.makeGetRequest(`indicators/${id}/metadata`);
  }

  /** ******************************** */
  /**    INDICATORS GEOMETRY DETAILS   */
  /** ******************************** */

  /**
   * Request geometry related to an id or many ids
   *
   * @param {String} geographicIds string with all geographic ids to be displayed on the MapViewer
   */
  static requestGeometryByGid(geographicIds) {
    if (geographicIds) return RestAPI.makeGetRequest(`indicators/geometry?${geographicIds}`);
    return Promise.reject(Error('Ids are required to get indicators geometries'));
  }

  /** ***************************** */
  /** API GENERAL REQUEST STRUCTURE */
  /** ***************************** */

  /**
   * Request an endpoint through a GET request
   *
   * @param {String} endpoint endpoint to attach to url
   * @param {String} options parameters included in url
   */
  static makeGetRequest(endpoint, options) {
    return axios.get(RestAPI.getEndpointUrl(endpoint), options)
      .then((res) => res.data)
      .catch((error) => {
        let message = 'Bad GET response. Try later';
        if (error.response) message = error.response.status;
        if (error.request && error.request.statusText === '') message = 'no-data-available';
        return Promise.reject(message);
      });
  }

  /**
   * Request an endpoint through a POST request
   *
   * @param {String} endpoint endpoint to attach to url
   * @param {Object} requestBody JSON object with the request body
   */
  static makePostRequest(endpoint, requestBody) {
    return axios.post(RestAPI.getEndpointUrl(endpoint), requestBody)
      .then((res) => res.data)
      .catch((error) => {
        let message = 'Bad POST response. Try later';
        if (error.response) message = error.response.status;
        if (error.request.statusText === '') message = 'no-data-available';
        return Promise.reject(message);
      });
  }

  /**
   * Return the entire URL endpoint
   *
   * @param {String} endpoint endpoint to attach to url
   */
  static getEndpointUrl(endpoint) {
    return `${process.env.REACT_APP_REST_HOST}/${endpoint}`;
  }
}

export default RestAPI;
