var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');
var moment = require('moment');

module.exports = {
  search: function(query, xbit_url, cat, page, limit) {

    var torrent_search = query;
    var search_query = torrent_search.split(' ').join('+');

    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];

    //get token
    var url = xbit_url + "/api?search=" + encodeURIComponent(query);
    request(url, function (err, response, body) {
        if (!err && response.statusCode === 200) {

          data = JSON.parse(body);

          if(data.dht_results.length > 1){

            for(var torrent in data.dht_results){

              var title = data.dht_results[torrent].NAME;
              var torrent_link = data.dht_results[torrent].MAGNET;
              var size = data.dht_results[torrent].SIZE;
              var date_added = data.dht_results[torrent].DISCOVERED;
              //not supported
              var seeds = "";
              var leechs = "";

              data_content = {
                torrent_num: count,
                title: title,
                category: "",
                seeds: seeds,
                leechs: leechs,
                size: size,
                torrent_link: torrent_link,
                date_added: date_added
              };

              if (title) {
                torrent_content.push(data_content);
              }


              deferred.resolve(torrent_content);
              // like break
              if (++count > limit) { return false; }

            }
          }else {
            deferred.reject("No torrents found");
          }

        } else {
          deferred.reject("There was a problem loading x[BiT]");
        }
    });

    return deferred.promise;

  }
};
