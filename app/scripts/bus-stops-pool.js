/* eslint vars-on-top:0 */

var defaults = {
    DEBUG: false,
};

function BusStopsPool(options) {
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;

    this._busStops = {};
}

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

BusStopsPool.prototype.remove = function(id) {
    this.settings.DEBUG && console.log('busStopMapMarker removed ' + id);

    return delete this._busStops[id];
};

export default BusStopsPool;
