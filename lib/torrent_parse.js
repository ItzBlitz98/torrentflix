var Q = require('q');
var readTorrent = require('read-torrent');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; //read torrent may fail if no  valid certificate is found

module.exports = {
  parseTorrent: function(torrent) {

    var deferred = Q.defer();
    var torrent_count = 0;
    var data_content = {};
    var torrent_content = [];

    //dont bother checking if magnet link
    if(torrent.indexOf("magnet:?xt=urn:") > -1) {
      //we can't check magnet links for multiple files so skip
      deferred.resolve(false);
    } else {
      readTorrent(torrent,function(err, torrent) {

        if(torrent &&  typeof torrent.files !== undefined){
          torrent.files.forEach(function(torrent_files) {

            torrent_content.push(torrent_files.name);

            var StreamFormats = ['.mp4','.mkv', '.avi'],
            length = StreamFormats.length;
            while(length--) {

              //figure out how many streamable files there are
              if (torrent_files.name.indexOf(StreamFormats[length])!=-1) {
                if (torrent_files.name.indexOf("sample") == -1) {
                  torrent_count++;
                }
              }

            }

          });
        } else {
          //single file torrent
          deferred.resolve(false);
        }

        if(torrent_count > 1){
          //more than one streamable files
          deferred.resolve(torrent_content);
        } else {
          //single file torrent
          deferred.resolve(false);
        }

      });
    }
    return deferred.promise;

  }
};
