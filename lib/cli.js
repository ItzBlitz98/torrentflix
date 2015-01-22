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
    var prompt = require('prompt');
    var spawn = require('child_process').spawn;
    var appRoot = require('app-root-path');

    var isWindows = process.platform === 'win32';

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
    var history = conf[0].history;
    var history_location = conf[0].history_location;

    //load in language settings
    var lang = language.getEn();
    var torrent_site = lang[0].torrent_site;
    var search_torrent = lang[0].search_torrent;
    var torrent_site_num = lang[0].torrent_site_num;
    var select_torrent = lang[0].select_torrent;
    var site_error = lang[0].site_error;

    var peerflix_subtitle = "";
    var history_object;

    if (history === "true") {
      if (fs.existsSync(history_location)) {
        history_object = JSON.parse(fs.readFileSync(history_location, 'utf8'));
      } else {
        createHistory();
        history_object = [];
      }
    }

    /* hardcode till added */
    cat = "";
    page = "1";

    program
    .option('-c, --config', 'config')
    .option('-h, --history, history')
    .option('-ch, --clear, clear')
    .parse(process.argv);

    if(program.config){
        spawn(program.args[0], [conf_file], {
          stdio: 'inherit'
        });
    } else if(program.history){
      if(history === "true"){
        printHistory();
      } else {
        console.log(chalk.red.bold("History is not enabled"));
      }
    } else if(program.clear){
      if(history === "true"){
        fs.unlinkSync(history_location);
      } else {
        console.log(chalk.red.bold("History is not enabled"));
      }
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
      if(history === "true"){
        console.log(chalk.magenta.bold('h) ') + chalk.yellow.bold("Print history"));
      }

      prompt.message = chalk.green.bold(torrent_site_num);
      prompt.get('site', function (err, val) {
        torrentSite(val.site);
      });
    }

    function torrentSite(site){

      if(site == "h"){
        printHistory();
        firstPrompt();
      } else {
        prompt.message = chalk.green.bold(search_torrent);
        prompt.get('torrent', function (err, val) {

          if(val.torrent){

            if(site === "k"){
              kickassSearch(val.torrent);
            } else if (site === "l"){
              limetorrentSearch(val.torrent);
            } else if(site === "e"){
              extratorrentSearch(val.torrent);
            } else if(site === "n"){
              nyaaSearch(val.torrent);
            } else if(site === "t"){
              tokyotoshoSearch(val.torrent);
            } else {
              console.log("");
              console.log(chalk.white.bgRed.bold(site_error));
              console.log("");
              firstPrompt();
            }

          }

        });
      }

    }

    function extratorrentSearch(query){
      console.log(chalk.green.bold("Searching for ") + chalk.bold.blue(query) + chalk.bold.red(" (*note Extratorrent does not sort by seeds)"));
      extratorrent.search(query, cat, page, extratorrent_url).then(function onResolve(data) {

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
      }, function onReject(err) {
        console.log(chalk.red.bold(err));
        firstPrompt();
      });
    }

    function limetorrentSearch(query){
      console.log(chalk.green.bold("Searching for ") + chalk.bold.blue(query));
      limetorrents.search(query, cat, page, limetorrents_url).then(function onResolve(data) {

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
      }, function onReject(err) {
        console.log(chalk.red.bold(err));
        firstPrompt();
      });
    }

    function kickassSearch(query) {
      console.log(chalk.green.bold("Searching for ") + chalk.bold.blue(query));
      kickass.search(query, cat, page, kickass_url).then(function onResolve(data) {
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

        selectTorrent(data, query);

      }, function onReject(err) {
        console.log(chalk.red.bold(err));
        firstPrompt();
      });
    }


    function nyaaSearch(query){
      console.log(chalk.green.bold("Searching for ") + chalk.bold.blue(query));
      nyaa.search(query, cat, page, nyaa_url).then(function onResolve(data) {

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

      }, function onReject(err) {
        console.log(chalk.red.bold(err));
        firstPrompt();
      });
    }

    function tokyotoshoSearch(query){
      console.log(chalk.green.bold("Searching for ") + chalk.bold.blue(query));
      tokyotosho.search(query, cat, page, tokyotosho_url).then(function onResolve(data) {
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
      }, function onReject(err) {
        console.log(chalk.red.bold(err));
        firstPrompt();
      });
    }

    function selectTorrent(data) {
      prompt.message = chalk.green.bold(select_torrent);
      prompt.get('number', function (err, val) {
        number = val.number -1;
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

          prompt.message = chalk.green.bold(select_torrent);
          prompt.get('torrent', function (err, val) {

            torrent_index = val.torrent-1;
            torrent_title = data[torrent_index];

            if(use_subtitle === "true"){
              subtitles.fetchSub(subtitle_language, torrent_title).then(function(data) {
                if(data !== false){
                  peerflix_subtitle = data;
                  streamTorrent_sub_list(torrent, torrent_index);
                  if(history === "true"){
                    writeHistory(torrent_title);
                  }
                } else {
                  streamTorrent_wo_sub_list(torrent, torrent_index);
                  if(history === "true"){
                    writeHistory(torrent_title);
                  }
                }
              });
            } else if(use_subtitle === "false"){
              streamTorrent_wo_sub_list(torrent, torrent_index);
              if(history === "true"){
                writeHistory(torrent_title);
              }
            }

          });

        } else if(data === false){

          if(use_subtitle === "true"){
            subtitles.fetchSub(subtitle_language, torrent_title).then(function(data) {
              if(data !== false){
                peerflix_subtitle = data;
                streamTorrent_sub(torrent);
                if(history === "true"){
                  writeHistory(torrent_title);
                }
              } else {
                streamTorrent_wosub(torrent);
                if(history === "true"){
                  writeHistory(torrent_title);
                }
              }
            });
          } else if(use_subtitle === "false"){
            streamTorrent_wosub(torrent);
            if(history === "true"){
              writeHistory(torrent_title);
            }
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

    function createHistory() {
      fs.writeFile(history_location, '[]', function(err) {
        if (err) {
          console.log("could not create history file, Is it in a writable directory ?");
        }
      });
    }

    function writeHistory(torrent_name) {

      data_content = {
        torrent: torrent_name
      };

      history_object.push(data_content);

      savehistoryFile();
    }

    function savehistoryFile() {
      fs.writeFile(history_location, JSON.stringify(history_object, null, 4), function(err) {
        if (err) {
          console.log("could not create history file, Is it in a writable directory ?");
        }
      });
    }

    function printHistory(){
      if(history === "true"){
        histcount = 1;
        console.log("");
        console.log(chalk.green.bold("Watched History: "));
        history_object.forEach(function(torrents) {
          console.log(chalk.red.bold(histcount + ' ') + chalk.magenta.bold(torrents.torrent));
          histcount++;
        });
        console.log("");
      } else {
        console.log(chalk.red.bold("History is not enabled"));
      }
    }

    function streamTorrent_wo_sub_list(torrent, index){
      var argsList = [torrent, "--i " + index, peerflix_player, peerflix_player_arg, peerflix_port];
      osSpecificSpawn(peerflix_command, argsList);
    }

    function streamTorrent_sub_list(torrent, index){
      var argsList = [torrent, "--subtitles=\"" + peerflix_subtitle + "\"", "--i " + index, peerflix_player, peerflix_player_arg, peerflix_port];
      osSpecificSpawn(peerflix_command, argsList);
    }

    function streamTorrent_wosub(torrent){
      var argsList =  [torrent, peerflix_player, peerflix_player_arg, peerflix_port];
      osSpecificSpawn(peerflix_command, argsList);
    }

    function streamTorrent_sub(torrent){
      var argsList = [torrent, "--subtitles=\"" + peerflix_subtitle + "\"", peerflix_player, peerflix_player_arg, peerflix_port];
      osSpecificSpawn(peerflix_command, argsList);
    }

    function osSpecificSpawn(command, argsList){

      if(isWindows){

        //we must call peerflix using cmd.exe if on windows
        argsList.unshift('/c', command);
        spawn('cmd', argsList);
      }

      else{
        spawn(command, argsList, {stdio:'inherit'});
      }
    }

}).call(this);
