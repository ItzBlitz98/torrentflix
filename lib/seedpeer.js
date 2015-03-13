var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');
var moment = require('moment');

module.exports = {
  search: function(query, seedpeer_url) {

    var torrent_search = query;
    var search_query = torrent_search.split(' ').join('-');
    var search_url = seedpeer_url + "/search/" + search_query + "/4/1.html";
    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];

    request(search_url, function(err, response, body){

      if(!err && response.statusCode === 200){

        var seedpeer_link, torrent_title, torrent_size, torrent_seeds, torrent_leech, date_added;

        $ = cheerio.load(body);

        if($('#body table tr').length > 7){

          $('#body table tr').each(function(index, torrents){
              var d = $(this);
              var td = d.children('td');

              links = $(torrents).find('a');

              $(links).each(function(i, link){
                if($(link).attr('href').indexOf("/details/") > -1 && $(link).attr('href').indexOf("facebook") < 1) {
                  seedpeer_link = $(link).attr('href');
                  torrent_title = $(link).text();
                  torrent_size = $(td).eq(2).text();
                  torrent_seeds = $(td).eq(3).text();
                  torrent_leech = $(td).eq(4).text();
                  date_added = $(td).eq(1).text();

                  //torrent_site
                  data_content = {
                    torrent_num: count,
                    title: torrent_title,
                    category: "",
                    seeds: torrent_seeds,
                    leechs: torrent_leech,
                    size: torrent_size,
                    torrent_site: seedpeer_url + seedpeer_link,
                    date_added: date_added
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
        deferred.reject("There was a problem loading SUMOTorrent");
      }

    });

    return deferred.promise;

  }
};
