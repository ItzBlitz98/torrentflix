var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');
var moment = require('moment');

module.exports = {
  search: function(query, leetx_url) {

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

        if($('.tab-detail ul li').length > 0){
          $('.tab-detail ul li').each(function(index, torrents){
            var d = $(this);
            var div = d.children('div');
            links = $(torrents).find('a');

            $(links).each(function(i, link){
              if($(link).attr('href').indexOf("/torrent/") > -1) {
                leetx_link = $(link).attr('href');
                torrent_title = $(link).text();
                torrent_size = $(div).eq(3).text();
                torrent_seeds = $(div).eq(1).text();
                torrent_leech = $(div).eq(2).text();

                //torrent_site
                data_content = {
                  torrent_num: count,
                  title: torrent_title,
                  category: "",
                  seeds: torrent_seeds,
                  leechs: torrent_leech,
                  size: torrent_size,
                  torrent_site: leetx_url + leetx_link,
                  date_added: ""
                };

                torrent_content.push(data_content);

                deferred.resolve(torrent_content);
                count++;


              }
            });

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
