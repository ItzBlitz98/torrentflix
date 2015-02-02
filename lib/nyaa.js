var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');

module.exports = {
  search: function(query, cat, page, nyaa_url) {
    //http://www.nyaa.se/?page=search&term=Absolute+Duo&sort=2
    var torrent_search = query;
    var search_query = torrent_search.split(' ').join('+');

    var search_url = nyaa_url + "/?page=search&term=" + search_query + "&sort=2";

    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];

    request(search_url, function(err, response, body){

      if(!err && response.statusCode === 200){

        $ = cheerio.load(body);

        if($('.tlist').find('tr').length > "2"){
          $('.tlist tr.tlistrow').each(function(index, torrents){

            find_torrent_title = $(torrents).find('.tlistname a');
            find_torrent_link = $(torrents).find('.tlistdownload a');
            find_torrent_seed = $(torrents).find('.tlistsn');
            find_torrent_leech = $(torrents).find('.tlistln');
            find_torrent_size = $(torrents).find('.tlistsize');

            torrent_title = find_torrent_title.text();
            torrent_link = find_torrent_link.attr('href');
            torrent_seed = find_torrent_seed.text();
            torrent_leech = find_torrent_leech.text();
            torrent_size = find_torrent_size.text();

            data_content = {
              torrent_num: count,
              title: torrent_title,
              category: "",
              seeds: torrent_seed,
              leechs: torrent_leech,
              size: torrent_size,
              torrent_link: torrent_link
            };

            torrent_content.push(data_content);

            deferred.resolve(torrent_content);
            count++;

          });
        } else {
          deferred.reject("No torrents found");
        }
      } else {
        deferred.reject("There was a problem loading Nyaa");
      }


    });

    return deferred.promise;

  }
};
