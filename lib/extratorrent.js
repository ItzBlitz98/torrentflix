var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');

module.exports = {
  search: function(query, cat, page, extratorrent_url) {

    var torrent_search = query;
    var search_query = torrent_search.split(' ').join('+');

    var search_url = extratorrent_url + "/search/?search=" + search_query + "&new=1&x=0&y=0";

    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];

    request(search_url, function(err, response, body){

      if(!err && response.statusCode === 200){

        $ = cheerio.load(body);
        
        if($('.tl').find('tr').length > "3"){
          $('.tl tr').each(function(index, torrents){

            if($(torrents).find('td a').attr('href') !== '#'){

              find_torrent_link = $(torrents).find('td a');
              find_torrent_title = find_torrent_link.attr('title');
              torrent_download = find_torrent_link.attr('href');
              find_torrent_size = $(torrents).find('td');
              find_torrent_seed = $(torrents).find('td.sy');
              find_torrent_leech = $(torrents).find('td.ly');

              torrent_link = extratorrent_url + torrent_download.split('torrent_download').join('download');
              torrent_name = find_torrent_title.split('Download ').join('').split(' torrent').join('');
              torrent_size = find_torrent_size.next().next().next().first().text();
              torrent_seed = find_torrent_seed.text();
              torrent_leech = find_torrent_seed.text();

              data_content = {
                torrent_num: count,
                title: torrent_name,
                category: "",
                seeds: torrent_seed,
                leechs: torrent_leech,
                size: torrent_size,
                torrent_link: torrent_link
              };

              torrent_content.push(data_content);

              deferred.resolve(torrent_content);

              count++;

            }

          });
        } else {
          deferred.reject("No torrents found");
        }
      } else {
        deferred.reject("There was a problem loading Extratorrent");
      }

    });

    return deferred.promise;

  }
};
