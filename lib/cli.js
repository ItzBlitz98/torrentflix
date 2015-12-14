(function () {
    var program = require("commander");
    var fs = require('fs');
    var path = require('path');
    var request = require('request');
    var async = require('async');
    var chalk = require('chalk');
    var main = require("./main");
    var spawn = require('child_process').spawn;
    var pkg = require("../package.json");
    var Configstore = require('configstore');
    var appDir = path.dirname(require.main.filename).split('bin').join('');

    var config_object, settings_object, history_object;
    var blank_history = [];

    // definition of all options
    // example for source scrapers - short_name: {name: longname, url: base_url}
    // short name has to be equal to the name of the scraper object define in 
    // main.js 
    var config_vars = {
        "torrent_sources": {
            "kickass": {
                name: 'Kickass',
                url: "https://kat.cr"
            },
            "limetorrents": {
                name: 'LimeTorrents',
                url: "http://limetorrents.cc"
            },
            "extratorrent": {
                name: 'ExtraTorrent',
                url: "http://extratorrent.cc"
            },
            "strike": {
                name: 'GetStrike',
                url: "https://getstrike.net"
            },
            "yts": {
                name: 'YTS',
                url: "https://yts.ag"
            },
            "tpb": {
                name: 'The Pirate Bay',
                url: "https://thepiratebay.la"
            },
            "btdigg": {
                name: 'BTDigg',
                url: "https://btdigg.org"
            },
            "seedpeer": {
                name: 'Seedpeer',
                url: "http://seedpeer.eu"
            },
            "leetx": {
                name: '1337x',
                url: "https://1337x.to"
            },
            "nyaa": {
                name: 'Nyaa',
                url: "http://www.nyaa.se"
            },
            "tokyotosho": {
                name: 'Tokiotosho',
                url: "https://www.tokyotosho.info"
            },
            "cpasbien": {
                name: 'Cpasbien',
                url: "http://www.cpasbien.io"
            },
            "eztv": {
                name: 'Eztv',
                url: "https://www.eztv.ag"
            },
            "rarbg": {
                name: 'Rarbg',
                url: "https://torrentapi.org"
            }
        },
        "options": {
            "peerflix_player":      "--vlc",
            "peerflix_player_args": "",
            "peerflix_port":        "--port=8888",
            "peerflix_path":        "",
            "peerflix_command":     "peerflix",
            "use_subtitle":         "false",
            "subtitle_language":    "eng",
            "history":              "false",
            "date_added":           "false",
        }          
    };

    //setting up command line options
    program
        .version(pkg.version)
        .option('--config', 'Edit torrentflix config EX: torrentflix --config="nano"')
        .option('-s, --search [title]', 'item to search for EX: -s title')
        .option('-o, --open [title]', 'open torrent with default app or xdg-open')
        //.option('--history', 'View torrentflix history EX: torrentflix --history')
        .option('--clear', 'Clear torrentflix history EX torrentflix --clear')
        //.option('--location', 'Change where torrentflix\' config & history is located EX torrentflix --location"/home/gshock/.config"')
        .parse(process.argv);

    //if config command has been called
    if (program.config) {
        if (program.args[0]) {
            //open up stock or custom config in the users choice of editor
            var edit_conf;
            var conf = new Configstore("torrentflix_config", {});
            edit_conf = conf.path;

            if (conf.size < 1) {
              console.log(chalk.red('A config file has not been created yet.'));
              console.log(chalk.red('Please run torrentflix at least once to create one.'));
            } else {
              spawn(program.args[0], [edit_conf], {
                  stdio: 'inherit'
              });
            }
            //they didn't specify an editor ask the user to specify one
        } else {
            console.log('Please specify an editor');
            console.log("  Example:");
            console.log('');
            console.log('    $ torrentflix --config="nano"');
        }
        //history command called
        //} else if (program.history) {
        //TODO
        //clear history command called
    } else if (program.clear) {
        clearHistory();
    } else {
        //do an update check
        var url = "https://raw.githubusercontent.com/ItzBlitz98/torrentflix/master/package.json";
        request(url, function (err, response, body) {
            if (!err && response.statusCode === 200) {
                data = JSON.parse(body);
                if (data.version > pkg.version) {
                    console.log(chalk.red('A new version of torrentflix is available run:'));
                    console.log("");
                    console.log('$ npm install -g torrentflix');
                    console.log("");
                    console.log(chalk.red('Or go here to get it: https://github.com/ItzBlitz98/torrentflix'));
                }
            }
            AppInitialize(program);
        });
    }

    program.parse(process.argv);

    function AppInitialize(prog) {
        var appOpts = {
            open: prog.open,
            search: prog.search
        };
        var conf = new Configstore("torrentflix_config", {});
        var hist = new Configstore("torrentflix_history", {});
        if (conf.size < 1) {
            //create config file with default
            conf.set(config_vars);

            console.log(chalk.green("A new config file has been created you can find it at: "));
            console.log(chalk.green(conf.path));

            main.AppInitialize(appOpts);
        } else {

            // config file exist, get values
            var conf_file = conf.all;
            var need_save = false;
            // create these if not exists
            for (var type in config_vars) {
                for (var option in config_vars[type]) {
                    if (!(option in conf_file[type])) {
                        conf_file[type][option] = config_vars[type][option];
                        need_save = true;
                    } 
                }
            }

            //save updates
            if (need_save) { 
                conf.set(conf_file);
            }


          main.AppInitialize(appOpts);
        }
    }

    function clearHistory() {
      var hist = new Configstore("torrentflix_history", {});
      hist.clear();
    }

}).call(this);
