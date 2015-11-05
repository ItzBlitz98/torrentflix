# Torrentflix

A cli tool for searching torrent sites and streaming using peerflix.

It currently supports kickasstorrents, 1337x, seedpeer, Rarbg, The Pirate Bay, YTS, Extratorrent, Limetorrents, nyaa.se, tokyotosho & Cpasbien.

Want more ? Create an issue with a request, Alternatively you can contribute your own scrapers.

Pull requests are welcome.

## Key features

*  Subtitles fetched automatically.
*  History of streamed torrents.
*  Stream or download torrents.

## Install (automatic)
Install peerflix if you haven't already:

```
npm install -g peerflix
```

Then install torrentflix:

```
npm install -g torrentflix
```

## Install (manual)
Install peerflix if you haven't already:

```
npm install -g peerflix
```

Clone the repository:

```
git clone git@github.com:ItzBlitz98/torrentflix.git
```

Install dependencies:

```
npm install
```

You can now update by doing a git pull:

```
git pull
```

Now you can run the executable inside the bin folder.

## Preview
A short video preview: http://webm.host/365df/vid.webm

![peerflix](https://i.imgur.com/rre0MtK.png)

## Usage
To run the app run:
```
$ torrentflix
```

## Cli arguments

Torrentflix has some handy cli arguements you can see them using the help flag.
```
$ torrentflix --help
```

## History
Torrentflix can save a history of watched torrents if enabled.

Clearing the history can be done with the --clear flag ex:
```
$ torrentflix --clear
```

## Subtitles
By default subtitles are disabled but you can enable them by running `torrentflix --config=nano` and setting *use_subtitle* to true. You can also change *subtitle_language* to one of [this list](https://github.com/divhide/node-subtitler/blob/master/langs.dump.txt), just be sure to use the three letter code.


## License

MIT
