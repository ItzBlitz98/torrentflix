(function() {
    var program = require("commander");
    var os = require('os');
    var fs = require('fs');
    var http = require('http');
    var kickass = require('./kickass.js');
    var subtitles = require('./subtitles.js');
    var limetorrents = require('./limetorrents.js');
    var extratorrent = require('./extratorrent.js');
    var nyaa = require('./nyaa.js');
    var tokyotosho = require('./tokyotosho.js');
    var tparse = require('./torrent_parse.js');
    var config = require('../config.js');
    var language = require('../lang.js');
    var chalk = require('chalk');
    var prompt = require('cli-prompt');
    var spawn = require('child_process').spawn;
    var appRoot = require('app-root-path');
    //that's so dutty of you
    var conf_file = appRoot.path.split('bin').join('') + "/config.js";

    //load in values from config
    var conf = config.getConfig();
    var kickass_url = conf[0].kickass_url;
    var limetorrents_url = conf[0].limetorrents_url;
    var extratorrent_url = conf[0].extratorrent_url;
    var nyaa_url = conf[0].nyaa_url;
    var tokyotosho_url = conf[0].tokyotosho_url;
    var peerflix_player = conf[0].peerflix_player;
    var peerflix_player_arg = conf[0].peerflix_player_args;
    var peerflix_port = conf[0].peerflix_port;
    var peerflix_command = conf[0].peerflix_command;
    var use_subtitle = conf[0].use_subtitle;
    var subtitle_language = conf[0].subtitle_language;


    //load in language settings
    var lang = language.getEn();
    var torrent_site = lang[0].torrent_site;
    var search_torrent = lang[0].search_torrent;
    var torrent_site_num = lang[0].torrent_site_num;
    var select_torrent = lang[0].select_torrent;
    var site_error = lang[0].site_error;

    var peerflix_subtitle = "";

    /* hardcode till added */
    cat = "";
    page = "1";

    program
    .option('-c, --config', 'config')
    .parse(process.argv);

    if(program.config){
        spawn(program.args[0], [conf_file], {
          stdio: 'inherit'
        });
    } else {
      firstPrompt();
    }

    function firstPrompt(){
      console.log(chalk.green.bold(torrent_site));
      if(kickass_url){
        console.log(chalk.magenta.bold('k) ') + chalk.yellow.bold("Kickass"));
      }
      if(limetorrents_url){
        console.log(chalk.magenta.bold('l) ') + chalk.yellow.bold("Limetorrents"));
      }
      if(extratorrent_url){
        console.log(chalk.magenta.bold('e) ') + chalk.yellow.bold("Extratorrent"));
      }
      if(nyaa_url){
        console.log(chalk.magenta.bold('n) ') + chalk.yellow.bold("Nyaa"));
      }
      if(tokyotosho_url){
        console.log(chalk.magenta.bold('t) ') + chalk.yellow.bold("Tokyotosho"));
      }

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
          } else if(site === "n"){
            nyaaSearch(val);
          } else if(site === "t"){
            tokyotoshoSearch(val);
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
      console.log(chalk.green.bold("Searching for ") + chalk.bold.blue(query) + chalk.bold.red(" (*note Extratorrent does not sort by seeds)"));
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
      console.log(chalk.green.bold("Searching for ") + chalk.bold.blue(query));
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
      console.log(chalk.green.bold("Searching for ") + chalk.bold.blue(query));
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


    function nyaaSearch(query){
      console.log(chalk.green.bold("Searching for ") + chalk.bold.blue(query));
      nyaa.search(query, cat, page, nyaa_url).then(function(data) {

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

    function tokyotoshoSearch(query){
      console.log(chalk.green.bold("Searching for ") + chalk.bold.blue(query));
      tokyotosho.search(query, cat, page, tokyotosho_url).then(function(data) {
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
        torrent_title = data[number].title;

        parseTorrent(torrent, torrent_title);

      });
    }

    function parseTorrent(torrent, torrent_title){

      tparse.parseTorrent(torrent).then(function(data) {
        //if true more than one file can be played
        if(data !== false){
          console.log(chalk.green.bold("Multiple torrent file detected."));
          var torrent_count = 1;

          data.forEach(function(torrents) {
            console.log(
              chalk.magenta.bold(torrent_count) + chalk.magenta.bold('\) ') + chalk.yellow.bold(torrents)
            );
            torrent_count++;
          });

          prompt(chalk.green.bold(select_torrent), function (val) {

            torrent_index = val-1;
            torrent_title = data[torrent_index];

            if(use_subtitle === "true"){
              subtitles.fetchSub(subtitle_language, torrent_title).then(function(data) {
                if(data !== false){
                  peerflix_subtitle = data;
                  streamTorrent_sub_list(torrent, torrent_index);
                } else {
                  streamTorrent_wo_sub_list(torrent, torrent_index);
                }
              });
            } else if(use_subtitle === "false"){
              streamTorrent_wo_sub_list(torrent, torrent_index);
            }

          });

        } else if(data === false){

          if(use_subtitle === "true"){
            subtitles.fetchSub(subtitle_language, torrent_title).then(function(data) {
              if(data !== false){
                peerflix_subtitle = data;
                streamTorrent_sub(torrent);
              } else {
                streamTorrent_wosub(torrent);
              }
            });
          } else if(use_subtitle === "false"){
            streamTorrent_wosub(torrent);
          }
        }

      });
    }

    function getSubtitles(torrent, torrent_title){

      subtitles.fetchSub(subtitle_language, torrent_title).then(function(data) {
        if(data !== false){
          peerflix_subtitle = data;
          streamTorrent_sub(torrent);
        } else {
          streamTorrent_wosub(torrent);
        }
      });

    }

    function streamTorrent_wo_sub_list(torrent, index){
      spawn(peerflix_command, [torrent, "--i " + index, peerflix_player, peerflix_player_arg, peerflix_port], {
        stdio: 'inherit'
      });
    }

    function streamTorrent_sub_list(torrent, index){
      spawn(peerflix_command, [torrent, "--subtitles=\"" + peerflix_subtitle + "\"", "--i " + index, peerflix_player, peerflix_player_arg, peerflix_port], {
        stdio: 'inherit'
      });
    }

    function streamTorrent_wosub(torrent){
      spawn(peerflix_command, [torrent, peerflix_player, peerflix_player_arg, peerflix_port], {
        stdio: 'inherit'
      });
    }

    function streamTorrent_sub(torrent){
      spawn(peerflix_command, [torrent, "--subtitles=\"" + peerflix_subtitle + "\"", peerflix_player, peerflix_player_arg, peerflix_port], {
        stdio: 'inherit'
      });
    }

}).call(this);
