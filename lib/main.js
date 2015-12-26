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
    var torrentproject = require('./torrentproject.js');
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
    var peerflix_player, peerflix_player_arg, peerflix_port, peerflix_command,
        use_subtitle, subtitle_language, history, history_location,
        conf_date_added, history_object, config_location, cat, page,
        peerflix_path, limit;

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

    // link short_name and scraper object
    var scrapers = {
      'cpasbien': cpasbien,
      'kickass': kickass,
      'rarbg': rarbg,
      'strike': strike,
      'limetorrents': limetorrents,
      'extratorrent': extratorrent,
      'tpb': tpb,
      'yts': yts,
      'btdigg': btdigg,
      'seedpeer': seedpeer,
      'leetx': leetx,
      'nyaa': nyaa,
      'tokyotosho': tokyotosho,
      'eztv': eztv,
      'torrentproject': torrentproject
    };

    exports.AppInitialize = start = function(optns) {
      // get option pass in cli (-s, -o, ...)
      options = optns;

      // get all options from the config file
      config_object = get_conf_object.all;

      //setting up vars from config
      peerflix_player = config_object.options.peerflix_player;
      peerflix_player_arg = config_object.options.peerflix_player_args;
      peerflix_port = config_object.options.peerflix_port;
      peerflix_command = config_object.options.peerflix_command;
      use_subtitle = config_object.options.use_subtitle;
      subtitle_language = config_object.options.subtitle_language;
      history = config_object.options.history;
      conf_date_added = config_object.options.date_added;
      page = 1;
      peerflix_path = config_object.options.peerflix_path;

      firstPrompt(options);

    };



    function firstPrompt(options) {
      var sites = [];
      var source;

      if (options.limit && options.limit !== true) {
        limit = options.limit;
      }
      if (options.engine === true) {
        console.log(chalk.red("Please specify the name of search engine to use :"));
        for (source in config_object.torrent_sources) {
          // show the source list
          console.log(config_object.torrent_sources[source].name + " -> " +
            chalk.green(source));
        }
      }
      else if (options.engine) {
        engine = options.engine;
        // engine exist ?
        if (config_object.torrent_sources[options.engine]) {
          torrentSite(options.engine, limit);
        } else {
          console.log(chalk.red(engine + " not exist. Please specify the name "+
            "of search engine to use :"));
          for (source in config_object.torrent_sources) {
            // show the source list
            console.log(config_object.torrent_sources[source].name + " -> " +
              chalk.green(source));
          }
        }
      } else {
        for (source in config_object.torrent_sources) {
          // add torrent sources
          sites.push({
              'key': source,
              name: chalk.magenta(config_object.torrent_sources[source].name),
              value: source
            });
        }
        if (history === "true") {
          sites.push({
            'key': "print history",
            name: chalk.blue('Print history'),
            value: "print history"
          });
        }
        sites.push({'key': "exit", name: chalk.red('Exit app'), value: "exit"});

        inquirer.prompt([{
            type: "list",
            name: "site",
            message: chalk.green("What torrent site do you want to search?"),
            choices: sites
          }], function(answer) {
            torrentSite(answer.site, limit);
          });
      }
    }

    function torrentSite(site, limit) {

      if (site == "print history") {
        printHistory();
        firstPrompt(options);
      } else if (site == "exit") {
        exitApp();
      } else {
        // if -s and not empty
        if (options.search && options.search !== true) {
            Search(options.search, site, cat, page, limit);
        // if -o and not empty
        } else if (options.open && options.open !== true) {
            Search(options.open, site, cat, page, limit);
        } else {
          inquirer.prompt([
            {
              type: "input",
              name: "search",
              message: chalk.green(search_torrent),
            }
          ],
          function(answer) {
            Search(answer.search, site, cat, page, limit);
          });
        }
      }
    }

    function Search(query, site, cat, page, limit) {
      // general search function for all sources
      console.log(chalk.green("Searching for ") + chalk.blue(query) +
        chalk.green(" on ") + chalk.blue(
          config_object.torrent_sources[site].name) + chalk.green("..."));

      search_url = config_object.torrent_sources[site].url;
      scrapers[site].search(query, search_url, cat, page, limit).then(
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
        firstPrompt(options);
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
          firstPrompt(options);
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
              firstPrompt(options);
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
                firstPrompt(options);
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

      if(peerflix_path){
        argsList.push('--path=' + peerflix_path + '');
      }

      spawn(command, argsList, {stdio:'inherit'});
    }

}).call(this);
