# FabMo-Tool-Minder-Cordova

The FabMo Tool Minder Cordova is a Cross-Platform mobile application for finding FabMo capable tool on your local network and connect to them.

##Features
- Display the available machines on your network.
- Give you the state, the job that is running if it's apply & the best Ip address to connect to your machine.
- quick access button to your machine using your default browser.

##Installation instructions

###Android
Simply get the app from the [Play Store](https://play.google.com/store/apps/details?id=com.fabmo.toolminder) and install it. You're all set up !

###IOS
The IOS releqse is in beta testing. It's coming !

##Technical specification / Credits
This application relies on [cordova](https://cordova.apache.org/) wich is a framework for building cross-platform mobile applications. The application is written in HTML/CSS/Javascrip.
The design is made with the [purecss framework](http://purecss.io).  
The network detection tool relies on UDP broadcast (using [cordova-plugin-chrome-apps-sockets-udp](https://github.com/MobileChromeApps/cordova-plugin-chrome-apps-sockets-udp)), so you might check that your network allow this kind of request as it may be blocked by your router.
