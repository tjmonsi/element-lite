#!/bin/bash

if [ -d ./node_modules/lit-html ]; then
  echo 'copying lit-html'
  cp -r ./node_modules/lit-html ./lib/lit-html
fi