/* url to use for kickass torrents */
var kickass_url = "https://kickass.so";
/* url to use for lime torrents */
var limetorrents_url = "http://limetorrents.cc.websiteproxies.co.uk";
/* what player you want peerflix to use */
var peerflix_player = "--mpv";
/* what arguments you want peerflix to use for the player */
var peerflix_player_args = "--not-on-top";
/* what port you want peerflix to use */
var peerflix_port = "--port=8888";


/*leave everything below */
var data_content = {};
var config_content = [];


module.exports = {
  getConfig: function() {
    data_content = {
      kickass_url: kickass_url,
      limetorrents_url: limetorrents_url,
      peerflix_player: peerflix_player,
      peerflix_player_args: peerflix_player_args,
      peerflix_port: peerflix_port,
    };

    config_content.push(data_content);

    return config_content;
  }
};
