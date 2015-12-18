var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');
var moment = require('moment');

module.exports = {
  search: function(query, cpasbien_url, cat, page, limit) {

    var torrent_search = query;
    var search_query = torrent_search.split(' ').join('-');
    var search_url = cpasbien_url + "/recherche/" + search_query + ".html";
    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];

    request(search_url, function(err, response, body){
    
      if(!err && response.statusCode === 200){

        var cpasbien_link, torrent_title, torrent_size, torrent_seeds, torrent_leech, date_added;
        $ = cheerio.load(body);

        if($("div .ligne0").length > 0) {

          $("div[class^='ligne']").each(function(index, torrent){
            cpasbien_link = $(torrent).children("a").attr('href');
            torrent_title = $(torrent).children("a").text();
            torrent_size = $(torrent).children(".poid").text();
            torrent_seeds = $(torrent).find(".seed_ok").text();
            torrent_leech = $(torrent).find(".down").text();
            date_added = undefined;

            data_content = {
              torrent_num: count,
              title: torrent_title,
              category: "",
              seeds: torrent_seeds,
              leechs: torrent_leech,
              size: torrent_size,
              torrent_site: cpasbien_link,
              date_added: date_added
            };

            torrent_content.push(data_content);

            deferred.resolve(torrent_content);
            // like break
            if (++count > limit) { return false; }
          });

        } else {
          deferred.reject("No torrents found");
        }

      } else {
        deferred.reject("There was a problem loading Cpasbien");
      }

    });

    return deferred.promise;

  }
};
