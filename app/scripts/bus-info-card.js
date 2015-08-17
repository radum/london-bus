/* eslint vars-on-top:0 */

var defaults = {
    DEBUG: false
};

/**
 * BusInfoCard class
 * @param {object} options Stores info card options
 * @return {void}
 */
function BusInfoCard(options) {
    this.settings = $.extend({}, defaults, options);
    this._defaults = defaults;

    this.busStopCard = $('.bus-stop__card');
    this.busStopCardTitle = $('.bus-stop__card-title');
    this.busStopCardTitleText = $('.mdl-card__title-text');
    this.busStopInfoContainer = $('.bus-stop__info-container');
    this.busStopInfoTable = $('.bus-stop__info-table tbody');
    this.collapseIcon = $('.bus-stop__title-icon');

    this.state = {
        hidden: true,
        collapsed: false
    };

    this.init();
}

/**
 * Initialize the info card class (events)
 * @return {void}
 */
BusInfoCard.prototype.init = function() {
    this._initEvents();
};

/**
 * Show but stop information (live departures)
 * Generate the table rows based on data received.
 * @param  {object} busStopInfo Bus stop information
 * @param  {string} busStopName Bus stop name to show on card title
 * @return {void}
 */
BusInfoCard.prototype.showBusStopInfo = function(busStopInfo, busStopName) {
    $(this.busStopInfoTable).empty();

    $(this.busStopCardTitleText).html(busStopName);

    for (let arrival of busStopInfo.arrivals) {
        if (!arrival.isCancelled) {
            $(this.busStopInfoTable).append(`<tr><td class="mdl-data-table__cell--non-numeric"><img src="/images/bus-double-decker-18-25.png"/> ${arrival.routeName}</td><td class="mdl-data-table__cell--non-numeric">${arrival.estimatedWait}</td><td>${arrival.scheduledTime}</td></tr>`);
        }
    }

    if (this.state.collapsed) {
        this._changeState('collapsed');
    }

    this.show();
};

/**
 * Show the bus stop information card on screen
 * @return {void}
 */
BusInfoCard.prototype.show = function() {
    if (this.state.hidden) {
        $(this.busStopCard).removeClass('hidden');

        this.state.hidden = false;
    }
};

/**
 * Hide the bus stop information card on screen
 * @return {void}
 */
BusInfoCard.prototype.hide = function() {
    if (!this.state.hidden) {
        $(this.busStopCard).addClass('hidden');

        this.state.hidden = true;
    }
};

/**
 * Initialize bus stop information card events.
 * Toggle collapse state on click.
 * @return {void}
 */
BusInfoCard.prototype._initEvents = function() {
    $(this.busStopCardTitle).on('click', () => {
        this._changeState('collapsed');
    });
};

/**
 * Change bus stop information card state.
 * Collapse and / or visibility
 * @param  {state} state What state needs to be updated
 * @return {void}
 */
BusInfoCard.prototype._changeState = function(state) {
    if (state === 'collapsed') {
        if (!this.state.collapsed) {
            $(this.busStopInfoContainer).hide();
            $(this.collapseIcon).html('&#xE316;');

            this.state.collapsed = true;
        } else {
            $(this.busStopInfoContainer).show();
            $(this.collapseIcon).html('&#xE313;');

            this.state.collapsed = false;
        }
    }
};

export default BusInfoCard;
