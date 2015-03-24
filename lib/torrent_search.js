var request = require("request");
var cheerio = require('cheerio');
var Q = require('q');

module.exports = {
  torrentSearch: function(torrent_site) {

    var deferred = Q.defer();
    var theJar = request.jar();
    var options = {
        url: torrent_site,
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.43 Safari/537.36'
        },
        jar: theJar
    };
    
    theJar.setCookie('7fAY799j=VtdTzG69', torrent_site, {"ignoreError":true});

    request(options, function(err, response, body){

      if(!err && response.statusCode === 200){

        $ = cheerio.load(body);

        links = $(body).find('a');

        $(links).each(function(i, link){
          if($(link).attr('href')){
            if($(link).attr('href').indexOf("magnet:?xt=urn:btih:") > -1) {
              magnet_link = $(link).attr('href');
              deferred.resolve(magnet_link);
            }
          }
        });


      } else {
        deferred.reject("There was a problem fetching the torrent link");
      }

    });

    return deferred.promise;
  }
};
