var inquirer = require("inquirer");
const Trakt = require("trakt.tv");
var Configstore = require("configstore");
var promise = require("promise");
var chalk = require("chalk");
var conf = new Configstore("trakt_config");
var tnp = require("torrent-name-parser");
const readline = require("readline")
const displayImage = require("display-image")
const mdb = require('moviedb')('8ab94034d5d6e93ba87c74637ebbd021');
var main = require("./main");

const blank = "\n".repeat(process.stdout.rows)

//TRAKT API CONFIG
let options = {
    client_id: "506de02e7b06dc15b1a8576e94a13340bb9994046f9ba6612453fe2779d43212",
    client_secret: "d42f93e3ed7670ad286e10c5b5d767ae19ddc144770801afe9f7ffeac96739b0",
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
                    choices: ["Up next", "Movies", "Shows", "Revoke Access", "[ Exit ]"]
                }]).then(answer => {
                    switch (answer.Ttmenu) {
                        case "Up next":
                            upNext(profile.user.username);
                            break;
                        case "Movies":
                            inquirer.prompt([{
                                type: "list",
                                name: "TraktMovies",
                                message: chalk.green("Movies on Trakt"),
                                choices: ["Trending", "Popular", "[ Exit ]"]
                            }]).then(answer => {
                                switch (answer.TraktMovies) {
                                    case "Trending":
                                        trendingMovies();
                                        break;
                                    case "Popular":
                                        popularMovies();
                                        break;
                                }
                            }).catch(chalk.red(console.log));
                            break; 
                        case "Shows":
                                inquirer.prompt([{
                                    type: "list",
                                    name: "TraktShows",
                                    message: chalk.green("Shows on Trakt"),
                                    choices: ["Trending", "Popular", "[ Exit ]"]
                                }]).then(answer => {
                                    switch (answer.TraktShows) {
                                        case "Trending":
                                            trendingShows();
                                            break;
                                        case "Popular":
                                            popularShows();
                                            break;
                                    }
                                }).catch(chalk.red(console.log));
                                break; 
                        case "Revoke Access":
                                trakt.revoke_token();
                                conf.clear();
                                console.log(chalk.green("Trakt access revoked"));
                                break;
                        default:
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
                    type: "show,title"
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
                                    message: chalk.green("Mark: " + Ttid[0].show.title + " s" + zeroprefix(Ttresult.season) + "e" + zeroprefix(Ttresult.number)) + chalk.magenta(" as watched?"),
                                    default: true
                                }]).then(answer => {
                                    if (answer.markaswatch) {
                                        trakt.sync.history.add({episodes: [{"ids": {"trakt": Ttresult.ids.trakt}}]});
                                        console.log(chalk.green(Ttid[0].show.title + " s" + zeroprefix(Ttresult.season) + "e" + zeroprefix(Ttresult.number)) + chalk.magenta("  Marked as Watched"));
                                    }
                                }).catch(chalk.red(console.log));
                            }
                        }).catch(chalk.red(console.log));
                    }
                }).catch(chalk.red(console.log));
            } else {
                //Its a movie
                trakt.search.text({
                    query: tnp(torrent_title).title + " " + tnp(torrent_title).year,
                    type: "movie,title"
                }).then(Ttid => {
                    if (!isEmpty(Ttid)) {
                        //Take the highest score found and mark as watched
                        inquirer.prompt([{
                            type: "confirm",
                            name: "markaswatch",
                            message: chalk.green("Mark: " + Ttid[0].movie.title + " " + Ttid[0].movie.year) + chalk.magenta("  as watched ?"),
                            default: true
                        }]).then(answer => {
                            if (answer.markaswatch) {
                                trakt.sync.history.add({movies: [{"ids": {"trakt": Ttid[0].movie.ids.trakt}}]});
                                console.log(chalk.green(Ttid[0].movie.title + " " + Ttid[0].movie.year) + chalk.magenta("  Marked as Watched"));
                            }
                        }).catch(chalk.red(console.log));
                    }
                }).catch(chalk.red(console.log));
            }
        }
    }
};

function trendingShows() {
    var rst = promise.resolve(clearterm());
    rst.then(() => {
        trakt.shows.trending({}).then(trendingShows => {
            return Promise.all(trendingShows.map(element => {
                return element.show.title + " " + element.show.year + " " + element.show.ids.trakt;
            })).then(trendingShowsList => {
                inquirer.prompt([{
                    type: "list",
                    name: "TraktTrendingShows",
                    message: chalk.green("Trending Shows on Trakt"),
                    pageSize: 15,
                    choices: function(){
                        var choiceArray = [];
                        for (var i = 0; i < trendingShowsList.length; i++) {
                            choiceArray.push(trendingShowsList[i].substring(0, trendingShowsList[i].lastIndexOf(" ")));
                        }
                        choiceArray.push("[ Exit ]");
                        return choiceArray;
                    }
                }]).then(answer => {
                    if (answer.TraktTrendingShows == "[ Exit ]") return;
                    for (var i = 0; i < trendingShowsList.length; i++) {
                        if(trendingShowsList[i].includes(answer.TraktTrendingShows)) {
                            var showId = trendingShowsList[i].substring(trendingShowsList[i].lastIndexOf(" "), trendingShowsList[i].length);
                            getShownfo(showId.trim(),"ts");
                        };
                    }
                }).catch(chalk.red(console.log));
            })
        }).catch(chalk.red(console.log));
    })
}

function popularShows() {
    var rst = promise.resolve(clearterm());
    rst.then(() => {
        trakt.shows.popular({}).then(popularShows => {
            return Promise.all(popularShows.map(element => {
                return element.title + " " + element.year + " " + element.ids.trakt;
            })).then(popularShowsList => {
                inquirer.prompt([{
                    type: "list",
                    name: "TraktPopularShows",
                    message: chalk.green("Popular Shows on Trakt"),
                    pageSize: 15,
                    choices: function(){
                        var choiceArray = [];
                        for (var i = 0; i < popularShowsList.length; i++) {
                            choiceArray.push(popularShowsList[i].substring(0, popularShowsList[i].lastIndexOf(" ")));
                        }
                        choiceArray.push("[ Exit ]");
                        return choiceArray;
                    }
                }]).then(answer => {
                    if (answer.TraktPopularShows == "[ Exit ]") return;
                    for (var i = 0; i < popularShowsList.length; i++) {
                        if(popularShowsList[i].includes(answer.TraktPopularShows)) {
                            var showId = popularShowsList[i].substring(popularShowsList[i].lastIndexOf(" "), popularShowsList[i].length);
                            getShownfo(showId.trim(),"ps");
                        };
                    }
                }).catch(chalk.red(console.log));
            })
        }).catch(chalk.red(console.log));
    })
}

function trendingMovies() {
    var rst = promise.resolve(clearterm());
    rst.then(() => {
        trakt.movies.trending({}).then(trendingMovies => {
            return Promise.all(trendingMovies.map(element => {
                return element.movie.title + " " + element.movie.year + " " + element.movie.ids.trakt;
            })).then(trendingMoviesList => {
                inquirer.prompt([{
                    type: "list",
                    name: "TraktTrendingMovies",
                    message: chalk.green("Trending Movies on Trakt"),
                    pageSize: 15,
                    choices: function(){
                        var choiceArray = [];
                        for (var i = 0; i < trendingMoviesList.length; i++) {
                            choiceArray.push(trendingMoviesList[i].substring(0, trendingMoviesList[i].lastIndexOf(" ")));
                        }
                        choiceArray.push("[ Exit ]");
                        return choiceArray;
                    }
                }]).then(answer => {
                    if (answer.TraktTrendingMovies == "[ Exit ]") return;
                    for (var i = 0; i < trendingMoviesList.length; i++) {
                        if(trendingMoviesList[i].includes(answer.TraktTrendingMovies)) {
                            var showId = trendingMoviesList[i].substring(trendingMoviesList[i].lastIndexOf(" "), trendingMoviesList[i].length);
                            getMovienfo(showId.trim(),"tm");
                        };
                    }
                }).catch(chalk.red(console.log));
            })
        }).catch(chalk.red(console.log));
    })
}

function popularMovies() {
    var rst = promise.resolve(clearterm());
        rst.then(() => {
        trakt.movies.popular({}).then(popularMovies => {
            return Promise.all(popularMovies.map(element => {
                return element.title + " " + element.year + " " + element.ids.trakt;
            })).then(popularMoviesList => {
                inquirer.prompt([{
                    type: "list",
                    name: "TraktPopularMovies",
                    message: chalk.green("Popular Movies on Trakt"),
                    pageSize: 15,
                    choices: function(){
                        var choiceArray = [];
                        for (var i = 0; i < popularMoviesList.length; i++) {
                            choiceArray.push(popularMoviesList[i].substring(0, popularMoviesList[i].lastIndexOf(" ")));
                        }
                        choiceArray.push("[ Exit ]");
                        return choiceArray;
                    }
                }]).then(answer => {
                    if (answer.TraktPopularMovies == "[ Exit ]") return;
                    for (var i = 0; i < popularMoviesList.length; i++) {
                        if(popularMoviesList[i].includes(answer.TraktPopularMovies)) {
                            var showId = popularMoviesList[i].substring(popularMoviesList[i].lastIndexOf(" "), popularMoviesList[i].length);
                            getMovienfo(showId.trim(),"pm");
                        };
                    }
                }).catch(chalk.red(console.log));
            })
        }).catch(chalk.red(console.log));
    })
}

function upNext(userProfile) {
    //get all watched shows
    trakt.users.watched({
        username: userProfile,
        type: 'shows',
        extended: 'noseasons'
    }).then(watchedshows => {
        //get progress for all watched shows
        return Promise.all(watchedshows.map(element => {
            return trakt.shows.progress.watched({
                id: element.show.ids.trakt,
                hidden: 'false',
                specials: 'false',
                extended: 'full'
            }).then(episodeProgress => {
                //verify if there's a next eps and if it's aired
                if (episodeProgress.next_episode && new Date(episodeProgress.next_episode.first_aired) <= new Date()){
                    return element.show.title + ' s' + zeroprefix(episodeProgress.next_episode.season) + 'e' + zeroprefix(episodeProgress.next_episode.number);
                }
            }).catch(chalk.red(console.log));
        }));
    }).then(progress => {
        return progress.filter(Boolean);
    }).then(nextEpisode => {
        nextEpisode.push("[ Exit ]");
        inquirer.prompt([{
            type: "list",
            name: "UpNext",
            message: chalk.green("Which episode do you want to watch next?"),
            pageSize: 15,
            choices: nextEpisode
        }]).then(answer => {
            if (answer.UpNext == "[ Exit ]") return;
            main.AppInitialize({search: answer.UpNext});
        }).catch(chalk.red(console.log));
    }).catch(chalk.red(console.log));
}

function getShownfo(showId,callback) {
    var rst = promise.resolve(clearterm());
    rst.then(() => {
        trakt.shows.summary({
            id: showId,
            extended: "full"
        }).then(answer => {
            var selectedShow = answer.title + " " + answer.year + " s01e01"
            mdb.tvImages({ id: answer.ids.tmdb }, (err, res) => {
                displayImage.fromURL("https://image.tmdb.org/t/p/w154" + res.posters[0].file_path).then(image => {
                    console.log(image + "\n\n" + chalk.bgCyan("Overview") + "\n" + answer.overview + "\n\n");
                    inquirer.prompt([{
                        type: "input",
                        name: "confirm",
                        message: chalk.green("(w)atch, (b)ack or (e)xit :"),
                    }]).then(answer => {
                        switch(answer.confirm) {
                            case "w":
                                main.AppInitialize({search: selectedShow});
                            break;
                            case "b":
                                if (callback == "ts") {
                                    trendingShows();
                                } else {
                                    popularShows();
                                }
                            break;
                            default:
                            return;
                        }
                    })
                })
            });
        });
    })
}

function getMovienfo(movieId,callback) {
    var rst = promise.resolve(clearterm());
    rst.then(() => {
        trakt.movies.summary({
            id: movieId,
            extended: "full"
        }).then(answer => {
            var selectedMovie = answer.title + " " + answer.year
            mdb.movieImages({ id: answer.ids.tmdb }, (err, res) => {
                displayImage.fromURL("https://image.tmdb.org/t/p/w154" + res.posters[0].file_path).then(image => {
                    console.log(image + "\n\n" + chalk.bgCyan("Overview") + "\n" + answer.overview + "\n\n");
                    inquirer.prompt([{
                        type: "input",
                        name: "confirm",
                        message: chalk.green("(w)atch, (b)ack or (e)xit :"),
                    }]).then(answer => {
                        switch(answer.confirm) {
                            case "w":
                                main.AppInitialize({search: selectedMovie});
                            break;
                            case "b":
                                if (callback == "tm") {
                                    trendingMovies();
                                } else {
                                    popularMovies();
                                }
                            break;
                            default:
                            return;
                        }
                    })
                })
            });
        });
    })
}

function zeroprefix(num) {
    if (num < 10) {
        return "0" + num;
    } else {
        return num;
    }
}

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function clearterm() {
    console.log(blank)
            readline.cursorTo(process.stdout, 0, 0)
            readline.clearScreenDown(process.stdout)
  }
