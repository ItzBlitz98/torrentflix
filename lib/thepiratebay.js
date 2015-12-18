var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');

module.exports = {
  search: function(query, thepiratebay_url, cat, page, limit) {

    var torrent_search = query;
    var search_query = torrent_search.split(' ').join('%20');

    var search_url = thepiratebay_url + "/search/" + search_query + "/0/7/0";
    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];
    var link_content = [];

    request(search_url, function(err, response, body){

      if(!err && response.statusCode === 200){

        $ = cheerio.load(body);

        $('table#searchResult tr').each(function(index, torrents){
          var torrent_title, torrent_link, torrent_verified;

          if($(torrents).find('.detName a').text()){
            find_torrent_title = $(torrents).find('.detName a');
            find_torrent_seed = $(torrents).find('td').next().next().text();
            find_torrent_leech = $(torrents).find('td').next().next().next().text();
            find_torrent_size = $(torrents).find('.detDesc');

            torrent_title = find_torrent_title.text();
            torrent_leech = find_torrent_leech;
            torrent_seed = find_torrent_seed.split(torrent_leech).join('');

            var matches = find_torrent_size.text().match(/, Size (.*?), ULed/g);
            torrent_size = matches[0].split(', Size ').join('').split(', ULed').join('');
            var matches2 = find_torrent_size.text().match(/Uploaded (.*?),/g);
            date_added = matches2[0].split('Uploaded ').join('').split(',').join('');

            links = $(torrents).find('a');

            $(links).each(function(i, link){

              if($(link).attr('href').indexOf("magnet:?xt=urn:") > -1) {
                torrent_link = $(link).attr('href');
                // var torrent_magnet = $(link).attr('href');
                // var matches = torrent_magnet.match(/magnet:\?xt=urn:btih:(.*)&dn=/g);
                // var hash = matches[0].split('magnet:?xt=urn:btih:').join('').split('&dn=').join('');
                // torrent_link = "http://torcache.net/torrent/" + hash + ".torrent";
              }

            });

            images = $(torrents).find('a img');

            $(images).each(function(i, images){

              if($(images).attr('title')){
                if($(images).attr('title').indexOf("VIP") > -1) {
                  torrent_verified = "vip";
                }else if($(images).attr('title').indexOf("Trusted") > -1) {
                  torrent_verified = "trusted";
                }
              } else {
                torrent_verified = "";
              }
            });

            data_content = {
              torrent_num: count,
              title: torrent_title,
              category: "",
              seeds: torrent_seed,
              leechs: torrent_leech,
              size: torrent_size,
              torrent_verified: torrent_verified,
              torrent_link: torrent_link,
              date_added: date_added
            };

            torrent_content.push(data_content);
            deferred.resolve(torrent_content);
            // like break
            if (++count > limit) { return false; }

          }

        });


      } else {
        deferred.reject("There was a problem loading The Pirate Bay");
      }


    });

    return deferred.promise;

  }
};
