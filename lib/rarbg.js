var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');
var moment = require('moment');

module.exports = {
  search: function(query, rarbg_api_url, cat, page) {

    var torrent_search = query;
    var search_query = torrent_search.split(' ').join('+');

    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];

    //get token
    var url = rarbg_api_url + "/pubapi_v2.php?get_token=get_token&app_id=Torrentflix";
    request(url, function (err, response, body) {
        if (!err && response.statusCode === 200) {

            data = JSON.parse(body);

            var token = data.token;
            var search_url = rarbg_api_url + "/pubapi_v2.php?mode=search&search_string=" + search_query + "&sort=seeders&format=json_extended&token=" + token;

            request(search_url, function (err, response, body) {
                if (!err && response.statusCode === 200) {

                    data = JSON.parse(body);

                    for(var torrent in data.torrent_results){

                      var title = data.torrent_results[torrent].title;
                      var torrent_link = data.torrent_results[torrent].download;
                      var seeds = data.torrent_results[torrent].seeders;
                      var leechs = data.torrent_results[torrent].leechers;
                      var size = bytesToSize(data.torrent_results[torrent].size);

                      data_content = {
                        torrent_num: count,
                        title: title,
                        category: "",
                        seeds: seeds,
                        leechs: leechs,
                        size: size,
                        torrent_link: torrent_link
                      };

                      torrent_content.push(data_content);

                      deferred.resolve(torrent_content);
                      count++;

                    }
                } else {
                  deferred.reject("There was a problem loading Rarbg");
                }
            });

        } else {
          deferred.reject("There was a problem loading Rarbg");
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
