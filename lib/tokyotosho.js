var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');
var moment = require('moment');

module.exports = {
  search: function(query, cat, page, tokyotosho_url) {
    //http://www.nyaa.se/?page=search&term=Absolute+Duo&sort=2
    var torrent_search = query;
    var search_query = torrent_search.split(' ').join('+');

    var search_url = tokyotosho_url + "/search.php?terms=" + search_query + "&type=0&size_min=&size_max=&username=";

    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];

    request(search_url, function(err, response, body){

      if(!err && response.statusCode === 200){

        $ = cheerio.load(body);

        if($('.listing').find('tr').length > "0"){
          $('.listing tr').each(function(index, torrents){

            if($(torrents).find('.desc-top a').next().attr('href')){
              find_torrent_link = $(torrents).find('.desc-top a');
              find_torrent_title = $(torrents).find('td.desc-top a');
              find_torrent_seed = $(torrents).next().find('td.stats');
              find_torrent_size = $(torrents).next().find('td.desc-bot').text();

              torrent_link = find_torrent_link.next().attr('href');
              torrent_title = find_torrent_title.text();
              torrent_seed = find_torrent_seed.find('span').first().text();
              torrent_leech = find_torrent_seed.find('span').first().next().text();

              var regExp = /\Size: ([^)]+) \Date:/;
              var matches = regExp.exec(find_torrent_size);
              var size = matches[0].split(' | Date:').join('').split('Size: ').join('');
              torrent_size = size;

              var regExp2 = /\Date: ([^)]+) \UTC/;
              var matches2 = regExp2.exec(find_torrent_size);
              var date_added = moment(Date.parse(matches2[1] + " UTC")).fromNow();

              data_content = {
                torrent_num: count,
                title: torrent_title,
                category: "",
                seeds: torrent_seed,
                leechs: torrent_leech,
                size: torrent_size,
                torrent_link: torrent_link,
                date_added: date_added
              };

              torrent_content.push(data_content);

              deferred.resolve(torrent_content);
              count++;

            }

          });
        } else {
          deferred.reject("No torrents found");
        }
      } else {
        deferred.reject("There was a problem loading Tokyotosho");
      }


    });

    return deferred.promise;

  }
};
