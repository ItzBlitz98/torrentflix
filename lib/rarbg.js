var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');
var moment = require('moment');

module.exports = {
  search: function(query, rarbg_api_url, cat, page, limit) {

    var torrent_search = query;
    var search_query = torrent_search.split(' ').join('+');

    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];
    var options;

    //get token
    var url = rarbg_api_url + "/pubapi_v2.php?get_token=get_token&app_id=Torrentflix";

    options = { method: 'GET',
                      url: url,
                      headers: { 'user-agent': 'node.js'} };


    request(options, function (err, response, body) {

        if (!err && response.statusCode === 200) {
            data = JSON.parse(body);

            var token = data.token;
            var search_url = rarbg_api_url + "/pubapi_v2.php?mode=search&search_string=" + encodeURIComponent(search_query) + "&app_id=Torrentflix&sort=seeders&format=json_extended&token=" + token;

            options = { method: 'GET',
                              url: search_url,
                              headers: { 'user-agent': 'node.js'} };

            const child_process = require("child_process");
            child_process.execSync("sleep 2");

            request(options, function (err, response, body) {

                if (!err && response.statusCode === 200) {
                    data = JSON.parse(body);
                     if(data.torrent_results && data.torrent_results.length > 1){
                      for(var torrent in data.torrent_results){

                        var title = data.torrent_results[torrent].title;
                        var torrent_link = data.torrent_results[torrent].download;
                        var seeds = data.torrent_results[torrent].seeders;
                        var leechs = data.torrent_results[torrent].leechers;
                        var size = bytesToSize(data.torrent_results[torrent].size);
                        var date_added = data.torrent_results[torrent].pubdate.split('+')[0];

                        data_content = {
                          torrent_num: count,
                          title: title,
                          category: "",
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
