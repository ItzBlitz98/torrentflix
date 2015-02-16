(function () {
    var program = require("commander");
    var fs = require('fs');
    var path = require('path');
    var async = require('async');
    var chalk = require('chalk');
    var main = require("./main");
    var spawn = require('child_process').spawn;
    var pkg = require("../package.json");
    var appDir = path.dirname(require.main.filename).split('bin').join('');

    var original_config_object = require('../torrentflix_config.json');
    var original_settings_object = require('../settings.json');
    var original_history_object = require('../torrentflix_history.json');
    var config_object, settings_object, history_object;
    var blank_history = [];

    //setting up command line options
    program
        .version(pkg.version)
        .option('--config', 'Edit torrentflix config EX: torrentflix --config="nano"')
        //.option('--history', 'View torrentflix history EX: torrentflix --history')
        .option('--clear', 'Clear torrentflix history EX torrentflix --clear')
        .option('--location', 'Change where torrentflix\' config & history is located EX torrentflix --location"/home/gshock/.config"')
        .parse(process.argv);

    //if config command has been called
    if (program.config) {
        if (program.args[0]) {
          //open up stock or custom config in the users choice of editor
          var edit_conf;

          if(original_settings_object.config_location){
            edit_conf = original_settings_object.config_location+"torrentflix_config.json";
          } else {
            edit_conf = appDir+"torrentflix_config.json";
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
    //change torrentflix location
    } else if (program.location){
      if (program.args[0]) {
        changeLocation(program.args[0]);
      //they didn't specify a path ask the user to specify one
      } else {
          console.log('Please specify where you want to config to be saved');
          console.log("  Example:");
          console.log('');
          console.log('    $ torrentflix --location="/home/gshock/.config"');
      }
    } else {
      //no arguments passed run the program
      AppInitialize();
    }

    program.parse(process.argv);

    function AppInitialize(){
      //we need to do some async tasks first before running the actual app
      async.series([

          //custom config function
          function(callback) {
            //check to see if a custom location has been set for config
            if(original_settings_object.config_location){
              var custom_config = original_settings_object.config_location +"torrentflix_config.json";

              //if it has check if it exsists
              if (fs.existsSync(custom_config)) {
                //it does exsist use it
                fs.readFile(custom_config, 'utf8', function (err, data) {
                  if (err) throw err;
                  //ensure the custom config file is valid json
                  if(IsJsonString(data)){
                    config_object = JSON.parse(data);
                    callback(null, 'one');
                  } else {
                    //supplied config is not valid
                    console.log(chalk.red.bold("There was something wrong with the custom config file, Falling back to default."));
                    var stock_config = appDir + "torrentflix_config.json";
                    fs.readFile(stock_config, 'utf8', function (err, data) {
                      if (err) throw err;
                      config_object = JSON.parse(data);
                      callback(null, 'one');
                    });
                  }
                });
                //callback(null, 'one');
              }else{
                //it does not exsist create it and write the stock config to it
                fs.writeFile(custom_config, JSON.stringify(original_config_object, null, 4), function (err) {
                  if (err) {
                    return console.log(err);
                  } else {
                    //config_object = JSON.parse(fs.readFileSync(custom_config, 'utf8'));
                    fs.readFile(custom_config, 'utf8', function (err, data) {
                      if (err) throw err;
                      config_object = JSON.parse(data);
                      callback(null, 'one');
                    });
                  }
                });
              }
            }else{
              //a custom config has not been specified use the stock one
              var stock_config = appDir + "torrentflix_config.json";
              fs.readFile(stock_config, 'utf8', function (err, data) {
                if (err) throw err;
                config_object = JSON.parse(data);
                callback(null, 'one');
              });
              //callback(null, 'one');
            }
          },

          //history function
          function(callback) {
            //only run if history is enabled
            if(config_object.history === "true"){
              //check to see if a custom location has been set for history
              if(original_settings_object.history_location){
                var custom_history = original_settings_object.history_location +"torrentflix_history.json";

                //if it has check if it exsists
                if (fs.existsSync(custom_history)) {
                  //it does exsist
                  history_object = require(custom_history);
                  callback(null, 'two');
                }else{
                  //it does not exsist create it and write the some boiler to it
                  var blank_history = [];
                  fs.writeFile(custom_history, JSON.stringify(blank_history, null, 4), function (err) {
                    if (err){
                      return console.log(err);
                    } else {
                      history_object = require(custom_history);
                      callback(null, 'two');
                    }
                  });
                }
              }else{
                //a custom history file has not been specified
                history_object = require('../torrentflix_history.json');
                callback(null, 'two');
              }
            } else {
              //history is not enabled skip
              callback(null, 'two');
            }
          },

      ], function(err, results){
          //run main app
          main.AppInitialize(config_object, history_object, original_settings_object);
      });

    }

    function clearHistory(){
      //we need to figure out if the user is using a custom history location or not
      if(original_settings_object.history_location){
          //they are clear the custom one
          fs.writeFile(original_settings_object.history_location +"torrentflix_history.json", JSON.stringify(blank_history, null, 4), function (err) {
            if (err) return console.log(err);
            console.log("history cleared");
          });
      } else {
        //they are using the stock history location
        fs.writeFile(appDir + "torrentflix_history.json", JSON.stringify(blank_history, null, 4), function (err) {
          if (err) return console.log(err);
          console.log(chalk.green.bold("history cleared"));
        });
      }
    }

    function changeLocation(path){
      //if the users path does not end in a slash add it
      var lastChar = path.substr(path.length - 1);
      if(lastChar !== "/" && path !== null){
        path = path+"/";
      }
      //create the object to be added to settings.json
      var Userpath = {"config_location": path,"history_location": path};

      //write it to settings.json
      fs.writeFile(appDir + "settings.json", JSON.stringify(Userpath, null, 4), function (err) {
        if (err) return console.log(err);
        console.log(chalk.green.bold("Config and history location updated"));
      });

    }

    function IsJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

}).call(this);
