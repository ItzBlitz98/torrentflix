(function() {
    var program = require("commander");
    var os = require('os');
    var fs = require('fs');
    var http = require('http');
    var kickass = require('./kickass.js');
    var rarbg = require('./rarbg.js');
    var eztv = require('./eztv.js');
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
    var tparse = require('./torrent_parse.js');
    var language = require('../lang.js');
    var chalk = require('chalk');
    var inquirer = require('inquirer');
    var spawn = require('child_process').spawn;
    var path = require('path');
    var appDir = path.dirname(require.main.filename).split('bin').join('');

    var isWindows = process.platform === 'win32';

    var kickass_url, rarbg_url, btdigg_url, limetorrents_url, extratorrent_url, yts_url,
        tpb_url, eztv_url, nyaa_url, tokyotosho_url, peerflix_player, peerflix_player_arg,
        peerflix_port, peerflix_command, use_subtitle, subtitle_language, history, history_location,
        conf_date_added, history_object, config_location, cat, page;

    //load in language settings
    var lang = language.getEn();
    var torrent_site = lang[0].torrent_site;
    var search_torrent = lang[0].search_torrent;
    var torrent_site_num = lang[0].torrent_site_num;
    var select_torrent = lang[0].select_torrent;
    var select_file = lang[0].select_file;
    var site_error = lang[0].site_error;


    exports.AppInitialize = start = function(config_object, hist_object, settings_object) {
      //setting up vars from config
      kickass_url = config_object.kickass_url;
      rarbg_url = config_object.rarbg_url;
      limetorrents_url = config_object.limetorrents_url;
      extratorrent_url = config_object.extratorrent_url;
      yts_url = config_object.yts_url;
      seedpeer_url = config_object.seedpeer_url;
      leetx_url = config_object.leetx_url;
      tpb_url = config_object.tpb_url;
      eztv_url = config_object.eztv_url;
      nyaa_url = config_object.nyaa_url;
      btdigg_url = config_object.btdigg_url;
      tokyotosho_url = config_object.tokyotosho_url;
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

      //settiing up vars from settings object
      config_location = settings_object.config_location;
      history_location = settings_object.history_location;

      //setting up var from history object
      history_object = hist_object;

      if(settings_object.history_location){
        history_location = settings_object.history_location+"torrentflix_history.json";
      } else {
        history_location = appDir + "torrentflix_history.json";
      }

      firstPrompt();

    };



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
      if(seedpeer_url){
        sites.push({'key': "seedpeer", name: chalk.magenta.bold('Seedpeer'), value: "seedpeer"});
      }
      if(btdigg_url){
        sites.push({'key': "btdigg", name : chalk.magenta.bold('BTDigg'), value: "btdigg"});
      }
      if(strike_url){
        sites.push({'key': "strike", name: chalk.magenta.bold('GetStrike'), value: "strike"});
      }
      if(leetx_url){
        sites.push({'key': "leetx", name: chalk.magenta.bold('1337x'), value: "leetx"});
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

      sites.push({'key': "exit", name: chalk.red.bold('Exit app'), value: "exit"});

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
      } else if(site == "exit"){
        exitApp();
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
            } else if(site === "seedpeer"){
              seedpeerSearch(answer.search);
            } else if(site === "strike"){
              strikeSearch(answer.search);
            } else if(site === "btdigg"){
              btdiggSearch(answer.search);
            } else if(site === "leetx"){
              leetxSearch(answer.search);
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

    function btdiggSearch(query){
      console.log(chalk.green.bold("Searching for ") + chalk.bold.blue(query));
      btdigg.search(query, btdigg_url).then(function onResolve(data) {
        for (var torrent in data) {
          var number = data[torrent].torrent_num;
          var title = data[torrent].title;
          var size = data[torrent].size;

          if(history == "true"){
            var found = searchHistory(title);
            if(found[0]){
               title_size = chalk.red.bold(data[torrent].title);
             } else {
               title_size = chalk.yellow.bold(data[torrent].title);
             }
          } else {
            title_size = chalk.yellow.bold(data[torrent].title);
          }

          console.log(
            chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + title_size + (' ') + chalk.blue.bold(size) + (' ')
          );
        }

        selectTorrent(data);
      }, function onReject(err) {
        console.log(chalk.red.bold(err));
        firstPrompt();
      });
    }

    function eztvSearch(query){
      console.log(chalk.green.bold("Searching for ") + chalk.bold.blue(query));
      eztv.search(query, cat, page, eztv_url).then(function onResolve(data) {

        for (var torrent in data) {
          var date_added, title_size;
          var number = data[torrent].torrent_num;
          var title = data[torrent].title;
          //var title_size = data[torrent].title_size;
          var size = data[torrent].size;
          var seed = data[torrent].seeds;
          var leech = data[torrent].leechs;

          if(conf_date_added == "true"){
            date_added = chalk.cyan.bold(" " + data[torrent].date_added + "");
          } else {
            date_added = "";
          }

          if(history == "true"){
            var found = searchHistory(title);
            if(found[0]){
               title_size = chalk.red.bold(data[torrent].title_size);
             } else {
               title_size = chalk.yellow.bold(data[torrent].title_size);
             }
          } else {
            title_size = chalk.yellow.bold(data[torrent].title_size);
          }

          console.log(
            chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + title_size + date_added + (' ') + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
          );
        }

        selectTorrent(data);
      }, function onReject(err) {
        console.log(chalk.red.bold(err));
        firstPrompt();
      });
    }


    function leetxSearch(query){
      console.log(chalk.green.bold("Searching for ") + chalk.bold.blue(query));

      leetx.search(query, leetx_url).then(function onResolve(data) {

        for (var torrent in data) {
          var date_added, title;
          var number = data[torrent].torrent_num;
          //var title = data[torrent].title;
          var size = data[torrent].size;
          var seed = data[torrent].seeds;
          var leech = data[torrent].leechs;

          if(history == "true"){
            var found = searchHistory(data[torrent].title);
            if(found[0]){
               title = chalk.red.bold(data[torrent].title);
             } else {
               title = chalk.yellow.bold(data[torrent].title);
             }
          } else {
            title = chalk.yellow.bold(data[torrent].title);
          }

          console.log(
            chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + title + (' ') + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
          );
        }

        selectTorrent(data);

      }, function onReject(err) {
        console.log(chalk.red.bold(err));
        firstPrompt();
      });

    }


    function seedpeerSearch(query){
      console.log(chalk.green.bold("Searching for ") + chalk.bold.blue(query));

      seedpeer.search(query, seedpeer_url).then(function onResolve(data) {

        for (var torrent in data) {
          var date_added, title;
          var number = data[torrent].torrent_num;
          //var title = data[torrent].title;
          var size = data[torrent].size;
          var seed = data[torrent].seeds;
          var leech = data[torrent].leechs;

          if(conf_date_added == "true"){
            date_added = chalk.cyan.bold(" " + data[torrent].date_added + "");
          } else {
            date_added = "";
          }

          if(history == "true"){
            var found = searchHistory(data[torrent].title);
            if(found[0]){
               title = chalk.red.bold(data[torrent].title);
             } else {
               title = chalk.yellow.bold(data[torrent].title);
             }
          } else {
            title = chalk.yellow.bold(data[torrent].title);
          }

          console.log(
            chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + title + date_added + (' ') + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
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
          var date_added, title;
          var number = data[torrent].torrent_num;
          //var title = data[torrent].title;
          var size = data[torrent].size;
          var seed = data[torrent].seeds;
          var leech = data[torrent].leechs;

          if(conf_date_added == "true"){
            date_added = chalk.cyan.bold(" " + data[torrent].date_added + "");
          } else {
            date_added = "";
          }

          if(history == "true"){
            var found = searchHistory(data[torrent].title);
            if(found[0]){
               title = chalk.red.bold(data[torrent].title);
             } else {
               title = chalk.yellow.bold(data[torrent].title);
             }
          } else {
            title = chalk.yellow.bold(data[torrent].title);
          }

          console.log(
            chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + title + date_added + (' ') + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
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
          var title;
          var number = data[torrent].torrent_num;
          //var title = data[torrent].title;
          var size = data[torrent].size;
          var seed = data[torrent].seeds;
          var leech = data[torrent].leechs;

          if(history == "true"){
            var found = searchHistory(data[torrent].title);
            if(found[0]){
               title = chalk.red.bold(data[torrent].title);
             } else {
               title = chalk.yellow.bold(data[torrent].title);
             }
          } else {
            title = chalk.yellow.bold(data[torrent].title);
          }

          console.log(
            chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + title + (' ') + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
          );
        }

        selectTorrent(data);
      }, function onReject(err) {
        console.log(chalk.red.bold(err));
        firstPrompt();
      });
    }

    function strikeSearch(query){
      console.log(chalk.green.bold("Searching for ") + chalk.bold.blue(query));
      strike.search(query, cat, page, strike_url).then(function onResolve(data) {

        for (var torrent in data) {
          var title;
          var number = data[torrent].torrent_num;
          //var title = data[torrent].title;
          var size = data[torrent].size;
          var seed = data[torrent].seeds;
          var leech = data[torrent].leechs;

          if(conf_date_added == "true"){
            date_added = chalk.cyan.bold(" " + data[torrent].date_added + "");
          } else {
            date_added = "";
          }

          if(history == "true"){
            var found = searchHistory(data[torrent].title);
            if(found[0]){
               title = chalk.red.bold(data[torrent].title);
             } else {
               title = chalk.yellow.bold(data[torrent].title);
             }
          } else {
            title = chalk.yellow.bold(data[torrent].title);
          }

          console.log(
            chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + title + date_added + (' ') + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
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
          var date_added, title;
          var number = data[torrent].torrent_num;
          //var title = data[torrent].title;
          var size = data[torrent].size;
          var seed = data[torrent].seeds;
          var leech = data[torrent].leech;

          if(history == "true"){
            var found = searchHistory(data[torrent].title);
            if(found[0]){
               title = chalk.red.bold(data[torrent].title);
             } else {
               title = chalk.yellow.bold(data[torrent].title);
             }
          } else {
            title = chalk.yellow.bold(data[torrent].title);
          }

          if(conf_date_added == "true"){
            date_added = chalk.cyan.bold(" " + data[torrent].date_added + "");
          } else {
            date_added = "";
          }

          console.log(
            chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + title + date_added + (' ') + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
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
          var torrent_verified, date_added, title;
          var number = data[torrent].torrent_num;
          //var title = data[torrent].title;
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

          if(history == "true"){
            var found = searchHistory(data[torrent].title);
            if(found[0]){
               title = chalk.red.bold(data[torrent].title);
             } else {
               title = chalk.yellow.bold(data[torrent].title);
             }
          } else {
            title = chalk.yellow.bold(data[torrent].title);
          }

          console.log(
            chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + title + torrent_verified + date_added + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
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
          var date_added, title;
          var number = data[torrent].torrent_num;
          //var title = data[torrent].title;
          var size = data[torrent].size;
          var seed = data[torrent].seeds;
          var leech = data[torrent].leechs;

          if(conf_date_added == "true"){
            date_added = chalk.cyan.bold(" " + data[torrent].date_added + "");
          } else {
            date_added = "";
          }

          if(history == "true"){
            var found = searchHistory(data[torrent].title);
            if(found[0]){
               title = chalk.red.bold(data[torrent].title);
             } else {
               title = chalk.yellow.bold(data[torrent].title);
             }
          } else {
            title = chalk.yellow.bold(data[torrent].title);
          }

          console.log(
            chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + title + date_added + (' ') + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
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
          var date_added, title;
          var number = data[torrent].torrent_num;
          //var title = data[torrent].title;
          var size = data[torrent].size;
          var seed = data[torrent].seeds;
          var leech = data[torrent].leechs;
          var torrent_verified = data[torrent].torrent_verified;
          if(conf_date_added == "true"){
            date_added = chalk.cyan.bold("" + data[torrent].date_added + " ");
          } else {
            date_added = "";
          }

          if(history == "true"){
            var found = searchHistory(data[torrent].title);
            if(found[0]){
               title = chalk.red.bold(data[torrent].title);
             } else {
               title = chalk.yellow.bold(data[torrent].title);
             }
          } else {
            title = chalk.yellow.bold(data[torrent].title);
          }

          console.log(
            chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + title + chalk.green(torrent_verified) + date_added + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
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
          var title;
          var number = data[torrent].torrent_num;
          //var title = data[torrent].title;
          var size = data[torrent].size;
          var seed = data[torrent].seeds;
          var leech = data[torrent].leechs;

          if(history == "true"){
            var found = searchHistory(data[torrent].title);
            if(found[0]){
               title = chalk.red.bold(data[torrent].title);
             } else {
               title = chalk.yellow.bold(data[torrent].title);
             }
          } else {
            title = chalk.yellow.bold(data[torrent].title);
          }

          console.log(
            chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + title + (' ') + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
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
          var date_added, title;
          var number = data[torrent].torrent_num;
          //var title = data[torrent].title;
          var size = data[torrent].size;
          var seed = data[torrent].seeds;
          var leech = data[torrent].leechs;
          if(conf_date_added == "true"){
            date_added = chalk.cyan.bold(" " + data[torrent].date_added + "");
          } else {
            date_added = "";
          }

          if(history == "true"){
            var found = searchHistory(data[torrent].title);
            if(found[0]){
               title = chalk.red.bold(data[torrent].title);
             } else {
               title = chalk.yellow.bold(data[torrent].title);
             }
          } else {
            title = chalk.yellow.bold(data[torrent].title);
          }

          console.log(
            chalk.magenta.bold(number) + chalk.magenta.bold('\) ') + title + date_added + (' ') + chalk.blue.bold(size) + (' ') + chalk.green.bold(seed) + (' ') + chalk.red.bold(leech)
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
          if(data[number].torrent_link){

            console.log('Streaming ' + chalk.green.bold(torrent_title));
            torrent = data[number].torrent_link;
            parseTorrent(torrent, torrent_title);

          } else if(data[number].torrent_site){

            torrent_search.torrentSearch(data[number].torrent_site).then(function(data) {

              console.log('Streaming ' + chalk.green.bold(torrent_title));
              torrent = data;
              parseTorrent(torrent, torrent_title);


            }, function onReject(err) {
              console.log(chalk.red.bold(err));
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
              message: chalk.green.bold(select_file),
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

    function exitApp(){
      console.log(chalk.red.bold("Exiting app..."));
      process.exit(code=0);
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

    function searchHistory(search_title) {
      return history_object.filter(
          function(history_object){return history_object.torrent == search_title;}
      );
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
