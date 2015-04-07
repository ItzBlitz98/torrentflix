var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');
var moment = require('moment');

module.exports = {
  search: function(query, btdigg_url) {

    var torrent_search = query;
    var search_query = torrent_search.split(' ').join('%20');
    var search_url = btdigg_url + "/search?q=" + search_query + "&p=0&order=1";
    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];

    request(search_url, function(err, response, body){

      if(!err && response.statusCode === 200){
        $ = cheerio.load(body);

        if($('#search_res table tr').length > 0){

          $('#search_res table tr').each(function(index, torrents){

            var d = $(this);
            var td = d.children('td');

            find_torrent_title = $(torrents).find('td.torrent_name a');
            find_torrent_link = $(torrents).find('td.ttth a');
            find_torrent_size = $(torrents).find('table.torrent_name_tbl td.ttth');
            find_torrent_added = $(torrents).find('table.torrent_name_tbl td.ttth');

            torrent_title = find_torrent_title.text();
            torrent_link = find_torrent_link.attr('href');
            torrent_size = find_torrent_size.next().text().split('[cloud]Size:').join('');
            torrent_added = find_torrent_added.first().next().eq(1).text();

            if(torrent_link && torrent_title){
              data_content = {
                torrent_num: count,
                title: torrent_title,
                category: "",
                seeds: "",
                leechs: "",
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
        deferred.reject("There was a problem loading btdigg");
      }

    });

    return deferred.promise;

  }
};
