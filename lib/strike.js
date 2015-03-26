var Q = require('q');
var request = require("request");
var moment = require('moment');

module.exports = {
  search: function(query, cat, page, strike_url) {
    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];
    var torrent_verified;

    var search_url = strike_url + "/api/v2/torrents/search/?phrase=" + encodeURIComponent(query);

    request(search_url, function(err, response, body){

      data = JSON.parse(body);

      if(data.results > 0){
          for(var torrent in data.torrents){

            var title = data.torrents[torrent].torrent_title;
            var torrent_link = data.torrents[torrent].magnet_uri;
            var seeds = data.torrents[torrent].seeds;
            var leech = data.torrents[torrent].leeches;
            var size = bytesToSize(data.torrents[torrent].size);
            var date_added =  moment(Date.parse(data.torrents[torrent].upload_date)).fromNow();
            var category = "";

            data_content = {
              torrent_num: count,
              title: title,
              category: category,
              seeds: seeds,
              leechs: leech,
              size: size,
              torrent_link: torrent_link,
              date_added: date_added
            };

            torrent_content.push(data_content);

            deferred.resolve(torrent_content);
            count++;
          }
      } else {
        deferred.reject("No torrents found.");
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
