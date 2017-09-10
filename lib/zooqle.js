var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');

module.exports = {
  search: function(query, zooqle_url, cat, page, limit) {
    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];
    var torrent_verified;
    var search_url = zooqle_url + '/search?q=' + encodeURIComponent(query) + '&sd=d';

    var options = {
      url: search_url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.79 Safari/537.36'
      }
    };


    request(options, function(err, response, body){

      if(!err && response.statusCode === 200){

        $ = cheerio.load(body);

        // console.log(body);
        if($('table.table-torrents tr').length > 2){
          $('table.table-torrents tr').each(function(index, torrents){
              var torrent_link;

              find_torrent_title = $(torrents).find('a.small');
              find_torrent_size = $(torrents).find('div.prog-blue');
              find_torrent_seeders = $(torrents).find('div.prog-green');
              find_torrent_leechers = $(torrents).find('div.prog-yellow');
              find_date_added = $(torrents).find('td.text-nowrap.text-muted.smaller');

              links = $(torrents).find('a');
              $(links).each(function(i, link){

                if($(link).attr('href').indexOf("magnet:?xt=urn:") > -1 && $(link).attr('href') !== null) {
                  torrent_link = $(link).attr('href');
                }

              });

              torrent_title = find_torrent_title.text();
              torrent_size = find_torrent_size.text();
              torrent_seed = find_torrent_seeders.text();
              torrent_leech = find_torrent_leechers.text();
              date_added = find_date_added.text();

            data_content = {
              torrent_num: count,
              title: torrent_title,
              category: '',
              seeds: torrent_seed,
              leechs: torrent_leech,
              size: torrent_size,
              torrent_link:  torrent_link,
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
        deferred.reject("There was a problem loading Zooqle");
      }

    });

    return deferred.promise;

  }
};
