(function () {
    var program = require("commander");
    var fs = require('fs');
    var path = require('path');
    var async = require('async');
    var chalk = require('chalk');
    var main = require("./main");
    var spawn = require('child_process').spawn;
    var pkg = require("../package.json");
    var Configstore = require('configstore');
    var appDir = path.dirname(require.main.filename).split('bin').join('');

    var config_object, settings_object, history_object;
    var blank_history = [];

    //setting up command line options
    program
        .version(pkg.version)
        //.option('--config', 'Edit torrentflix config EX: torrentflix --config="nano"')
        //.option('--history', 'View torrentflix history EX: torrentflix --history')
        .option('--clear', 'Clear torrentflix history EX torrentflix --clear')
        //.option('--location', 'Change where torrentflix\' config & history is located EX torrentflix --location"/home/gshock/.config"')
        .parse(process.argv);

    //if config command has been called
    if (program.config) {
        if (program.args[0]) {
            //open up stock or custom config in the users choice of editor
            var edit_conf;

            if (original_settings_object.config_location) {
                edit_conf = original_settings_object.config_location + "torrentflix_config.json";
            } else {
                edit_conf = appDir + "torrentflix_config.json";
            }
            spawn(program.args[0], [edit_conf], {
                stdio: 'inherit'
            });
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
        //no arguments passed run the program
        AppInitialize();
    }

    program.parse(process.argv);

    function AppInitialize() {
        var conf = new Configstore("torrentflix_config", {});
        var hist = new Configstore("torrentflix_history", {});
        if (conf.size < 1) {
            //add some defaults to the config
            conf.set("kickass_url", "https://kat.cr");
            conf.set("rarbg_url", "https://rarbg.com");
            conf.set("limetorrents_url", "http://limetorrents.cc");
            conf.set("extratorrent_url", "http://extratorrent.cc");
            conf.set("strike_url", "https://getstrike.net");
            conf.set("yts_url", "https://yts.to");
            conf.set("tpb_url", "https://thepiratebay.la");
            conf.set("btdigg_url", "https://btdigg.org");
            conf.set("seedpeer_url", "http://seedpeer.eu");
            conf.set("leetx_url", "https://1337x.to");
            conf.set("nyaa_url", "http://www.nyaa.se");
            conf.set("tokyotosho_url", "https://www.tokyotosho.info");
            conf.set("peerflix_player", "--vlc");
            conf.set("peerflix_player_args", "");
            conf.set("peerflix_port", "--port=8888");
            conf.set("peerflix_command", "peerflix");
            conf.set("use_subtitle", "false");
            conf.set("subtitle_language", "eng");
            conf.set("history", "false");
            conf.set("date_added", "false");

            console.log(chalk.green("A new config file has been created you can find it at: "));
            console.log(chalk.green(conf.path));

            main.AppInitialize();
        } else {
          main.AppInitialize();
        }
    }

    function clearHistory() {
      var hist = new Configstore("torrentflix_history", {});
      hist.clear();
    }

}).call(this);
