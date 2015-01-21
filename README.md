# Torrentflix

A cli tool for searching torrent sites and streaming using peerflix.

It currently supports kickasstorrents, Extratorrent, Limetorrents, nyaa.se & tokyotosho.

Want more ? Create an issue with a request, Alternatively you can contribute your own scrapers.

Pull requests are welcome.

## Key features

*  Subtitles fetched automatically.
*  Multi-file torrent support.
*  History of streamed torrents.

## Install
Install peerflix if you haven't already:

```
npm install -g peerflix
```
Then install torrentflix:
```
npm install -g torrentflix
```

## Preview
![peerflix](https://i.imgur.com/gZfV4o4.png)

## Usage
To run the app run:
```
$ torrentflix
```

Torrentflix comes with a set of default options,

To change these settings or apply a proxy pass the config command with your  editor of choice
```
$ torrentflix --config="vi"
```

## Subtitles
Torrentflix supports subtitles, By default subtitles are disabled you can enable them by running the config command above.
You can also change the subtitle language from the config.


## License

MIT
