/* global L */
/* eslint vars-on-top:0 */

import BusStopsAPI from './bus-stops-api';
import BusStopsPool from './bus-stops-pool';
import BusInfoCard from './bus-info-card';

var defaults = {
    DEBUG: false,
    appName: 'London Buses',
    'images-path': '/images',
    'leaflet-images-path': '/images/leaflet',
    minZoomLevel: 16,
    maxZoomLevel: 20,
    initialZoomLevel: 16,
    errMsgToFar: 'Please zoom in to see the stations!'
};

/**
 * BussMapper class
 * @param {object} options Stores app options
 * @return {void}
 */
function BusMapper(options) {
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;

    // Cache selectors
    this.locatBtn = $('.locate-btn');
    this.headerContainer = $('.mdl-layout__header');
    this.headerTitle = $(this.headerContainer).find('.mdl-layout-title');

    this.busStopsAPI = new BusStopsAPI({
        DEBUG: this.settings.DEBUG
    });

    this.busStopsPool = new BusStopsPool({
        DEBUG: this.settings.DEBUG
    });

    this.busInfoCard = new BusInfoCard({
        DEBUG: this.settings.DEBUG
    });

    this.zoomLevel = 16;

    // Initialize the map
    this._initMap();
    this._initMapEvents();
}

/**
 * Initialize app by trying to locate position
 * @return {void}
 */
BusMapper.prototype.init = function() {
    this.initLocation();
};

/**
 * Initialize location. Try to locate position (permision will be required). And initalize locate button event.
 * @return {void}
 */
BusMapper.prototype.initLocation = function() {
    this.map.locate({
        setView: true,
        maxZoom: this.settings.initialZoomLevel,
        timeout: 15000
    });

    $(this.locatBtn).on('click', () => {
        this.map.locate({
            setView: true,
            maxZoom: this.settings.initialZoomLevel,
            timeout: 15000,
            enableHighAccuracy: true
        });
    });
};

/**
 * Refresh the markers on the map. Call the bus stops API based on the current map view
 * and start adding the markers on the map.
 * @return {void}
 */
BusMapper.prototype.refreshBusStopsOnMap = function() {
    var mapBounds = this.map.getBounds();

    // Show bus stops in current view
    this.busStopsAPI.getBusStops({
        northEast: mapBounds._northEast.lat + ',' + mapBounds._northEast.lng,
        southWest: mapBounds._southWest.lat + ',' + mapBounds._southWest.lng
    }).done((data) => {
        this._addBusStopsOnMap(data.markers);
    }).fail(() => {
        this.settings.DEBUG && console.error('getBusStops failed');
    });
};


/**
 * Add the bus stops on the map as markers.
 * Before starting to add markers, remove the out of bounds ones first.
 * @param  {array} busStopsArr Array of markers from the current map view
 * @return {void}
 */
BusMapper.prototype._addBusStopsOnMap = function(busStopsArr) {
    var mapMarker = null;
    var newBusStopsArr = this._cacheCleanBusStops(busStopsArr);

    for (let busStop of newBusStopsArr) {
        mapMarker = L.marker([busStop.lat, busStop.lng], {
            icon: this.busIcon,
            busStopId: busStop.id
        }).addTo(this.map);

        mapMarker.bindPopup(`<div style="text-align: center;"><b>${busStop.name}</b></div>`);

        mapMarker.on('popupopen', (marker) => {
            this.map.setView(marker.target._latlng);
            this._showBusStopInfo(marker.target.options.busStopId, busStop.name);
        });

        this.busStopsPool.add({
            busStopInfo: busStop,
            busStopMapMarker: mapMarker
        });
    }
};

/**
 * Clean unused markers from the pool and from the map. While also ignoring the ones already there.
 * This will help with performance while moving and zoomiing the map.
 * @param  {array} busStopsArr Array of markers from the current map view
 * @return {array}             Array of new markers that need to be added.
 */
BusMapper.prototype._cacheCleanBusStops = function(busStopsArr) {
    var newBusStopsArr = [];
    var oldBusStopsIdsArr = [];

    for (let busStop of busStopsArr) {
        if (!this.busStopsPool._busStops[busStop.id]) {
            newBusStopsArr.push(busStop);
        } else {
            oldBusStopsIdsArr.push(busStop.id);
        }
    }

    for (let id in this.busStopsPool._busStops) {
        if (oldBusStopsIdsArr.indexOf(id) === -1) {
            this.map.removeLayer(this.busStopsPool._busStops[id].busStopMapMarker);
            this.busStopsPool.remove(id);
        }
    }

    return newBusStopsArr;
};

/**
 * Show bus stop information (departures) on marker click.
 * @param  {integer} busStopId   The bus stop ID (comes from the API)
 * @param  {string} busStopName Bus stop name to display on card title
 * @return {void}
 */
BusMapper.prototype._showBusStopInfo = function(busStopId, busStopName) {
    this.busStopsAPI.getBusStopInfo(busStopId).done((busStopInfo) => {
        this.busInfoCard.showBusStopInfo(busStopInfo, busStopName);
    });
};

/**
 * Initialize the map and map settings on app load.
 * Create the bus icon for the map and add the Mapbox layer.
 * @return {void}
 */
BusMapper.prototype._initMap = function() {
    // set defaults
    L.Icon.Default.imagePath = this.settings['leaflet-images-path'];

    this.map = L.map('map');

    this.busIcon = L.icon({
        iconUrl: this.settings['images-path'] + '/bus-icon25x25.png',
        iconSize: [25, 25],
        iconAnchor: [13, 13],
        popupAnchor: [-1, -15]
    });

    this.busIconGrey = L.icon({
        iconUrl: this.settings['images-path'] + '/bus-icon-grey25x25.png',
        iconSize: [25, 25],
        iconAnchor: [13, 13],
        popupAnchor: [-1, -15]
    });

    // Add MapBox tile layer on map
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data via <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: this.settings.maxZoomLevel,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoicmFkdW16YSIsImEiOiI1MGRjZDBkYzQ3YzRmNTAwNjVhYWJjNmMyYzI3YzFmZiJ9.TKXmRXULFN2ACbLCgq9Dtg'
    }).addTo(this.map);

    // Set initial map view to central london
    this.map.setView([51.505, -0.09], this.settings.initialZoomLevel);
};

/**
 * Initialize map events for UI interaction.
 * @return {void}
 */
BusMapper.prototype._initMapEvents = function() {
    this.map.on('moveend', () => {
        this.settings.DEBUG && console.info('map movedend');

        if (this.zoomLevel >= this.settings.minZoomLevel) {
            this.refreshBusStopsOnMap();

            this.notify('default', '');
        } else {
            this.notify('error', this.settings.errMsgToFar);
        }
    });

    this.map.on('zoomend', () => {
        this.settings.DEBUG && console.info('map zoomend ' + this.map.getZoom());

        this.zoomLevel = this.map.getZoom();
    });

    this.map.on('click', () => {
        this.busInfoCard.hide();
    });

    this.map.on('load', () => {
        this.settings.DEBUG && console.info('map loaded');
    });

    this.map.on('locationfound', () => {
        this.settings.DEBUG && console.info('location found');

        this.refreshBusStopsOnMap();
    });

    this.map.on('locationerror', () => {
        this.settings.DEBUG && console.info('location error');

        this.map.setView([51.505, -0.09], this.settings.initialZoomLevel);
    });
};

/**
 * Change header style and text on request
 * @param  {string} type Type of message (error, default)
 * @param  {string} msg  Message text to display on header title.
 * @return {void}
 */
BusMapper.prototype.notify = function(type, msg) {
    if (type === 'error') {
        $(this.headerContainer).addClass('mdl-layout__header--error');
        $(this.headerTitle).html(msg);
    } else {
        $(this.headerContainer).removeClass('mdl-layout__header--error');
        $(this.headerTitle).html(this.settings.appName);
    }
};

export default BusMapper;
