var en_torrent_site = "Select what torrent site you want to search:";
var en_torrent_site_num = "Torrent site to use (eg. k l..):";
var en_search_torrent = "Torrent search:";
var en_select_torrent = "Torrent to stream (eg. 1 2 3..):";

var data_content = {};
var lang_content = [];


module.exports = {
  getEn: function() {
    data_content = {
      torrent_site: en_torrent_site,
      torrent_site_num: en_torrent_site_num,
      search_torrent: en_search_torrent,
      select_torrent: en_select_torrent,
    };

    lang_content.push(data_content);

    return lang_content;
  }
};
