/* global L */
/* eslint vars-on-top:0 */

import BusStopsAPI from './bus-stops-api';
import BusStopsPool from './bus-stops-pool';
import BusInfoCard from './bus-info-card';

var defaults = {
    DEBUG: false,
    'images-path': '/images',
    'leaflet-images-path': '/images/leaflet',
    minZoomLevel: 15,
    maxZoomLevel: 20,
    initialZoomLevel: 16
};

function BusMapper(options) {
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;

    // Cache selectors
    this.locatBtn = $('.locate-btn');

    this.busStopsAPI = new BusStopsAPI({
        DEBUG: this.settings.DEBUG
    });

    this.busStopsPool = new BusStopsPool({
        DEBUG: false
    });

    this.busInfoCard = new BusInfoCard({
        DEBUG: false
    });

    this.zoomLevel = 16;

    // Initialize the map
    this._initMap();
    this._initMapEvents();
}


BusMapper.prototype.init = function() {
    // Set defaults
    $.mCustomScrollbar.defaults.scrollButtons.enable = true;
    $.mCustomScrollbar.defaults.axis = 'y';

    $('.bus-stop__info-container').mCustomScrollbar({theme: 'minimal-dark'});

    this.initLocation();
};

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
            // console.log(marker);
            this.map.setView(marker.target._latlng);
            this._showBusStopInfo(marker.target.options.busStopId, busStop.name);
        });

        this.busStopsPool.add({
            busStopInfo: busStop,
            busStopMapMarker: mapMarker
        });
    }
};

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

BusMapper.prototype._showBusStopInfo = function(busStopId, busStopName) {
    this.busStopsAPI.getBusStopInfo(busStopId).done((busStopInfo) => {
        this.busInfoCard.showBusStopInfo(busStopInfo, busStopName);
    });
};

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

BusMapper.prototype._initMapEvents = function() {
    this.map.on('moveend', () => {
        this.settings.DEBUG && console.info('map movedend');

        if (this.zoomLevel >= this.settings.minZoomLevel) {
            this.refreshBusStopsOnMap();
        }
    });

    this.map.on('zoomend', () => {
        this.settings.DEBUG && console.info('map zoomend ' + this.getZoom());

        this.zoomLevel = this.getZoom();
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

export default BusMapper;
