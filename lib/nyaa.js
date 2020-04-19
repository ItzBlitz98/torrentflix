var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');

module.exports = {
  search: function(query, nyaa_url, cat, page, limit) {
    //http://www.nyaa.se/?page=search&term=Absolute+Duo&sort=2
    var torrent_search = query;
    var search_query = torrent_search.split(' ').join('+');

    var search_url = nyaa_url + "/?page=search&term=" + search_query + "&sort=2";

    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];

    request(search_url, function(err, response, body){

      if(!err && response.statusCode === 200){

        $ = cheerio.load(body);

          $('table.torrent-list tr').slice(1).each(function () {

            const _getChild = (ctx, nb) => {
              return $(ctx).find(`td:nth-child(${nb})`)
            }

            var title = _getChild(this, 2).find('a:not(.comments)').text().trim();
            var seeds = _getChild(this, 6).text();
            var leechs = _getChild(this, 7).text();
            var size = _getChild(this, 4).text();
            var torrent_link = nyaa_url + _getChild(this, 3).find('a:nth-child(1)').attr('href');
            var date_added = _getChild(this, 5).text();
            
            data_content = {
              torrent_num: count,
              title: title,
              category: "",
              seeds: seeds,
              leechs: leechs,
              size: size,
              torrent_link: torrent_link,
              date_added: date_added
            };

            torrent_content.push(data_content);

            deferred.resolve(torrent_content);
            // like break
            if (++count > limit) { return false; }
          })

      } else {
        deferred.reject("There was a problem loading Nyaa");
      }


    });

    return deferred.promise;

  }
};
