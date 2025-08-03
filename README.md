<p
    <img alt="OS" src="https://img.shields.io/badge/OS-Windows%20/%20Linux-success">
</p>

# Automation bot

NodeJS program for view botting, watch time botting, comment botting, and like botting
You can use it as a application, or by using its API, with control over every part of the program


# Requirements

 * NodeJS 16.17.1 (other versions not tested)
 * Connection speed of at 2 megabits/minute per worker
 * Google chrome 107.0.5304.107 or later (NO OTHER BROWSER SUPPORTED OTHER THAN CHROME)
 * A good proxy is needed if you want many views
 * Decent computer

# Features
 * GUI to controll the program
 * Bypasess bot detection
 * Bypasses cookies, consent, and other useless pages
 * Can customise every part of it, including extensions
 * Multithreaded and small CPU usage (Up to 200 workers at the same time and even more on good hardware)
 * Multiple ways to watch video, higher SEO
 * Uses as little bandwith as possible (Less 1 megabits per minute per worker and 5 megabits to load youtube in)
 * Can customise watchtime, can like video and comment if logged in
 * http, https, socks4, socks5 & authentification support for proxy
 * Can use rotating proxies or no proxy at all
 * Livestream, normal video and shorts support

# Develop

## Install requirements

Window
```shell
.\install_modules.bat 
```

Linux
```shell
./install_modules_unix.sh
```

## Run dev

```shell
npm run start
```

## Run by os

Window

```shell
.\start_windows.bat
```

Linux

```shell
./start_unix.sh
```

## Remove all chrome.exe

window
```shell
.\stop_all_chrome_windows.bat
```
