#!/bin/bash

npm install --force
npm install electron --global --force

cd .\internal\ui\
npm install --force
npm run build
