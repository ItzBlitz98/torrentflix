var Q = require("q");
var request = require("request");
var cheerio = require("cheerio");

module.exports = {
  search: function(query, kickass_url, cat, page, limit) {
    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];
    var torrent_verified;
    var search_url = kickass_url + '/usearch/torrents-search.php?q=' + encodeURIComponent(query);
    request.get({
      url: search_url,
      json: true,
      headers: {'User-Agent': 'request'}
    }, function(err, response, body){

      if(!err && response.statusCode === 200){

        $ = cheerio.load(body);

        if($(".torrents_table__torrent_name").length > 2){
          $("tr").each(function(index, torrents){
            torrent_title = $(torrents).find(".torrents_table__torrent_title").text().trim();
            if (torrent_title) {
              torrent_link = $(torrents).find(".torrents_table__actions").find("a.button--small").next().next().attr("href");
              torrent_size = $(torrents).find("td.text--center").eq(0).text();
              torrent_seeders = $(torrents).find("td.text--center").eq(3).text();
              torrent_leechers = $(torrents).find("td.text--center").eq(4).text();
              date_added = $(torrents).find("td.text--center").eq(2).text();

              data_content = {
                torrent_num: count,
                title: torrent_title,
                category: "",
                seeds: torrent_seeders,
                leechs: torrent_leechers,
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
        deferred.reject("There was a problem loading KickassTorrents");
      }
    //end of request
    });

    return deferred.promise;

  }
};
