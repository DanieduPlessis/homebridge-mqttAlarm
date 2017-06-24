# homebridge-mqttalarm

Homebridge plugin for Alarm connected via MQTT, this is not working 100%, still developing

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-mqttalarm
3. Update your configuration file. See sample-config.json in this repository for a sample. 

# Configuration

Configuration sample:

 ```
 "accessories": [
//     {
//            "accessory": "mqttalarm",
//            "name": "ALARM NAME",
//            "url": "BROKER URL",
//			  "username": "PUT USERNAME OF THE BROKER HERE",
//            "password": "PUT PASSWORD OF THE BROKER HERE"
// 			  "caption": "LABEL FOR ALARM",
// 			  "topics": {
// 				"statusCurrent": 	"PUT THE MQTT TOPIC FOR THE GETTING THE STATUS OF YOUR SWITCH HERE",
// 				"buttonPress": 	"PUT THE MQTT TOPIC FOR THE SETTING THE STATUS OF YOUR SWITCH HERE"
// 			  }
//     }
// ]

```