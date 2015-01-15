var Q = require('q');
var request = require("request");

module.exports = {
  search: function(query, cat, page, kickass_url) {
    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];

    var search_url = kickass_url + '/json.php?q=' + encodeURIComponent(query) + '&field=seeders&order=desc&page=' + page;

    request(search_url, function(err, response, body){

      if(!err && response.statusCode === 200){

        data = JSON.parse(body);

        for(var torrent in data.list){

          var title = data.list[torrent].title;
          var category = data.list[torrent].category;
          var torrent_link = data.list[torrent].torrentLink;
          var seeds = data.list[torrent].seeds;
          var leechs = data.list[torrent].leechs;
          var size = bytesToSize(data.list[torrent].size);

          data_content = {
            torrent_num: count,
            title: title,
            category: category,
            seeds: seeds,
            leechs: leechs,
            size: size,
            torrent_link: torrent_link
          };

          torrent_content.push(data_content);

          deferred.resolve(torrent_content);
          count++;
        }

      }

    });

    return deferred.promise;

  }
};

function bytesToSize(bytes) {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0 Byte';
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + '' + sizes[i];
};
