var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');

module.exports = {
  search: function(query, kickass_url, cat, page, limit) {
    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];
    var torrent_verified;
    var search_url = kickass_url + '/usearch/' + encodeURIComponent(query) + '/?field=seeders&sorder=desc';
    request(search_url, function(err, response, body){

      if(!err && response.statusCode === 200){

        $ = cheerio.load(body);

        if($('table.data tr.odd').length > 2){
          $('table.data tr.odd').each(function(index, torrents){

              find_torrent_link = $(torrents).find('a.icon16');
              find_torrent_title = $(torrents).find('a.cellMainLink');
              find_torrent_size = $(torrents).find('td.nobr.center');
              find_torrent_seeders = $(torrents).find('td.green');
              find_torrent_leechers = $(torrents).find('td.red');
              find_date_added = $(torrents).find('td.center').next().attr('title');

              //torrent_link = find_torrent_link.attr('href');
              torrent_title = find_torrent_title.text();
              torrent_size = find_torrent_size.text();
              torrent_seed = find_torrent_seeders.text();
              torrent_leech = find_torrent_leechers.text();
              date_added = find_date_added;
              torrent_link = find_torrent_link.next().attr('href');


            data_content = {
              torrent_num: count,
              title: torrent_title,
              category: '',
              seeds: torrent_seed,
              leechs: torrent_leech,
              size: torrent_size,
              torrent_link: torrent_link,
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
        deferred.reject("There was a problem loading KickassTorrents");
      }

    });

    return deferred.promise;

  }
};
