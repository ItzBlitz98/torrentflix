var kickass = require('kickass-search'),
  argv = require('minimist')(process.argv.slice(2)),
  colors = require('colors'),
  prompt = require('prompt'),
  spawn = require('child_process').spawn,
  category = argv.c,
  query = argv.t,
  data,
  count = 0,
  torrent_number = 0,
  data_content = {},
  torrent_content = [],
  /*
  Peerflix config starts here
  */
  peerflix_player = "--mpv",
  peerflix_player_arg = "--not-on-top",
  peerflix_port = "--port=8888",
  /*
  Peerflix config ends here
  */
  results = 0,
  p = 'Torrent to download (eg. 1 2 3..):'.red.bold;

if (typeof category === 'undefined') {
  var cat = false;
} else {
  var cat = true;
}


//search using cat
if (cat === true) {

  //search kick ass api
  kickass.search(category, query).then(function(body) {
    data = body;

    for (property in data) {
      if (data.hasOwnProperty(property)) {
        results++;
      }
    }

    //loop through returned data
    for (property in data) {
      if (data.hasOwnProperty(property)) {

        /* setting up our vars */
        var number = property;
        var title = data[property].title.text;
        var magnet = data[property].magnet.href;
        var seed = data[property].seed;
        var leech = data[property].leech;
        var size = data[property].size;

        /* sore the data in our object */
        data_content = {
          number: number,
          title: title,
          magnet: magnet,
          seed: seed,
          leech: leech,
          size: size
        };

        console.log(number.magenta.bold + ') '.magenta.bold + title.yellow.bold + ' ' + size.blue.bold + ' ' + seed.red.bold + ' ' + leech.green.bold);

        torrent_content.push(data_content);

        count++;

        if (count === results) {
          prompt.start();
          console.log(p);
          prompt.get(['torrent_num'], function(err, result) {
            downloadTorrent(result.torrent_num);
          });
        }

      }
    }

  });

  //just search
} else if (cat === false) {

  //search kick ass api
  kickass.search(query).then(function(body) {
    data = body;

    for (property in data) {
      if (data.hasOwnProperty(property)) {
        results++;
      }
    }

    //loop through returned data
    for (property in data) {
      if (data.hasOwnProperty(property)) {

        /* setting up our vars */
        var number = property;
        var title = data[property].title.text;
        var magnet = data[property].magnet.href;
        var seed = data[property].seed;
        var leech = data[property].leech;
        var size = data[property].size;

        /* sore the data in our object */
        data_content = {
          number: number,
          title: title,
          magnet: magnet,
          seed: seed,
          leech: leech,
          size: size
        };

        console.log(number.magenta.bold + ') '.magenta.bold + title.yellow.bold + ' ' + size.blue.bold + ' ' + seed.red.bold + ' ' + leech.green.bold);

        torrent_content.push(data_content);

        count++;

        if (count === results) {
          prompt.start();
          console.log(p);
          prompt.get(['torrent_num'], function(err, result) {
            downloadTorrent(result.torrent_num);
          });
        }

      }
    }

  });

}

function downloadTorrent(torrent_num) {
  var title = torrent_content[torrent_num].title.green.bold;
  var magnet_url = torrent_content[torrent_num].magnet;
  console.log("Streaming ".green.bold + title);
  spawn('peerflix', [magnet_url, peerflix_player, peerflix_player_arg, peerflix_port], {
    stdio: 'inherit'
  });
}
