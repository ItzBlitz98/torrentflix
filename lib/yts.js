var Q = require('q');
var request = require("request");
var moment = require('moment');

module.exports = {
  search: function(query, cat, page, yts_url) {
    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];
    //https://yify.unblocked.pw/api/v2/list_movies.json?query_term=guardians&sort=seeds&order=desc&set=1
    //var search_url = yts_url + '/json.php?q=' + encodeURIComponent(query) + '&field=seeders&order=desc&page=' + page;
    var search_url = yts_url + '/api/v2/list_movies.json?query_term=' + encodeURIComponent(query) + '&sort=seeds&order=desc&set=1';

    request(search_url, function(err, response, body){

      if(!err && response.statusCode === 200){

        data = JSON.parse(body);

        //console.log(data.data.movie_count);

        if(data.data.movie_count > 0){

          for(var torrent in data.data.movies){

            var title = data.data.movies[torrent].title_long;

            for(var torrents in data.data.movies[torrent].torrents){

              var torrent_quality = data.data.movies[torrent].torrents[torrents].quality;
              var torrent_title = title + ' ' + torrent_quality;
              var seeds = data.data.movies[torrent].torrents[torrents].seeds;
              var leech = data.data.movies[torrent].torrents[torrents].peers;
              //var torrent_link = data.data.movies[torrent].torrents[torrents].url;
              var hash = data.data.movies[torrent].torrents[torrents].hash;
              var torrent_link = "http://torcache.net/torrent/" + hash + ".torrent";
              var size = data.data.movies[torrent].torrents[torrents].size;
              var date_added = moment(Date.parse(data.data.movies[torrent].torrents[torrents].date_uploaded.split(' ')[0])).fromNow();

              data_content = {
                torrent_num: count,
                title: torrent_title,
                seeds: seeds,
                leech: leech,
                size: size,
                torrent_link: torrent_link,
                date_added: date_added
              };

              torrent_content.push(data_content);

              deferred.resolve(torrent_content);
              count++;


            }

          }

        } else {
          deferred.reject("No torrents found");
        }

      } else {
        deferred.reject("There was a problem loading YTS");
      }

    });

    return deferred.promise;

  }
};
