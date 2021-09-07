'use strict';
let cancel = false;

const
    EventEmitter = require('events')
    
  , sunxdccEvents = require('./sunxdcc-events.js')
  , sunxdccHttpClient = require('./sunxdcc-http-client.js')
  , sunxdccCache = require('./sunxdcc-cache.js')
  
  , emitter = new EventEmitter()
  
  , doSearch = (terms) => new Promise((resolve, reject) => {
        let results = []
		  , page = 0
          , compute = (resp) => new Promise((res, rej) => {
                if (!resp) {
                    return rej('empty sunxdcc reponse');
                }
                if (!resp.fname || !resp.fname.length || cancel) {
                    return res(results);
                }
				const mappedRes = resp.fname.map((fname, index) => ({
					fileName: fname,
					botNick: resp.bot[index],
					packId: resp.packnum[index],
					fileSize: resp.fsize[index],
					server: resp.network[index],
					channel: resp.channel[index],
				}))
                results = results.concat(mappedRes);
                emitter.emit(sunxdccEvents.progress, mappedRes);
                sunxdccHttpClient
                    .get(terms, ++page)
                    .then(compute)
                    .then(res)
                    .catch(rej)
                    ;
            })
          ;
        sunxdccHttpClient
            .get(terms, page)
            .then(compute)
            .then(resolve)
            .catch(reject)
            ;
    })
    
  , sunxdcc = {
        search: (terms, cached) => new Promise((resolve, reject) => {
            cancel = false;
            if(!terms) {
                return reject('no search terms provided');
            }
            if(cached) {
                let cache = sunxdccCache.get(terms);
                if (cache && cache.done) {
                    emitter.emit(sunxdccEvents.complete, cache.results);
                    return resolve(cache.results);
                }
            }
            doSearch(terms)
                .then((results) => {
                    if (!cancel) {
                        sunxdccCache.set(terms, results);
                    }
                    emitter.emit(sunxdccEvents.complete, results);
                    resolve(results);
                })
                .catch((err) => {
                    emitter.emit(sunxdccEvents.error, err);
                    reject(err);
                })
            ;
        })
      , clearCache: (terms) => {
            if(terms) {
                sunxdccCache.remove(terms);
            }
            else {
                sunxdccCache.clear();
            }
            return Promise.resolve();
        }
      , cancel: () => { 
            cancel = true;
            return Promise.resolve();
        }
      , events: sunxdccEvents
      , on: emitter.on.bind(emitter)
    }
  ;

module.exports = sunxdcc;