# FabMo-Tool-Minder-Cordova

The FabMo Tool Minder Cordova is a Cross-Platform mobile application for finding FabMo capable tool on your local network and connect to them.

##Features
- Display the available machines on your network.
- Give you the state, the job that is running if it's apply & the best Ip address to connect to your machine.
- quick access button to your machine using your default browser.

##Installation instructions

###Android
Simply get the latest apk from the [release page](https://github.com/FabMo/FabMo-Tool-Minder-Cordova/releases/latest) and install it. You're all set up !

###IOS
There is no release for IOS right now, because I don't have access to a Mac computer.

##Technical specification / Credits
This application relies on [cordova](https://cordova.apache.org/) wich is a framework for building cross-platform mobile applications. The application is written in HTML/CSS/Javascrip.
The design is made with the [purecss framework](http://purecss.io).  
The network detection tool relies on UDP broadcast (using [cordova-plugin-chrome-apps-sockets-udp](https://github.com/MobileChromeApps/cordova-plugin-chrome-apps-sockets-udp)), so you might check that your network allow this kind of request as it may be blocked by your router.
