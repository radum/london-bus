/* eslint vars-on-top:0 */

var defaults = {
    DEBUG: false
};

/**
 * BusStopsPool class. Stores current bus stops and caches them.
 * @param {object} options Stores bus stops pool options
 * @return {void}
 */
function BusStopsPool(options) {
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;

    this._busStops = {};
}

/**
 * Add bus stop to pool
 * @param  {object} busStopMap Bus stop information
 * @return {string}            Bus stop ID
 */
BusStopsPool.prototype.add = function(busStopMap) {
    var id = busStopMap.busStopInfo.id;

    if (!this._busStops[id]) {
        this._busStops[id] = busStopMap;

        this.settings.DEBUG && console.log('busStopMap item added ' + id);
    } else {
        this.settings.DEBUG && console.log('busStopMap item already exists ' + id);
    }

    return id;
};

/**
 * Remove bus stop from pool
 * @param  {string} id Bus stop ID
 * @return {void}
 */
BusStopsPool.prototype.remove = function(id) {
    this.settings.DEBUG && console.log('busStopMapMarker removed ' + id);

    return delete this._busStops[id];
};

export default BusStopsPool;
