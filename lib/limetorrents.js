var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');

module.exports = {
  search: function(query, cat, page, limetorrents_url) {

    if(!cat){
      cat = "all";
    }

    var torrent_search = query;
    var search_query = torrent_search.split(' ').join('-');

    var search_url = limetorrents_url + "/search/" + cat + "/" + search_query + "/seeds/" + page + "/";

    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];

    request(search_url, function(err, response, body){

      if(!err && response.statusCode === 200){

        $ = cheerio.load(body);
        if($('.table2 tr').length > 4){
          $('.table2 tr').each(function(index, torrents){

            if($(torrents).find('.tt-name a.csprite_dl14').attr('href')){

              find_torrent_link = $(torrents).find('.tt-name a.csprite_dl14');
              find_torrent_title = $(torrents).find('.tt-name a');
              find_torrent_size = $(torrents).find('td.tdnormal');
              find_torrent_seeders = $(torrents).find('td.tdseed');
              find_torrent_leechers = $(torrents).find('td.tdleech');

              torrent_link = find_torrent_link.attr('href');
              torrent_name = find_torrent_title.text();
              torrent_size = find_torrent_size.next().first().text();
              torrent_seed = find_torrent_seeders.text();
              torrent_leech = find_torrent_leechers.text();

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
        } else{
          deferred.reject("No torrents found");
        }
      } else {
        deferred.reject("There was a problem loading Limetorrents");
      }

    });

    return deferred.promise;

  }
};
