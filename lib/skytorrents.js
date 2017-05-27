var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');

module.exports = {
  search: function(query, skytorrents_url, cat, page, limit) {

    var torrent_search = query;
    var search_query = torrent_search.split(' ').join('+');

    var search_url = skytorrents_url + "/search/all/ed/1/?l=en-us&q=" + search_query;
    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];
    var link_content = [];

    request(search_url, function(err, response, body){

      if(!err && response.statusCode === 200){

        $ = cheerio.load(body);

        if($('table.table.is-striped.is-narrow tr').length > 0) {

          $('table.table.is-striped.is-narrow tr').each(function(index, torrents){
            var torrent_title, torrent_link, torrent_verified;

            if($(torrents).find('a').text()){
              find_torrent_title = $(torrents).find('td a');
              find_torrent_seed = $(torrents).find('td').next().next().next().next();
              find_torrent_leech = $(torrents).find('td').next().next().next().next().next();
              find_torrent_size = $(torrents).find('td.is-hidden-touch');
              find_torrent_date = $(torrents).find('td.is-hidden-touch').next().next();

              torrent_title = find_torrent_title.first().text();
              torrent_leech = find_torrent_leech.first().text();
              torrent_seed = find_torrent_seed.first().text();
              torrent_size = find_torrent_size.first().text();
              date_added = find_torrent_date.first().text();

              links = $(torrents).find('td a')[2];

              $(links).each(function(i, link){

                if($(link).attr('href').indexOf("magnet:?xt=urn:") > -1) {
                  torrent_link = $(link).attr('href');
                }

              });

              data_content = {
                torrent_num: count,
                title: torrent_title,
                category: "",
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

            }

          });

        } else {
          deferred.reject("No torrents found");
        }
      } else {
        deferred.reject("There was a problem loading Sky Torrents");
      }


    });

    return deferred.promise;

  }
};
