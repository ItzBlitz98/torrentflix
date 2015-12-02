var request = require("request");
var cheerio = require('cheerio');
var Q = require('q');
var url = require("url");

module.exports = {
  torrentSearch: function(torrent_site) {

    var deferred = Q.defer();
    var theJar = request.jar();
    var options = {
        url: torrent_site,
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.43 Safari/537.36'
        }
    };


    request(options, function(err, response, body){

      if(!err && response.statusCode === 200){

        $ = cheerio.load(body);

        links = $(body).find('a');

        var magnet_link, torrent_link;
        $(links).each(function(i, link){
          if($(link).attr('href')){
            if($(link).attr('href').indexOf("magnet:?xt=urn:btih:") > -1) {
              magnet_link = $(link).attr('href');
              deferred.resolve(magnet_link);
            }
            else if($(link).attr('href').indexOf(".torrent") > -1) {
              torrent_link = $(link).attr('href');
              deferred.resolve(url.resolve(torrent_site, torrent_link));
            }
          }
        });

      if(!magnet_link && !torrent_link) {
        deferred.reject("No torrent found on the page");
      }


      } else {
        deferred.reject("There was a problem fetching the torrent link");
      }

    });

    return deferred.promise;
  }
};
