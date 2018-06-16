var inquirer = require('inquirer');
var Trakt = require('trakt.tv');
var Configstore = require('configstore');
var promise = require('promise');
var chalk = require('chalk');
var conf = new Configstore("trakt_config");
var tnp = require('torrent-name-parser');
var main = require("./main");

//TRAKT API CONFIG
//INSERT YOUR TRAKT API KEY HERE :
let options = {
    client_id: 'CLIENTID',
    client_secret: 'CLIENTSECRET',
    //debug: true,
};
const trakt = new Trakt(options);

module.exports = {
    init: function () {
        var TraktConfig = promise.resolve(conf.all);
        TraktConfig.then((token) => {
            if (isEmpty(token)) {
                return trakt.get_codes().then(poll => {
                    console.log(chalk.green("**Trakt Activation**"));
                    console.log(chalk.green("Please visit: ") + chalk.magenta(poll.verification_url));
                    console.log(chalk.green("Enter the code: ") + chalk.magenta(poll.user_code));
                    return trakt.poll_access(poll);
                }).catch(chalk.red(console.error));
            }
            return trakt.import_token(token);
        }).then(newTokens => {
            return conf.set(newTokens);
        }).then(() => {
            return trakt.users.settings();
        }).then(profile => {
            if (profile.user.username) {
                inquirer.prompt([{
                    type: "list",
                    name: "Ttmenu",
                    message: chalk.green("Welcome " + profile.user.username + "\n" + "  Trakt Menu"),
                    choices: ["Up next", "Revoke Access", "<<Exit>>"]
                }]).then(answer => {
                    switch (answer.Ttmenu) {
                        case 'Up next':
                            //get all watched shows
                            trakt.users.watched({
                                username: profile.user.username,
                                type: 'shows',
                                extended: 'noseasons'
                            }).then(watchedshows => {
                                //get progress for all watched shows
                                return Promise.all(watchedshows.map(element => {
                                    return trakt.shows.progress.watched({
                                        id: element.show.ids.trakt,
                                        hidden: 'false',
                                        specials: 'false'
                                    }).then(episodeProgress => {
                                        //if theres a next episode and last watched date is less than a year (discard unwatch shows)
                                        if (episodeProgress.next_episode && (new Date() - new Date(episodeProgress.last_watched_at)) / 31536000000 < 1) {
                                            return element.show.title + ' s' + zeroprefix(episodeProgress.next_episode.season) + 'e' + zeroprefix(episodeProgress.next_episode.number);
                                        }
                                    }).catch(chalk.red(console.log));;
                                }));
                            }).then(progress => {
                                return progress.filter(Boolean);
                            }).then(nextEpisode => {
                                inquirer.prompt([{
                                    type: "list",
                                    name: "UpNext",
                                    message: chalk.green("Wich episode do you want to watch next?"),
                                    choices: nextEpisode
                                }]).then(answer => {
                                    main.AppInitialize({search: answer.UpNext});
                                }).catch(chalk.red(console.log));;
                            }).catch(chalk.red(console.log));;
                        break;
                    }
                }).catch(chalk.red(console.log));
            }
        }).catch(chalk.red(console.log));
    },

    markaswatched: function(torrent_title){
        //If a title and Trakt is enabled
        if (tnp(torrent_title).title && !isEmpty(conf.all)) {
            //Import Trakt Token
            trakt.import_token(conf.all);
            //Get Trakt ID for the show / movie
            if (tnp(torrent_title).season){
                trakt.search.text({
                    query: tnp(torrent_title).title,
                    type: 'show,title'
                }).then(Ttid => {
                    //Try to poll the episode
                    if (!isEmpty(Ttid)) {
                        trakt.episodes.summary({
                            id: Ttid[0].show.title,
                            season: zeroprefix(tnp(torrent_title).season),
                            episode: zeroprefix(tnp(torrent_title).episode)
                        }).then(Ttresult => {
                            //If episode is found, mark as watched
                            if (!isEmpty(Ttresult)) {
                                inquirer.prompt([{
                                    type: "confirm",
                                    name: "markaswatch",
                                    message: chalk.green("Mark: " + Ttid[0].show.title + ' s' + zeroprefix(Ttresult.season) + 'e' + zeroprefix(Ttresult.number)) + chalk.magenta(' as watched?'),
                                    default: true
                                }]).then(answer => {
                                    if (answer.markaswatch) {
                                        trakt.sync.history.add({episodes: [{'ids': {'trakt': Ttresult.ids.trakt}}]})
                                        console.log(chalk.green(Ttid[0].show.title + ' s' + zeroprefix(Ttresult.season) + 'e' + zeroprefix(Ttresult.number)) + chalk.magenta('  Marked as Watched'));
                                    }
                                }).catch(chalk.red(console.log));;
                            }
                        }).catch(chalk.red(console.log));
                    }
                }).catch(chalk.red(console.log));
            } else {
                //Its a movie
                trakt.search.text({
                    query: tnp(torrent_title).title + ' ' + tnp(torrent_title).year,
                    type: 'movie,title'
                }).then(Ttid => {
                    if (!isEmpty(Ttid)) {
                        //Take the highest score found and mark as watched
                        inquirer.prompt([{
                            type: "confirm",
                            name: "markaswatch",
                            message: chalk.green('Mark: ' + Ttid[0].movie.title + ' ' + Ttid[0].movie.year) + chalk.magenta('  as watched ?'),
                            default: true
                        }]).then(answer => {
                            if (answer.markaswatch) {
                                trakt.sync.history.add({movies: [{'ids': {'trakt': Ttid[0].movie.ids.trakt}}]})
                                console.log(chalk.green(Ttid[0].movie.title + ' ' + Ttid[0].movie.year) + chalk.magenta('  Marked as Watched'));
                            }
                        }).catch(chalk.red(console.log));;
                    }
                }).catch(chalk.red(console.log));
            }
        }
    }
}

function zeroprefix(num) {
    if (num < 10) {
        return '0' + num
    } else {
        return num
    }
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}