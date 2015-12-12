(function() {
    var Configstore = require('configstore');
    var program = require("commander");
    var os = require('os');
    var fs = require('fs');
    var http = require('http');
    var kickass = require('./kickass.js');
    var rarbg = require('./rarbg.js');
    var strike = require('./strike.js');
    var subtitles = require('./subtitles.js');
    var torrent_search = require('./torrent_search.js');
    var limetorrents = require('./limetorrents.js');
    var extratorrent = require('./extratorrent.js');
    var tpb = require('./thepiratebay.js');
    var yts = require('./yts.js');
    var btdigg = require('./btdigg.js');
    var seedpeer = require('./seedpeer.js');
    var leetx = require('./1337x.js');
    var nyaa = require('./nyaa.js');
    var tokyotosho = require('./tokyotosho.js');
    var cpasbien = require('./cpasbien.js');
    var eztv = require('./eztv.js');
    var tparse = require('./torrent_parse.js');
    var language = require('../lang.js');
    var chalk = require('chalk');
    var inquirer = require('inquirer');
    var spawn = require('spawn-cmd').spawn;
    var path = require('path');
    var opn = require('opn');
    var appDir = path.dirname(require.main.filename).split('bin').join('');
    var isWindows = process.platform === 'win32';
    var options = {};
    var kickass_url, rarbg_url, btdigg_url, limetorrents_url, extratorrent_url, yts_url,
        tpb_url, nyaa_url, tokyotosho_url, rarbg_api_url, peerflix_player, peerflix_player_arg,
        peerflix_port, peerflix_command, use_subtitle, subtitle_language, history, history_location,
        conf_date_added, history_object, config_location, cat, page, peerflix_path;

    //load in language settings
    var lang = language.getEn();
    var torrent_site = lang[0].torrent_site;
    var search_torrent = lang[0].search_torrent;
    var torrent_site_num = lang[0].torrent_site_num;
    var select_torrent = lang[0].select_torrent;
    var select_file = lang[0].select_file;
    var site_error = lang[0].site_error;


    var get_conf_object = new Configstore("torrentflix_config", {});
    var get_hist_object = new Configstore("torrentflix_history", {});

    exports.AppInitialize = start = function(optns) {
      options = optns;
      config_object = get_conf_object.all;

      //setting up vars from config
      kickass_url = config_object.kickass_url;
      rarbg_url = config_object.rarbg_url;
      rarbg_api_url = config_object.rarbg_api_url;
      limetorrents_url = config_object.limetorrents_url;
      extratorrent_url = config_object.extratorrent_url;
      yts_url = config_object.yts_url;
      seedpeer_url = config_object.seedpeer_url;
      leetx_url = config_object.leetx_url;
      tpb_url = config_object.tpb_url;
      nyaa_url = config_object.nyaa_url;
      btdigg_url = config_object.btdigg_url;
      tokyotosho_url = config_object.tokyotosho_url;
      cpasbien_url = config_object.cpasbien_url;
      eztv_url = config_object.eztv_url;
      strike_url = config_object.strike_url;
      peerflix_player = config_object.peerflix_player;
      peerflix_player_arg = config_object.peerflix_player_args;
      peerflix_port = config_object.peerflix_port;
      peerflix_command = config_object.peerflix_command;
      use_subtitle = config_object.use_subtitle;
      subtitle_language = config_object.subtitle_language;
      history = config_object.history;
      conf_date_added = config_object.date_added;
      page = 1;
      peerflix_path = config_object.peerflix_path;

      firstPrompt();

    };



    function firstPrompt(){
      var sites = [];
      if(yts_url){
        sites.push({'key': "yts", name: chalk.magenta('YTS'), value: "yts"});
      }
      if(kickass_url){
        sites.push({'key': "kickass", name: chalk.magenta('Kickass'), value: "kickass"});
      }
      if(tpb_url){
        sites.push({'key': "tpb", name: chalk.magenta('The Pirate Bay'), value: "tpb"});
      }
      if(rarbg_url){
        sites.push({'key': "rarbg", name: chalk.magenta('Rarbg'), value: "rarbg"});
      }
      if(seedpeer_url){
        sites.push({'key': "seedpeer", name: chalk.magenta('Seedpeer'), value: "seedpeer"});
      }
      if(btdigg_url){
        sites.push({'key': "btdigg", name : chalk.magenta('BTDigg'), value: "btdigg"});
      }
      if(strike_url){
        sites.push({'key': "strike", name: chalk.magenta('GetStrike'), value: "strike"});
      }
      if(leetx_url){
        sites.push({'key': "leetx", name: chalk.magenta('1337x'), value: "leetx"});
      }
      if(limetorrents_url){
        sites.push({'key': "limetorrents", name: chalk.magenta('LimeTorrents'), value: "limetorrents"});
      }
      if(extratorrent_url){
        sites.push({'key': "extratorrent", name: chalk.magenta('ExtraTorrent'), value: "extratorrent"});
      }
      if(nyaa_url){
        sites.push({'key': "nyaa", name: chalk.magenta('Nyaa'), value: "nyaa"});
      }
      if(tokyotosho_url){
        sites.push({'key': "tokyotosho", name: chalk.magenta('Tokyotosho'), value: "tokyotosho"});
      }
      if(cpasbien_url){
        sites.push({'key': "cpasbien", name: chalk.magenta('Cpasbien'), value: "cpasbien"});
      }
      if(eztv_url){
        sites.push({'key': "eztv", name: chalk.magenta('Eztv'), value: "eztv"});
      }
      if(history === "true"){
        sites.push({'key': "print history", name: chalk.blue('Print history'), value: "print history"});
      }

      sites.push({'key': "exit", name: chalk.red('Exit app'), value: "exit"});

      inquirer.prompt([
        {
          type: "list",
          name: "site",
          message: chalk.green("What torrent site do you want to search?"),
          choices: sites
        }
        ], function( answer ) {
          torrentSite(answer.site);
        });
    }

    function torrentSite(site){

      if(site == "print history"){
        printHistory();
        firstPrompt();
      } else if(site == "exit"){
        exitApp();
      } else {
        if(options.search) {
            passoffSearch(options.search);
        } else if(options.open) {
            passoffSearch(options.open);
        } else {
          inquirer.prompt([
              {
                type: "input",
                name: "search",
                message: chalk.green(search_torrent),
              }
          ], function(answer) {
              passoffSearch(answer.search);
          });
        }
        function passoffSearch( search ) {
          console.log(chalk.green("Searching for ") + chalk.blue(search));
          if(site === "kickass"){
            kickassSearch(search);
          } else if(site === "rarbg"){
            rarbgSearch(search);
          } else if(site === "seedpeer"){
            seedpeerSearch(search);
          } else if(site === "strike"){
            strikeSearch(search);
          } else if(site === "btdigg"){
            btdiggSearch(search);
          } else if(site === "leetx"){
            leetxSearch(search);
          } else if(site === "limetorrents"){
            limetorrentSearch(search);
          } else if(site === "yts"){
            ytsSearch(search);
          } else if(site === "tpb"){
            tpbSearch(search);
          } else if(site === "extratorrent"){
            extratorrentSearch(search);
          } else if (site === "nyaa"){
            nyaaSearch(search);
          } else if(site === "tokyotosho"){
            tokyotoshoSearch(search);
          } else if(site === "cpasbien"){
            cpasbienSearch(search);
          } else if(site === "eztv"){
            eztvSearch(search);
          }
        }

      }

    }

    function btdiggSearch(query){
      btdigg.search(query, btdigg_url).then(
        function (data) {
            onResolve(data);
        }, function (err) {
            onReject(err);
        });
    }

    function leetxSearch(query){
      leetx.search(query, leetx_url).then(
        function (data) {
            onResolve(data);
        }, function (err) {
            onReject(err);
        });
    }



    function seedpeerSearch(query){
      seedpeer.search(query, seedpeer_url).then(
        function (data) {
            onResolve(data);
        }, function (err) {
            onReject(err);
        });
    }

    function rarbgSearch(query){
      rarbg.search(query, cat, page, rarbg_api_url).then(
        function (data) {
            onResolve(data);
        }, function (err) {
            onReject(err);
        });
    }

    function extratorrentSearch(query){
      console.log(chalk.red("(*note Extratorrent does not sort by seeds)"));
      extratorrent.search(query, cat, page, extratorrent_url).then(
        function (data) {
            onResolve(data);
        }, function (err) {
            onReject(err);
        });
    }

    function strikeSearch(query){
      strike.search(query, cat, page, strike_url).then(
        function (data) {
            onResolve(data);
        }, function (err) {
            onReject(err);
        });
    }


    function ytsSearch(query){
      yts.search(query, cat, page, yts_url).then(
        function (data) {
            onResolve(data);
        }, function (err) {
            onReject(err);
        });
    }


    function tpbSearch(query){
      //console.log(chalk.red("Use caution using thepiratebay, Fake torrents are common, Look for trusted uploader skull."));
      tpb.search(query, cat, page, tpb_url).then(
        function (data) {
            onResolve(data);
        }, function (err) {
            onReject(err);
        });
    }

    function limetorrentSearch(query){
      limetorrents.search(query, cat, page, limetorrents_url).then(
        function (data) {
            onResolve(data);
        }, function (err) {
            onReject(err);
        });
    }

    function kickassSearch(query) {
      kickass.search(query, cat, page, kickass_url).then(
        function (data) {
            onResolve(data);
        }, function (err) {
            onReject(err);
        });
    }


    function nyaaSearch(query){
      nyaa.search(query, cat, page, nyaa_url).then(
        function (data) {
            onResolve(data);
        }, function (err) {
            onReject(err);
        });
    }

    function tokyotoshoSearch(query){
      tokyotosho.search(query, cat, page, tokyotosho_url).then(
        function (data) {
            onResolve(data);
        }, function (err) {
            onReject(err);
        });
    }

    function cpasbienSearch(query){
      cpasbien.search(query, cpasbien_url).then(
        function (data) {
            onResolve(data);
        }, function (err) {
            onReject(err);
        });
    }

    function eztvSearch(query){
      eztv.search(query, eztv_url).then(
        function (data) {
            onResolve(data);
        }, function (err) {
            onReject(err);
        });
    }

    function onResolve(data) {
        for (var idx in data) {
            var torrent = data[idx];
            var date_added, title;
            var number = torrent.torrent_num;
            var size = torrent.size;
            var seed = torrent.seeds;
            var leech = torrent.leechs;
            var torrent_verified = " ";

            if(torrent.torrent_verified) {
                torrent_verified = torrent.torrent_verified;
                if(torrent.torrent_verified == "vip"){
                  torrent_verified = chalk.green(" 💀  ");
                } else if(torrent.torrent_verified == "trusted"){
                  torrent_verified = chalk.magenta(" 💀  ");
                }
            }

            if(conf_date_added == "true"){
              date_added = chalk.cyan("" + torrent.date_added + " ");
            } else {
              date_added = "";
            }

            if(history == "true"){
              var found = searchHistory(torrent.title);
              if(found){
                 title = chalk.red(torrent.title);
               } else {
                 title = chalk.yellow(torrent.title);
               }
            } else {
              title = chalk.yellow(torrent.title);
            }
            console.log(
              chalk.magenta(number) + chalk.magenta('\) ') + title + chalk.green(torrent_verified) + date_added + chalk.blue(size) + (' ') + chalk.green(seed) + (' ') + chalk.red(leech)
            );
        }
        selectTorrent(data);
    }

    function onReject(err) {
        console.log(chalk.red(err));
        firstPrompt();
    }

    function selectTorrent(data) {
      inquirer.prompt([
        {
          type: "input",
          name: "torrent",
          message: chalk.green(select_torrent),
          validate: function( value ) {
            if(value > data.length){
              return "Please enter a valid torrent number (1-"+data.length+")";
            }else if(!value){
              return "Please enter a valid torrent number (1-"+data.length+")";
            } else if(value == "b"){
              return true;
            } else if(value == "e"){
              return true;
            }else if(!value.match(/\d+/g)){
              return "Please enter a valid torrent number (1-"+data.length+")";
            } else {
              return true;
            }
          }
        }
        ], function( answer ) {
        if(answer.torrent === "b"){
          firstPrompt();
        }else if(answer.torrent === "e"){
          exitApp();
        } else {
          number = answer.torrent -1;
          torrent_title = data[number].title;

          //do some checking to see if we got a magnet link or a link to the torrent page
          //not all torrent sites have the link on the index
          if(data[number].torrent_link) {
            torrent = data[number].torrent_link;
            if(options.open) {
                console.log('Opening ' + chalk.green(torrent_title));
                opn(torrent);
            } else {
                console.log('Streaming ' + chalk.green(torrent_title));
                parseTorrent(torrent, torrent_title);
            }

          } else if(data[number].torrent_site) {
            torrent_search.torrentSearch(data[number].torrent_site).then(function(data) {
              torrent = data;
              if(options.open) {
                  console.log('Opening ' + chalk.green(torrent_title));
                  opn(torrent);
              } else {
                  console.log('Streaming ' + chalk.green(torrent_title));
                  parseTorrent(torrent, torrent_title);
              }

            }, function onReject(err) {
              console.log(chalk.red(err));
              firstPrompt();
            });

          }

        }
        });
    }

    function parseTorrent(torrent, torrent_title){

      tparse.parseTorrent(torrent).then(function(data) {
        //if true more than one file can be played
        if(data !== false){
          console.log(chalk.green("Multiple torrent file detected."));
          var torrent_count = 1;

          data.forEach(function(torrents) {
            console.log(
              chalk.magenta(torrent_count) + chalk.magenta('\) ') + chalk.yellow(torrents)
            );
            torrent_count++;
          });
          inquirer.prompt([
            {
              type: "input",
              name: "torrent",
              message: chalk.green(select_file),
              validate: function( value ) {
                if(value > data.length){
                  return "Please enter a valid file number (1-"+data.length+")";
                }else if(!value){
                  return "Please enter a valid file number (1-"+data.length+")";
                } else if(value == "b"){
                  return true;
                } else if(value == "e"){
                  return true;
                }else if(!value.match(/\d+/g)){
                  return "Please enter a valid torrent number (1-"+data.length+")";
                } else {
                  return true;
                }
              }
            }
            ], function( answer ) {
              if(answer.torrent === "b"){
                firstPrompt();
              }else if(answer.torrent === "e"){
                exitApp();
              } else {
                number = answer.t;
                torrent_index = answer.torrent-1;
                torrent_title = data[torrent_index];
                console.log('Streaming ' + chalk.green(torrent_title));
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

    function writeHistory(torrent_name) {
        get_hist_object.set(torrent_name, torrent_name);
    }

    function exitApp(){
      console.log(chalk.red("Exiting app..."));
      process.exit(code=0);
    }

    function printHistory(){

      histcount = 1;

      if(history === "true"){
        var all_hist = get_hist_object.all;

        if(get_hist_object.size < 1){
          console.log(chalk.red("Your history file is empty, Go watch some torrents!"));
        } else {
          console.log(chalk.green("Watched History: "));
          Object.keys(all_hist).forEach(function(key) {
              console.log(chalk.red(histcount + ' ') + chalk.magenta(all_hist[key]));
              histcount++;
          });
        }

      } else {
        console.log(chalk.red("History is not enabled"));
      }
    }

    function searchHistory(search_title) {
      var result = get_hist_object.get(search_title);
      if(result === search_title){
        return true;
      } else {
        return false;
      }
    }

    function streamTorrent_wo_sub_list(torrent, index){
      var argsList;
      var Torrent;
      if(isWindows){
        Torrent = '""' + torrent + '""';
      } else {
        Torrent = torrent;
      }
      if(peerflix_player === "--airplay"){
        argsList =  [Torrent, "--i=" + index, peerflix_player];
      } else {
        argsList = [Torrent, "--i=" + index, peerflix_player, peerflix_player_arg, peerflix_port];
      }
      osSpecificSpawn(peerflix_command, argsList);
    }

    function streamTorrent_sub_list(torrent, index){
      var argsList;
      var Torrent;
      if(isWindows){
        Torrent = '""' + torrent + '""';
      } else {
        Torrent = torrent;
      }
      if(peerflix_player === "--airplay"){
        argsList =  [Torrent, "--i=" + index, peerflix_player];
      } else {
       argsList = [Torrent, "--subtitles=" + peerflix_subtitle, "--i=" + index, peerflix_player, peerflix_player_arg, peerflix_port];
      }
      osSpecificSpawn(peerflix_command, argsList);
    }

    function streamTorrent_wosub(torrent){
      var argsList;
      var Torrent;
      if(isWindows){
        Torrent = '""' + torrent + '""';
      } else {
        Torrent = torrent;
      }
      if(peerflix_player === "--airplay"){
        argsList =  [Torrent, peerflix_player];
      } else {
        argsList =  [Torrent, peerflix_player, peerflix_player_arg, peerflix_port];
      }
      osSpecificSpawn(peerflix_command, argsList);
    }

    function streamTorrent_sub(torrent){
      var argsList;
      var Torrent;
      if(isWindows){
        Torrent = '""' + torrent + '""';
      } else {
        Torrent = torrent;
      }
      if(peerflix_player === "--airplay"){
        argsList =  [Torrent, peerflix_player];
      } else {
        argsList = [Torrent, "--subtitles=" + peerflix_subtitle, peerflix_player, peerflix_player_arg, peerflix_port];
      }
      osSpecificSpawn(peerflix_command, argsList);
    }

    function osSpecificSpawn(command, argsList){

      if(isWindows){
        //we must call peerflix using cmd.exe if on windows
        if(peerflix_path){
          argsList.push('--path=' + peerflix_path + '');
        }

        spawn(command, argsList, {stdio:'inherit'});
      }else{

        if(peerflix_path){
          argsList.push('--path=' + peerflix_path + '');
        }

        spawn(command, argsList, {stdio:'inherit'});

      }
    }

}).call(this);
