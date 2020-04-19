var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');

module.exports = {
  search: function(query, thepiratebay_url, cat, page, limit) {

    var torrent_search = query;
    var search_query = torrent_search.split(' ').join('%20');

    //use thepiratebay api https://apibay.org/q.php?q=
    var search_url = thepiratebay_url + "/q.php?q=" + search_query;
    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];
    var link_content = [];

    request(search_url, function(err, response, body){

      if(!err && response.statusCode === 200){

        data = JSON.parse(body);

        if(data[0].id){
          for(var torrent in data){
            var torrent_title = data[torrent].name;
            var seeds = data[torrent].seeders;
            var leechs = data[torrent].leechers;
            var size = bytesToSize(data[torrent].size);
            var torrent_link = "magnet:?xt=urn:btih:" + data[torrent].info_hash;
            var date_added = "";
            //var date_added = data[torrent].added;

            data_content = {
              torrent_num: count,
              title: torrent_title,
              seeds: seeds,
              leechs: leechs,
              size: size,
              torrent_link: torrent_link,
              date_added: date_added
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
        deferred.reject("There was a problem loading The Pirate Bay");
      }


    });

    return deferred.promise;

  }
};

function bytesToSize(bytes) {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + '' + sizes[i];
}
