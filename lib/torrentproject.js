var Q = require('q');
var request = require("request");

module.exports = {
  search: function(query, torrentproject_url, cat, page, limit) {
    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];
    var torrent_verified;
    var search_url = torrentproject_url + "/?s=" + encodeURIComponent(query) + "&out=json&orderby=seeders";

    request(search_url, function(err, response, body){

      if(!err && response.statusCode === 200){

        data = JSON.parse(body);

        if(data.total_found > 0){
          for(var torrent in data){

            if(torrent !== "total_found"){

              var title = data[torrent].title;
              var category = data[torrent].category;
              var torrent_hash = data[torrent].torrent_hash;
              var seeds = data[torrent].seeds;
              var leechs = data[torrent].leechs;
              var size = bytesToSize(data[torrent].torrent_size);

              var magnet_link = "magnet:?xt=urn:btih:" + torrent_hash + "&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969";

              data_content = {
                torrent_num: count,
                title: title,
                category: category,
                seeds: seeds,
                leechs: leechs,
                size: size,
                torrent_link: magnet_link,
                date_added: ""
              };

              torrent_content.push(data_content);

              deferred.resolve(torrent_content);
              // like break
              if (++count > limit) { return false; }

            }

          }
        } else {
          deferred.reject("No torrents found");
        }

      } else {
        deferred.reject("There was a problem loading TorrentProject");
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
