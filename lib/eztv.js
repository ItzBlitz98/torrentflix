var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');

module.exports = {
  search: function(query, cat, page, eztv_url) {

    var torrent_search = query;
    var search_query = torrent_search.split(' ').join('+');

    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];

    request.post({
      headers: {'content-type' : 'application/x-www-form-urlencoded'},
      url:     eztv_url,
      body:    "SearchString1=" + search_query
    }, function(err, response, body){

      if(!err && response.statusCode === 200){

        var torrent_link, torrent_title, torrent_seeds, torrent_leech, torrent_size, torrent_date;

        $ = cheerio.load(body);

        if($('table.forum_header_border tr[name=hover]').length > 19){

        $('table.forum_header_border tr[name=hover]').each(function(index, torrents){

          find_torrent_title = $(torrents).find("td").eq(1).find("a").text();

          if(find_torrent_title){

            //we are going to do some filtering to try get the best results,
            //If this becomes a problem feel free to open an issue about it.
            //if(find_torrent_title.toLowerCase().indexOf(query.toLowerCase()) > -1) {

              find_torrent_title_size = $(torrents).find("td").eq(1).find("a").attr("title");
              find_torrent_title = $(torrents).find("td").eq(1).find("a").text();
              //we can just grab the magnet EZTV doesn't have multi file torrents
              find_torrent_link = $(torrents).find("td").eq(2).find("a").attr("href");

              find_date_added = $(torrents).find("td").eq(3).text();

              torrent_title_size = find_torrent_title_size;
              torrent_title = find_torrent_title;
              torrent_link = find_torrent_link;
              date_added = find_date_added;

              data_content = {
                torrent_num: count,
                title: torrent_title,
                title_size: torrent_title_size,
                category: "",
                seeds: "",
                leechs: "",
                size: "",
                torrent_link: torrent_link,
                date_added: date_added
              };

              torrent_content.push(data_content);

              deferred.resolve(torrent_content);
              count++;
            //}
          }

        });
      } else {
        deferred.reject("No torrents found");
      }
      } else {
        deferred.reject("There was a problem loading EZTV");
      }

    });

    return deferred.promise;

  }
};
