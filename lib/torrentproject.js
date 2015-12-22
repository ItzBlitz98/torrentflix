var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');
var moment = require('moment');
var tp = require("torrent_project_api");

module.exports = {
  search: function(query) {

    var torrent_search = query;
    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];

    tp.search(torrent_search, 'matches', 'json', function(err,data) {
    	if (err) {
        deferred.reject(err);
      } else {
        for (var i in data){
          if (i !== "total_found"){
            var torrent = data[i];
            //torrent_site
            data_content = {
              torrent_num: count,
              title: torrent.title,
              category: torrent.category,
              seeds: torrent.seeds,
              leechs: torrent.leechs,
              size: torrent.torrent_size,
              torrent_project_hash: torrent.torrent_hash,
              date_added: ""
            };

            torrent_content.push(data_content);

            deferred.resolve(torrent_content);
            count++;
          }
        }

      }
    });

    return deferred.promise;

  },
  get_link: function(hash){
    var deferred = Q.defer();

    tp.trackers(hash, 'json', function(err, data){
      deferred.resolve(data);
    });

    return deferred.promise;
  }
};
