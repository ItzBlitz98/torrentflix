var kickass = require('kickass');
var config = require('./config.js');
var language = require('./lang.js');
var chalk = require('chalk');
var prompt = require('prompt');
var spawn = require('child_process').spawn;

//load in values from config
var conf = config.getConfig();
var kickass_url = conf[0].kickass_url;
var peerflix_player = conf[0].peerflix_player;
var peerflix_player_arg = conf[0].peerflix_player_args;
var peerflix_port = conf[0].peerflix_port;

//load in language settings
var lang = language.getEn();
var search_torrent = lang[0].search_torrent;
var select_torrent = lang[0].select_torrent;

/* hardcode till added */
//query = "archer s06e01";
cat = "";
page = "1";


prompt.start();
console.log(search_torrent.green.bold);
prompt.get(['torrent_name'], function(err, result) {
  //result.torrent_num
  console.log("searching for " + result.torrent_name.green.bold);
  kickassSearch(result.torrent_name);
});


function kickassSearch(query) {
  kickass.search(query, cat, page, kickass_url).then(function(data) {

    for (var torrent in data) {
      var number = data[torrent].torrent_num;
      var title = data[torrent].title;
      var size = data[torrent].size;
      var seed = data[torrent].seeds;
      var leech = data[torrent].leechs;

      console.log(
        chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + (' ') + chalk.yellow.bold(title) + (' ') + chalk.blue.bold(size) + (' ') + chalk.red.bold(seed) + (' ') + chalk.green.bold(leech)
      );
    }

    selectTorrent(data);

  });
}


function selectTorrent(data) {
  prompt.start();
  console.log(chalk.green.bold(select_torrent));
  prompt.get(['torrent_number'], function(err, result) {
    console.log('Streaming ' + chalk.green.bold(data[result.torrent_number].title));
    torrent = data[result.torrent_number].torrent_link;
    streamTorrent(torrent);
  });
}

function streamTorrent(torrent){
  spawn('peerflix', [torrent, peerflix_player, peerflix_player_arg, peerflix_port], {
    stdio: 'inherit'
  });
}
