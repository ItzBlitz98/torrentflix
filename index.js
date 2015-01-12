var kickass = require('kickass');
var limetorrents = require('node-limetorrents');
var config = require('./config.js');
var language = require('./lang.js');
var chalk = require('chalk');
prompt = require('prompt-input')();
var spawn = require('child_process').spawn;

//load in values from config
var conf = config.getConfig();
var kickass_url = conf[0].kickass_url;
var limetorrents_url = conf[0].limetorrents_url;
var peerflix_player = conf[0].peerflix_player;
var peerflix_player_arg = conf[0].peerflix_player_args;
var peerflix_port = conf[0].peerflix_port;

//load in language settings
var lang = language.getEn();
var torrent_site = lang[0].torrent_site;
var search_torrent = lang[0].search_torrent;
var torrent_site_num = lang[0].torrent_site_num;
var select_torrent = lang[0].select_torrent;

/* hardcode till added */
cat = "";
page = "1";


console.log(chalk.green.bold(torrent_site));
console.log(chalk.magenta.bold('(k) ') + chalk.yellow.bold("Kickass"));
console.log(chalk.magenta.bold('(l) ') + chalk.yellow.bold("Limetorrents"));
console.log(chalk.green.bold(torrent_site_num));
prompt(chalk.red.bold('>>'), function (answer) {
  if(answer){

    torrentSite(answer);

  }
});

function torrentSite(site){
  console.log(chalk.green.bold(search_torrent));
  prompt(chalk.red.bold('>>'), function (answer) {

    if(answer){

      console.log(chalk.green.bold("searching for ") + chalk.bold.red(answer));
      if(site === "k"){
        kickassSearch(answer);
      } else if (site === "l"){
        limetorrentSearch(answer);
      }

    }

  });
}

function limetorrentSearch(query){
  limetorrents.search(query, cat, page, limetorrents_url).then(function(data) {

    for (var torrent in data) {
      var number = data[torrent].torrent_num;
      var title = data[torrent].title;
      var size = data[torrent].size;
      var seed = data[torrent].seeds;
      var leech = data[torrent].leechs;

      console.log(
        chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + chalk.yellow.bold(title) + (' ') + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
      );
    }

    selectTorrent(data);

  });
}

function kickassSearch(query) {
  kickass.search(query, cat, page, kickass_url).then(function(data) {

    for (var torrent in data) {
      var number = data[torrent].torrent_num;
      var title = data[torrent].title;
      var size = data[torrent].size;
      var seed = data[torrent].seeds;
      var leech = data[torrent].leechs;

      console.log(
        chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + chalk.yellow.bold(title) + (' ') + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
      );
    }

    selectTorrent(data);

  });
}


function selectTorrent(data) {
  console.log(chalk.green.bold(select_torrent));
  prompt(chalk.red.bold('>>'), function (answer) {
    console.log('Streaming ' + chalk.green.bold(data[answer].title));
    torrent = data[answer].torrent_link;
    streamTorrent(torrent);
  });
}

function streamTorrent(torrent){
  spawn('peerflix', [torrent, peerflix_player, peerflix_player_arg, peerflix_port], {
    stdio: 'inherit'
  });
}
