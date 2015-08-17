/* eslint vars-on-top:0 */

require('babelify/polyfill');

import BusMapper from './bus-mapper';

var app = new BusMapper({
    DEBUG: false
});

app.init();
