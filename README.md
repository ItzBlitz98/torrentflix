Kickassflix
==============

A cli for searching kickass.so and watching using peerflix
--------------

**Preview**

![preview](https://i.imgur.com/3PdB39U.gif)

**Install**

*   First ensure you have nodejs and peerflix installed
*   Download / clone the repo
*   run npm install to install dependencies

**How to use**

To run the app cd into the directory and run

```
node index.js -t "Archer 2009 S06E01" -c "tv"
```
-t being the title of the torrent you are searching for

-c being the catagory you are searching in (you don't have to do this but it is recommended)

**Alias example**

Using a bash / zsh alias makes it much easier to use

Here is an example alias you can use

```
pfxt(){ node ~/code/apps/kickassflix/index.js -t "$@" -c "tv" ;}
pfxm(){ node ~/code/apps/kickassflix/index.js -t "$@" -c "movies" ;}
```

Now you can run

```
pfxt archer s06e01
```

or
```
pfxm frozen
```

anywhere from the command line
