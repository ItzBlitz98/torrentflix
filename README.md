# Torrentflix

A cli tool for searching torrent sites and streaming using peerflix.

It currently supports kickasstorrents, 1337x, seedpeer, Rarbg, EZTV, The Pirate Bay, YTS, Extratorrent, Limetorrents, nyaa.se & tokyotosho.

Want more ? Create an issue with a request, Alternatively you can contribute your own scrapers.

Pull requests are welcome.

## Key features

*  Subtitles fetched automatically.
*  Multi-file torrent support.
*  History of streamed torrents.

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
![peerflix](https://i.imgur.com/rre0MtK.png)

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

Torrentflix allows you to change where its config and history files are located.

Why? When updating using the automatic method unfortunately your config and history files will be replaced. To change the location simply enter:
```
$ torrentflix --location="absolute_path"
```
You will still need to run this command after every update but it won't replace your settings / history. (If you can help add a nice crossplatform alternative pull-requests are welcome)


Don't forget you can always run the help flag to remind you of these

```
$ torrentflix --help
```

## History
Torrentflix can save a history of watched torrents if enabled.
Printing out the history can be done in two ways:

1. During the site selection prompt press h
2. Or run peerflix with the --history flag ex:

```
$ torrentflix --history
```

Clearing the history can be done with the --clear flag ex:
```
$ torrentflix --clear
```

Please ensure the history file is in a writable directory, You can change the history location with the config flag.
By default it saves the history in the torrentflix folder.


## Subtitles
Torrentflix supports subtitles, By default subtitles are disabled you can enable them by running the config command above.
You can also change the subtitle language from the config.


## License

MIT
