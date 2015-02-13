(function() {
    var program = require("commander");
    var os = require('os');
    var fs = require('fs');
    var http = require('http');
    var kickass = require('./kickass.js');
    var rarbg = require('./rarbg.js');
    var eztv = require('./eztv.js');
    var subtitles = require('./subtitles.js');
    var limetorrents = require('./limetorrents.js');
    var extratorrent = require('./extratorrent.js');
    var tpb = require('./thepiratebay.js');
    var yts = require('./yts.js');
    var nyaa = require('./nyaa.js');
    var tokyotosho = require('./tokyotosho.js');
    var tparse = require('./torrent_parse.js');
    var config = require('../config.js');
    var language = require('../lang.js');
    var chalk = require('chalk');
    var inquirer = require('inquirer');
    var spawn = require('child_process').spawn;
    var path = require('path');
    var appDir = path.dirname(require.main.filename).split('bin').join('');

    var isWindows = process.platform === 'win32';

    var conf_file = appDir + "config.js";

    //load in values from config
    var conf = config.getConfig();
    var kickass_url = conf[0].kickass_url;
    var rarbg_url = conf[0].rarbg_url;
    var limetorrents_url = conf[0].limetorrents_url;
    var extratorrent_url = conf[0].extratorrent_url;
    var yts_url = conf[0].yts_url;
    var tpb_url = conf[0].tpb_url;
    var eztv_url = conf[0].eztv_url;
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
    var conf_date_added = conf[0].date_added;

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
      var sites = [];
      if(kickass_url){
        sites.push({'key': "kickass", name: chalk.magenta.bold('Kickass'), value: "kickass"});
      }
      if(rarbg_url){
        sites.push({'key': "rarbg", name: chalk.magenta.bold('Rarbg'), value: "rarbg"});
      }
      if(eztv_url){
        sites.push({'key': "eztv", name: chalk.magenta.bold('EZTV'), value: "eztv"});
      }
      if(yts_url){
        sites.push({'key': "yts", name: chalk.magenta.bold('YTS'), value: "yts"});
      }
      if(tpb_url){
        sites.push({'key': "tpb", name: chalk.magenta.bold('The Pirate Bay'), value: "tpb"});
      }
      if(limetorrents_url){
        sites.push({'key': "limetorrents", name: chalk.magenta.bold('LimeTorrents'), value: "limetorrents"});
      }
      if(extratorrent_url){
        sites.push({'key': "extratorrent", name: chalk.magenta.bold('ExtraTorrent'), value: "extratorrent"});
      }
      if(nyaa_url){
        sites.push({'key': "nyaa", name: chalk.magenta.bold('Nyaa'), value: "nyaa"});
      }
      if(tokyotosho_url){
        sites.push({'key': "tokyotosho", name: chalk.magenta.bold('Tokyotosho'), value: "tokyotosho"});
      }
      if(history === "true"){
        sites.push({'key': "print history", name: chalk.blue.bold('Print history'), value: "print history"});
      }

      inquirer.prompt([
        {
          type: "list",
          name: "site",
          message: chalk.green.bold("What torrent site do you want to search?"),
          choices: sites
        }
        ], function( answer ) {
          if(answer.site === "eztv"){
            console.log(chalk.blue.bold("When searching EZTV its better to just enter the show name leaving out series and ep number."));
          }
          torrentSite(answer.site);
        });
    }

    function torrentSite(site){

      if(site == "print history"){
        printHistory();
        firstPrompt();
      } else {

        inquirer.prompt([
          {
            type: "input",
            name: "search",
            message: chalk.green.bold(search_torrent),
          }
          ], function( answer ) {
            if(site === "kickass"){
              kickassSearch(answer.search);
            } else if(site === "rarbg"){
              rarbgSearch(answer.search);
            } else if(site === "eztv"){
              eztvSearch(answer.search);
            } else if(site === "limetorrents"){
              limetorrentSearch(answer.search);
            } else if(site === "yts"){
              ytsSearch(answer.search);
            } else if(site === "tpb"){
              tpbSearch(answer.search);
            } else if(site === "extratorrent"){
              extratorrentSearch(answer.search);
            } else if (site === "nyaa"){
              nyaaSearch(answer.search);
            } else if(site === "tokyotosho"){
              tokyotoshoSearch(answer.search);
            }

          });

      }

    }

    function eztvSearch(query){
      console.log(chalk.green.bold("Searching for ") + chalk.bold.blue(query));
      eztv.search(query, cat, page, eztv_url).then(function onResolve(data) {

        for (var torrent in data) {
          var date_added;
          var number = data[torrent].torrent_num;
          var title = data[torrent].title;
          var title_size = data[torrent].title_size;
          var size = data[torrent].size;
          var seed = data[torrent].seeds;
          var leech = data[torrent].leechs;

          if(conf_date_added == "true"){
            date_added = chalk.cyan.bold(" " + data[torrent].date_added + "");
          } else {
            date_added = "";
          }

          console.log(
            chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + chalk.yellow.bold(title_size) + date_added + (' ') + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
          );
        }

        selectTorrent(data);
      }, function onReject(err) {
        console.log(chalk.red.bold(err));
        firstPrompt();
      });
    }


    function rarbgSearch(query){
      console.log(chalk.green.bold("Searching for ") + chalk.bold.blue(query));
      rarbg.search(query, cat, page, rarbg_url).then(function onResolve(data) {

        for (var torrent in data) {
          var date_added;
          var number = data[torrent].torrent_num;
          var title = data[torrent].title;
          var size = data[torrent].size;
          var seed = data[torrent].seeds;
          var leech = data[torrent].leechs;

          if(conf_date_added == "true"){
            date_added = chalk.cyan.bold(" " + data[torrent].date_added + "");
          } else {
            date_added = "";
          }

          console.log(
            chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + chalk.yellow.bold(title) + date_added + (' ') + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
          );
        }

        selectTorrent(data);
      }, function onReject(err) {
        console.log(chalk.red.bold(err));
        firstPrompt();
      });
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


    function ytsSearch(query){
      console.log(chalk.green.bold("Searching for ") + chalk.bold.blue(query));
      yts.search(query, cat, page, yts_url).then(function onResolve(data) {

        for (var torrent in data) {
          var date_added;
          var number = data[torrent].torrent_num;
          var title = data[torrent].title;
          var size = data[torrent].size;
          var seed = data[torrent].seeds;
          var leech = data[torrent].leech;

          if(conf_date_added == "true"){
            date_added = chalk.cyan.bold(" " + data[torrent].date_added + "");
          } else {
            date_added = "";
          }

          console.log(
            chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + chalk.yellow.bold(title) + date_added + (' ') + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
          );
        }

        selectTorrent(data);
      }, function onReject(err) {
        console.log(chalk.red.bold(err));
        firstPrompt();
      });
    }


    function tpbSearch(query){
      console.log(chalk.green.bold("Searching for ") + chalk.bold.blue(query));
      console.log(chalk.bold.red("Use caution using thepiratebay, Fake torrents are common, Look for trusted uploader skull."));
      tpb.search(query, cat, page, tpb_url).then(function onResolve(data) {

        for (var torrent in data) {
          var torrent_verified, date_added;
          var number = data[torrent].torrent_num;
          var title = data[torrent].title;
          var size = data[torrent].size;
          var seed = data[torrent].seeds;
          var leech = data[torrent].leechs;

          if(data[torrent].torrent_verified == "vip"){
            torrent_verified = chalk.green(" 💀  ");
          } else if(data[torrent].torrent_verified == "trusted"){
            torrent_verified = chalk.magenta(" 💀  ");
          } else {
            torrent_verified = " ";
          }
          if(conf_date_added == "true"){
            date_added = chalk.cyan.bold("" + data[torrent].date_added + " ");
          } else {
            date_added = "";
          }
          console.log(
            chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + chalk.yellow.bold(title) + torrent_verified + date_added + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
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
          var date_added;
          var number = data[torrent].torrent_num;
          var title = data[torrent].title;
          var size = data[torrent].size;
          var seed = data[torrent].seeds;
          var leech = data[torrent].leechs;

          if(conf_date_added == "true"){
            date_added = chalk.cyan.bold(" " + data[torrent].date_added + "");
          } else {
            date_added = "";
          }

          console.log(
            chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + chalk.yellow.bold(title) + date_added + (' ') + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
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
          var date_added;
          var number = data[torrent].torrent_num;
          var title = data[torrent].title;
          var size = data[torrent].size;
          var seed = data[torrent].seeds;
          var leech = data[torrent].leechs;
          var torrent_verified = data[torrent].torrent_verified;
          if(conf_date_added == "true"){
            date_added = chalk.cyan.bold("" + data[torrent].date_added + " ");
          } else {
            date_added = "";
          }

          console.log(
            chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + chalk.yellow.bold(title) + chalk.green(torrent_verified) + date_added + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
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
          var date_added;
          var number = data[torrent].torrent_num;
          var title = data[torrent].title;
          var size = data[torrent].size;
          var seed = data[torrent].seeds;
          var leech = data[torrent].leechs;
          if(conf_date_added == "true"){
            date_added = chalk.cyan.bold(" " + data[torrent].date_added + "");
          } else {
            date_added = "";
          }

          console.log(
            chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + chalk.yellow.bold(title) + date_added + (' ') + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
          );
        }

        selectTorrent(data);
      }, function onReject(err) {
        console.log(chalk.red.bold(err));
        firstPrompt();
      });
    }

    function selectTorrent(data) {
      inquirer.prompt([
        {
          type: "input",
          name: "torrent",
          message: chalk.green.bold(select_torrent),
          validate: function( value ) {
            if(value > data.length){
              return "Please enter a valid torrent number";
            } else {
              return true;
            }
          }
        }
        ], function( answer ) {
          number = answer.torrent -1;
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
          inquirer.prompt([
            {
              type: "input",
              name: "torrent",
              message: chalk.green.bold(select_torrent),
              validate: function( value ) {
                if(value > data.length){
                  return "Please enter a valid torrent number";
                } else {
                  return true;
                }
              }
            }
            ], function( answer ) {
                torrent_index = answer.torrent-1;
                torrent_title = data[torrent_index];
                console.log('Streaming ' + chalk.green.bold(torrent_title));
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
      var argsList;
      if(peerflix_player === "--airplay"){
        argsList =  [torrent, "--i=" + index, peerflix_player];
      } else {
        argsList = [torrent, "--i=" + index, peerflix_player, peerflix_player_arg, peerflix_port];
      }
      osSpecificSpawn(peerflix_command, argsList);
    }

    function streamTorrent_sub_list(torrent, index){
      var argsList;
      if(peerflix_player === "--airplay"){
        argsList =  [torrent, "--i=" + index, peerflix_player];
      } else {
       argsList = [torrent, "--subtitles=" + peerflix_subtitle, "--i=" + index, peerflix_player, peerflix_player_arg, peerflix_port];
      }
      osSpecificSpawn(peerflix_command, argsList);
    }

    function streamTorrent_wosub(torrent){
      var argsList;
      if(peerflix_player === "--airplay"){
        argsList =  [torrent, peerflix_player];
      } else {
        argsList =  [torrent, peerflix_player, peerflix_player_arg, peerflix_port];
      }
      osSpecificSpawn(peerflix_command, argsList);
    }

    function streamTorrent_sub(torrent){
      var argsList;
      if(peerflix_player === "--airplay"){
        argsList =  [torrent, peerflix_player];
      } else {
        argsList = [torrent, "--subtitles=" + peerflix_subtitle, peerflix_player, peerflix_player_arg, peerflix_port];
      }
      osSpecificSpawn(peerflix_command, argsList);
    }

    function osSpecificSpawn(command, argsList){

      if(isWindows){
        //we must call peerflix using cmd.exe if on windows
        argsList.unshift('/c', command);
        spawn('cmd', argsList);
      }else{
        spawn(command, argsList, {stdio:'inherit'});
      }
    }

}).call(this);
