var opensubtitles = require('opensubtitles-client');
var Q = require('q');
var os = require('os');
var fs = require('fs');
var http = require('http');
var chalk = require('chalk');

module.exports = {
  fetchSub: function(subtitle_language, torrent_title) {

    console.log(chalk.green.bold("Searching for subtitles."));

    var deferred = Q.defer();

    opensubtitles.api.login()
    .done(function(token){
      opensubtitles.api.search(token, subtitle_language, torrent_title)
      .done(
        function(results){
          if (typeof results[0] != "undefined") {
            console.log(chalk.green.bold("Subtitles found!"));
            console.log(chalk.green.bold("Downloading..."));

            //download file
            var url = results[0].SubDownloadLink.split('.gz').join('.srt');
            var dest = os.tmpdir() + "/sub.srt";
            var cb;

            var download = function(url, dest, cb) {
              var file = fs.createWriteStream(dest);
              var request = http.get(url, function(response) {
                response.pipe(file);
                file.on('finish', function() {
                  file.close(cb);
                  console.log(chalk.green.bold("Subtitles downloaded."));
                  peerflix_subtitle = dest;
                  deferred.resolve(peerflix_subtitle);
                });
              });
            };

            download(url, dest, cb);

          } else {
            console.log(chalk.red.bold("No subtitles found :( Sorry."));
            deferred.resolve(false);
          }
        }
      );
    });

    return deferred.promise;

  }
};
