/* url to use for kickass torrents */
var kickass_url = "https://kickass.so";
/* url to use for lime torrents */
var limetorrents_url = "http://limetorrents.cc";
/* url to use for extratorrent */
var extratorrent_url = "http://extratorrent.cc";
/* what player you want peerflix to use */
var peerflix_player = "--mpv";
/* what arguments you want peerflix to use for the player */
var peerflix_player_args = "--not-on-top";
/* what port you want peerflix to use */
var peerflix_port = "--port=8888";
/* command to run peerflix (most of the time you can leave this) */
var peerflix_command = "peerflix";
/* do you want to fetch subtitles ? (true/false) */
var use_subtitle = "true";
/* subtitle language */
/* please use the language abbriviation */
/* EX: en = English or es = Spanish */
var subtitle_language = "eng";



/*leave everything below */
var data_content = {};
var config_content = [];

module.exports = {
  getConfig: function() {
    data_content = {
      kickass_url: kickass_url,
      limetorrents_url: limetorrents_url,
      extratorrent_url: extratorrent_url,
      peerflix_player: peerflix_player,
      peerflix_player_args: peerflix_player_args,
      peerflix_port: peerflix_port,
      peerflix_command: peerflix_command,
      use_subtitle: use_subtitle,
      subtitle_language: subtitle_language
    };

    config_content.push(data_content);

    return config_content;
  }
};
