var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');
var moment = require('moment');

module.exports = {
  search: function(query, leetx_url, cat, page, limit) {

    var torrent_search = query;
    var search_query = torrent_search.split(' ').join('+');
    var search_url = leetx_url + "/search/" + search_query + "/1/";
    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];

    request(search_url, function(err, response, body){

      if(!err && response.statusCode === 200){

        var leetx_link, torrent_title, torrent_size, torrent_seeds, torrent_leech, date_added;

        $ = cheerio.load(body);

        if($('.table-list tbody').length > 0){
          $('.table-list tbody tr').each(function(index, torrents) {

            var torrent_site = $(torrents).find('.name a').next().attr('href');
            var title = $(torrents).find('.name').text();
            var seeds = $(torrents).find('.seeds').text();
            var leechs = $(torrents).find('.leeches').text();
            var size = $(torrents).find('td.coll-4').text();
            var date_added = $(torrents).find('.coll-date').text();

            data_content = {
              torrent_num: count,
              title: title,
              category: "",
              seeds: seeds,
              leechs: leechs,
              size: size,
              torrent_site: leetx_url + torrent_site,
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
        deferred.reject("There was a problem loading 1337x");
      }

    });

    return deferred.promise;

  }
};
