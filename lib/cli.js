(function() {
    var program = require("commander");
    var kickass = require('./kickass.js');
    var limetorrents = require('./limetorrents.js');
    var extratorrent = require('./extratorrent.js');
    var config = require('../config.js');
    var language = require('../lang.js');
    var chalk = require('chalk');
    var prompt = require('cli-prompt');
    var spawn = require('child_process').spawn;
    var conf_location = process.cwd() + "/config.js";
    //load in values from config
    var conf = config.getConfig();
    var kickass_url = conf[0].kickass_url;
    var limetorrents_url = conf[0].limetorrents_url;
    var extratorrent_url = conf[0].extratorrent_url;
    var peerflix_player = conf[0].peerflix_player;
    var peerflix_player_arg = conf[0].peerflix_player_args;
    var peerflix_port = conf[0].peerflix_port;
    var peerflix_command = conf[0].peerflix_command;

    //load in language settings
    var lang = language.getEn();
    var torrent_site = lang[0].torrent_site;
    var search_torrent = lang[0].search_torrent;
    var torrent_site_num = lang[0].torrent_site_num;
    var select_torrent = lang[0].select_torrent;
    var site_error = lang[0].site_error;

    /* hardcode till added */
    cat = "";
    page = "1";

    program
    .option('-c, --config', 'Config')
    .parse(process.argv);

    if(program.config){
        spawn(program.args[0], [conf_location], {
          stdio: 'inherit'
        });
    } else {
      firstPrompt();
      console.log(process.cwd());
    }

    function firstPrompt(){
      console.log(chalk.green.bold(torrent_site));
      console.log(chalk.magenta.bold('(k) ') + chalk.yellow.bold("Kickass"));
      console.log(chalk.magenta.bold('(l) ') + chalk.yellow.bold("Limetorrents"));
      console.log(chalk.magenta.bold('(e) ') + chalk.yellow.bold("Extratorrent"));
      //console.log(chalk.green.bold(torrent_site_num));

      prompt(chalk.green.bold(torrent_site_num), function (val) {
        torrentSite(val);
      });
    }

    function torrentSite(site){
      //console.log(chalk.green.bold(search_torrent));
      prompt(chalk.green.bold(search_torrent), function (val) {

        if(val){

          if(site === "k"){
            kickassSearch(val);
          } else if (site === "l"){
            limetorrentSearch(val);
          } else if(site === "e"){
            extratorrentSearch(val);
          } else {
            console.log("");
            console.log(chalk.white.bgRed.bold(site_error));
            console.log("");
            firstPrompt();
          }

        }

      });
    }

    function extratorrentSearch(query){
      console.log(chalk.green.bold("searching for ") + chalk.bold.blue(query) + chalk.bold.red(" (*note Extratorrent does not sort by seeds)"));
      extratorrent.search(query, cat, page, extratorrent_url).then(function(data) {

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

    function limetorrentSearch(query){
      console.log(chalk.green.bold("searching for ") + chalk.bold.blue(query));
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
      console.log(chalk.green.bold("searching for ") + chalk.bold.blue(query));
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
      prompt(chalk.green.bold(select_torrent), function (val) {
        number = val -1;
        console.log('Streaming ' + chalk.green.bold(data[number].title));
        torrent = data[number].torrent_link;
        streamTorrent(torrent);
      });
    }

    function streamTorrent(torrent){
      spawn(peerflix_command, [torrent, peerflix_player, peerflix_player_arg, peerflix_port], {
        stdio: 'inherit'
      });
    }

}).call(this);
