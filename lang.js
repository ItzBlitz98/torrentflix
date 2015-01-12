var en_search_torrent = "What are you searching for ?";
var en_select_torrent = "Torrent to download (eg. 1 2 3..):";

var data_content = {};
var lang_content = [];


module.exports = {
  getEn: function() {
    data_content = {
      search_torrent: en_search_torrent,
      select_torrent: en_select_torrent,
    };

    lang_content.push(data_content);

    return lang_content;
  }
};
