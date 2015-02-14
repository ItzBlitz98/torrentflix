var en_torrent_site = "Select what torrent site you want to search: ";
var en_torrent_site_num = "Torrent site to use (eg. k, l, e..) ";
var en_search_torrent = "Search for a torrent: ";
var en_select_torrent = "Torrent to stream (eg. 1, 2, 3..) or (b)ack or (e)xit: ";
var en_select_file = "Select file in torrent to stream (eg. 1, 2, 3..) or (b)ack or (e)xit: ";
var en_site_error = "You didn't select a correct site, Try again!";

var data_content = {};
var lang_content = [];


module.exports = {
  getEn: function() {
    data_content = {
      torrent_site: en_torrent_site,
      torrent_site_num: en_torrent_site_num,
      search_torrent: en_search_torrent,
      select_torrent: en_select_torrent,
      select_file: en_select_file,
      site_error: en_site_error
    };

    lang_content.push(data_content);

    return lang_content;
  }
};
