#!/usr/bin/env node

var sunxdcc = require('./src/sunxdcc.js')
  , start
  , end
  ;
sunxdcc.on(sunxdcc.events.progress, function(results) {
    console.log('progress');
    console.log(results.length + ' results found');
});
sunxdcc.on(sunxdcc.events.complete, function(results) {
    console.log('complete');
    console.log(results.length + ' total results found');
});
start = process.hrtime();
sunxdcc.search('test')
    .then(function(results) {
        end = process.hrtime(start);
        start = process.hrtime();
        console.log(end);
        return sunxdcc.search('test', true);
    })
    .then(function(results) {
        end = process.hrtime(start);
        console.log(end);
        console.log('done');
        return sunxdcc.clearCache();
    })
    .then(function() {
        process.exit();
    })
    .catch(function(err) {
        console.error(err);
        err.stack && console.error(err.stack);
    });