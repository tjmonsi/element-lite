# On Installing dependencies on C9

## Installing Chrome
```
sudo apt-get install libxss1 libappindicator1 libindicator7
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome*.deb
sudo apt-get install -f
sudo dpkg -i google-chrome*.deb
```

## Installing XVFB
```
sudo apt-get update
sudo apt-get install xvfb
```

## Installing Java 8
```
sudo add-apt-repository ppa:webupd8team/java
sudo apt update; sudo apt install oracle-java8-installer
```

## Running test with watch
```
npm run wct-c9
```