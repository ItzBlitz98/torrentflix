var Q = require('q');
var request = require("request");
var moment = require('moment');

module.exports = {
  search: function(query, cat, page, kickass_url) {
    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];
    var torrent_verified;

    var search_url = kickass_url + '/json.php?q=' + encodeURIComponent(query) + '&field=seeders&order=desc&page=' + page;

    request(search_url, function(err, response, body){

      if(!err && response.statusCode === 200){

        data = JSON.parse(body);

        if(data.list.length){
          for(var torrent in data.list){

            var title = data.list[torrent].title;
            var category = data.list[torrent].category;
            var torrent_link = data.list[torrent].torrentLink;
            var seeds = data.list[torrent].seeds;
            var leechs = data.list[torrent].leechs;
            var size = bytesToSize(data.list[torrent].size);
            if(data.list[torrent].verified === 1){
              torrent_verified = " 👑  ";
            } else {
              torrent_verified = " ";
            }

            var date_added = moment(Date.parse(data.list[torrent].pubDate)).fromNow();

            var magnet_link = "magnet:?xt=urn:btih:" + data.list[torrent].hash + "&tr=udp%3A%2F%2Fopen.demonii.com%3A1337%2Fannounce";

            data_content = {
              torrent_num: count,
              title: title,
              category: category,
              seeds: seeds,
              leechs: leechs,
              size: size,
              torrent_link: magnet_link,
              torrent_verified:torrent_verified,
              date_added: date_added
            };

            torrent_content.push(data_content);

            deferred.resolve(torrent_content);
            count++;
          }
        } else {
          deferred.reject("No torrents found");
        }
      } else {
        deferred.reject("There was a problem loading KickassTorrents");
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
