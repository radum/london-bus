/* eslint vars-on-top:0 */

var defaults = {
    DEBUG: false,
    api_url: 'http://digitaslbi-id-test.herokuapp.com/bus-stops'
};

function BusStopsAPI(options) {
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;
}

BusStopsAPI.prototype.getBusStops = function(bounds) {
    var promise = $.getJSON(this.settings.api_url + '?northEast=' + bounds.northEast + '&southWest=' + bounds.southWest + '&callback=?');

    return promise;
};

BusStopsAPI.prototype.getBusStopInfo = function(busStopId) {
    var promise = $.getJSON(this.settings.api_url + '/' + busStopId + '?callback=?');

    return promise;
};

export default BusStopsAPI;
