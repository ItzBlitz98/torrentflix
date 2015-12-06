var Q = require('q');
var request = require("request");
var cheerio = require('cheerio');
var moment = require('moment');
var util = require('util');
var fs = require('fs');

module.exports = {
  search: function(query, eztv_url) {

    var torrent_search = query;
    var search_query = torrent_search.split(' ').join('-');
    var search_url = eztv_url + "/search/" + search_query;
    var count = 1;
    var deferred = Q.defer();
    var data_content = {};
    var torrent_content = [];

    request({ url: search_url, headers:{ "User-Agent": "request"}}, function(err, response, body){

//	fs.writeFileSync("/home/serge/torrentsearch/out2.html", body);
//	fs.readFile("/home/serge/torrentsearch/out.html", function(err, body){
//		var response = { statusCode: 200 };
      try {
 
        if(!err && response.statusCode === 200){
  
          var eztv_link, torrent_title, torrent_size, torrent_seeds, torrent_leech, date_added;
          $ = cheerio.load(body);
          if($("tr.forum_header_border").length > 0) {
  
            $("tr.forum_header_border").each(function(index, torrent){
              eztv_link = $(torrent).find("a.magnet").attr('href');
              torrent_title = $(torrent).find("a.epinfo").text();
              torrent_size = $(torrent).find("a.epinfo").attr("title").match(/\([^)]+\)$/)[0].slice(1,-1);
              //torrent_seeds = $(torrent).find(".seed").text();
              //torrent_leech = $(torrent).find(".leech").text();
              date_added = $("td.forum_thread_post_end", torrent).prev().text();
  
              data_content = {
                torrent_num: count,
                title: torrent_title,
                category: "",
                seeds: torrent_seeds,
                leechs: torrent_leech,
                size: torrent_size,
                torrent_link: eztv_link,
                date_added: date_added
              };
  
              torrent_content.push(data_content);
  
              deferred.resolve(torrent_content);
              count++;
            });
  
          } else {
            deferred.reject("No torrents found");
          }
  
        } else {
          deferred.reject("There was a problem loading Eztv");
        }

     } catch(e) {
        deferred.reject(e.toString());
     } 

    });

    return deferred.promise;

  }
};
