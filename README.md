Kickassflix
==============

A cli for searching torrent sites and watching using peerflix.

currently supports kickass, limetorrents and extratorrent.

Want more ? create an issue with a request or contibute your own scrapers. Pull requests are welcome.

********************************************************************************

**Preview**

![preview](https://i.imgur.com/GNheslZ.gif)
********************************************************************************
**Install**

*   First ensure you have nodejs and peerflix installed
*   cd into the directory you want to install the script into

```
$ git clone https://github.com/ItzBlitz98/kickassflix.git

$ cd kickassflix

$ npm install

```


**How to use**

To run the app cd into the directory and run

```
node index.js

```

**How do i change the settings ?**

To change the app's settings open up config.js.

Here you can change peerflix player or use a proxy for kickass.


**Alias example**

Using a bash / zsh alias is recommended and makes it easier to use.

Here is an example alias you can use (dont forget to change the directory to where your script is located):

```
pfx(){ node ~/code/apps/kickassflix/index.js }

```

Now you can run

```
pfx
```

anywhere from the command line

**Updating**

To update the app and dependencies (scrapers might need to updated if they break)

Simply cd into the directory you cloned and run

```
$ git pull origin master && npm update
```

This will keep your config settings, So don't panic.
