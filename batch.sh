#!/bin/sh

cat ./links.txt | xargs -P 4 -I % sh -c './dezoomify-rs/dezoomify-rs -l %'
mv *.jpg ./images

# use this to create a symbolic link
# cd to "wallpaper folder"
# ln -s ./xxx/*.jpg .
