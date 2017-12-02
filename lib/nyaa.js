var Q = require('q');
var request = require("request");
var parser = require('xml2json');

module.exports = {
  search: function(query, nyaa_url, cat, page, limit) {

    var torrent_search = query;
    var search_query = torrent_search.split(' ').join('+');

    var search_url = nyaa_url + "/?page=rss&q=" + search_query;

    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];

    request(search_url, function(err, response, body){

      if(!err && response.statusCode === 200){

        var json = JSON.parse(parser.toJson(body));

        if(Object.keys(json.rss.channel.item).length > 0){

          for(var torrent in json.rss.channel.item){

              data = json.rss.channel.item;
              var title = data[torrent].title;
              var torrent_link = data[torrent].link;
              var seeds = data[torrent]["nyaa:seeders"];
              var leechs = data[torrent]['nyaa:leechers'];
              var size = data[torrent]['nyaa:size'];

              data_content = {
                torrent_num: count,
                title: title,
                seeds: seeds,
                leechs: leechs,
                size: size,
                torrent_link: torrent_link,
                date_added: ""
              };

              torrent_content.push(data_content);

              deferred.resolve(torrent_content);
              // like break
              if (++count > limit) { return false; }

          }

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
