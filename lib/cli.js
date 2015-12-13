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

    var torrent_sources = {
        "kickass_url":      "https://kat.cr",
        "limetorrents_url": "http://limetorrents.cc",
        "extratorrent_url": "http://extratorrent.cc",
        "strike_url":       "https://getstrike.net",
        "yts_url":          "https://yts.ag",
        "tpb_url":          "https://thepiratebay.la",
        "btdigg_url":       "https://btdigg.org",
        "seedpeer_url":     "http://seedpeer.eu",
        "leetx_url":        "https://1337x.to",
        "nyaa_url":         "http://www.nyaa.se",
        "tokyotosho_url":   "https://www.tokyotosho.info",
        "cpasbien_url":     "http://www.cpasbien.io",
        "eztv_url":         "https://www.eztv.ag",
        "rarbg_api_url":    "https://torrentapi.org"
    }

    var conf_options = {
        "peerflix_player":      "--vlc",
        "peerflix_player_args": "",
        "peerflix_port":        "--port=8888",
        "peerflix_path":        "",
        "peerflix_command":     "peerflix",
        "use_subtitle":         "false",
        "subtitle_language":    "eng",
        "history":              "false",
        "date_added":           "false"
    }

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
                AppInitialize(program);

            } else {
              AppInitialize(program);
            }
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
            
            //add sources in the config file
            for (var source in torrent_sources) {
                conf.set(source, torrent_sources[source]);
            }
            //add config options
            for (var option in conf_options) {
                conf.set(option, conf_options[option]);
            }

            console.log(chalk.green("A new config file has been created you can find it at: "));
            console.log(chalk.green(conf.path));

            main.AppInitialize(appOpts);
        } else {

            //config file exist, make verifications

            //create source if not exist
            for (var source in torrent_sources) {
                if(!conf.get(source)){
                    conf.set(source, torrent_sources[source]);
                }
            }
            //create options if not exist
            for (var option in conf_options) {
                if(!conf.get(option)){
                    conf.set(option, conf_options[option]);
                }
            }

          main.AppInitialize(appOpts);
        }
    }

    function clearHistory() {
      var hist = new Configstore("torrentflix_history", {});
      hist.clear();
    }

}).call(this);
