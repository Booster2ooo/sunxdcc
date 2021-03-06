'use strict';
const
    // node native
    http = require('http')
    
  , defaultRequestOptions = {
        method: 'GET'
      , hostname: 'sunxdcc.com'
      , port: 80
      , path: '/deliver.php'
    }

  , handlers = {
        data: (httpChunks, chuck) => {
            httpChunks.push(chuck);
        }
      , end: (httpChunks, resolve) => {
            const
                body = Buffer.concat(httpChunks)
              , content = body.toString()
              , result = content ? JSON.parse(content) : []
              ;
            return resolve(result);
        }
      , error: (reject, err) => {
            return reject(err);
        }
    }
    
  , sunxdccHttpClient = {
        get: (terms, pageIndex) => new Promise((resolve, reject) => {                
            const 
                options = Object.assign({}, defaultRequestOptions)
              , httpChunks = []
              ;
            let request;
            options.path += `?sterm=${encodeURIComponent(terms)}&page=${pageIndex}`;
			request = http.request(options, (response) => {
                if (response.statusCode  != 200) {
                    return reject(`Bad response for ${options.path} - status: ${response.statusCode}`);
                }
                response.on('data', handlers.data.bind(null, httpChunks) );
                response.on('end', handlers.end.bind(null, httpChunks, resolve) );
            });
            request.on('error', handlers.error.bind(null, reject) );
            request.end();
        })
    }
  ;
  
module.exports = sunxdccHttpClient;