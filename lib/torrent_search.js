var request = require("request");
var cheerio = require('cheerio');
var Q = require('q');

module.exports = {
  torrentSearch: function(torrent_site) {

    var deferred = Q.defer();

    request(torrent_site, function(err, response, body){

      if(!err && response.statusCode === 200){

        $ = cheerio.load(body);

        links = $(body).find('a');

        $(links).each(function(i, link){
          if($(link).attr('href').indexOf("magnet:?xt=urn:btih:") > -1) {
            magnet_link = $(link).attr('href');
            deferred.resolve(magnet_link);
          }
        });


      } else {
        deferred.reject("There was a problem fetching the torrent link");
      }

    });

    return deferred.promise;
  }
};
