/* eslint vars-on-top:0, camelcase:0 */

var defaults = {
    DEBUG: false,
    api_url: 'http://digitaslbi-id-test.herokuapp.com/bus-stops'
};

/**
 * BusStopsAPI class
 * @param {object} options Stores bus stop Api options
 * @return {void}
 */
function BusStopsAPI(options) {
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
}

/**
 * Get all bustops in current view
 * @param  {object} bounds Lat and Lng for the 2 bounds corners (NE and SW)
 * @return {promise}       Returns a promise of the ajax call
 */
BusStopsAPI.prototype.getBusStops = function(bounds) {
    var promise = $.getJSON(this.settings.api_url + '?northEast=' + bounds.northEast + '&southWest=' + bounds.southWest + '&callback=?');

    return promise;
};

/**
 * Get bus stop information
 * @param  {integer} busStopId Bus stop ID
 * @return {promise}           Returns a promise of the ajax call
 */
BusStopsAPI.prototype.getBusStopInfo = function(busStopId) {
    var promise = $.getJSON(this.settings.api_url + '/' + busStopId + '?callback=?');

    return promise;
};

export default BusStopsAPI;
