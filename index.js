// MQTT Alarm Accessory plugin for HomeBridge
//
// Remember to add accessory to config.json. Example:
// "accessories": [
//     {
//            "accessory": "mqttswitch",
//            "name": "PUT THE NAME OF YOUR SWITCH HERE",
//            "url": "PUT URL OF THE BROKER HERE",
//			  "username": "PUT USERNAME OF THE BROKER HERE",
//            "password": "PUT PASSWORD OF THE BROKER HERE"
// 			  "caption": "PUT THE LABEL OF YOUR SWITCH HERE",
// 			  "topics": {
// 				"statusCurrent": 	"PUT THE MQTT TOPIC FOR THE GETTING THE STATUS OF YOUR SWITCH HERE",
// 				"statusTarget": 	"PUT THE MQTT TOPIC FOR THE SETTING THE STATUS OF YOUR SWITCH HERE"
// 			  }
//     }
// ],
//
// When you attempt to add a device, it will ask for a "PIN code".
// The default code for all HomeBridge accessories is 031-45-154.

/*
// The value property of SecuritySystemCurrentState must be one of the following:
Characteristic.SecuritySystemCurrentState.STAY_ARM = 0;
Characteristic.SecuritySystemCurrentState.AWAY_ARM = 1;
Characteristic.SecuritySystemCurrentState.NIGHT_ARM = 2;
Characteristic.SecuritySystemCurrentState.DISARMED = 3;
Characteristic.SecuritySystemCurrentState.ALARM_TRIGGERED = 4;
// The value property of SecuritySystemTargetState must be one of the following:
Characteristic.SecuritySystemTargetState.STAY_ARM = 0;
Characteristic.SecuritySystemTargetState.AWAY_ARM = 1;
Characteristic.SecuritySystemTargetState.NIGHT_ARM = 2;
Characteristic.SecuritySystemTargetState.DISARM = 3;
*/

var Service, Characteristic;
var mqtt = require("mqtt");

function MqttAlarmAccessory(log, config) {
  	this.log          	= log;
  	this.name 			= config["name"];
  	this.url 			= config["url"];
	this.client_Id 		= 'mqttjs_' + Math.random().toString(16).substr(2, 8);
	this.options = {
	    keepalive: 10,
    	clientId: this.client_Id,
	    protocolId: 'MQTT',
    	protocolVersion: 4,
    	clean: true,
    	reconnectPeriod: 1000,
    	connectTimeout: 30 * 1000,
		will: {
			topic: 'WillMsg',
			payload: 'Connection Closed abnormally..!',
			qos: 0,
			retain: false
		},
	    username: config["username"],
	    password: config["password"],
    	rejectUnauthorized: false
	};
	this.caption		= config["caption"];
	this.topicStatusCurrent	= config["topics"].statusCurrent; // the target value sent to HomeKit
	this.topicStatusTarget	= config["topics"].statusTarget; // the actual value for door state

	this.CachedAlarmCurrentState = null; // Characteristic.CurrentDoorState.CLOSED; // 1 = closed
	this.CachedAlarmTargetState = null; //Characteristic.CurrentDoorState.CLOSED; // 1 = closed   
    
	this.service = new Service.SecuritySystem(this.name); // this is the service type from the HomeKitTypes.js file https://github.com/KhaosT/HAP-NodeJS/blob/master/lib/gen/HomeKitTypes.js
    
    this.service.getCharacteristic(Characteristic.SecuritySystemCurrentState).on('get', this.getAlarmCurrentState.bind(this));
    this.service.getCharacteristic(Characteristic.SecuritySystemTargetState).on('get',this.getAlarmTargetState.bind(this));
    
    this.service.getCharacteristic(Characteristic.SecuritySystemTargetState).on('set',this.setAlarmTargetState.bind(this));
	
	// connect to MQTT broker
	this.client = mqtt.connect(this.url, this.options);
	var that = this;
	this.client.on('error', function () {
		that.log('Error event on MQTT');
	});
	this.client.on('message', function (topic, message) {
        that.log( "Got MQTT! alarm" );
		if (topic == that.topicStatusCurrent) { // actual value changed
			var statusCurrent = parseInt(message);
			that.CachedGarageDoorState = statusCurrent;
            that.service.getCharacteristic(Characteristic.SecuritySystemCurrentState).setValue(statusCurrent, undefined, 'fromSetValue');
            }
        if (topic == that.topicStatusTarget) { // target value changed
			var statusTarget = parseInt(message);
            if (that.CachedGarageTargetDoorState != statusTarget) { // avoid loopback from own changes
			that.CachedGarageTargetDoorState = statusTarget;
            that.service.getCharacteristic(Characteristic.SecuritySystemTargetState).setValue(statusTarget, undefined, 'fromSetValue');
            }
		}
	});
    
    //the topics to subscribe to, this is set in the config file
    this.client.subscribe(this.topicStatusCurrent);
    this.client.subscribe(this.topicStatusTarget);
}

module.exports = function(homebridge) {
  	Service = homebridge.hap.Service;
  	Characteristic = homebridge.hap.Characteristic;  
  	homebridge.registerAccessory("homebridge-mqttalarm", "Mqttalarm", MqttAlarmAccessory);
};

MqttAlarmAccessory.prototype.getAlarmCurrentState = function(callback) {
    this.log("getAlarmCurrentState");
    callback(null, this.CachedAlarmCurrentState);
};

MqttAlarmAccessory.prototype.getAlarmTargetState = function(callback) {
    this.log("getAlarmTargetState");
    callback(null, this.CachedAlarmTargetState);
};

MqttAlarmAccessory.prototype.setAlarmTargetState = function(status, callback) {
    this.log("setDoorTargetPosition");
    this.CachedAlarmTargetState = status;
	this.client.publish(this.topicStatusTarget, String(status) ); // send MQTT packet for new state
	callback();
};


MqttAlarmAccessory.prototype.getServices = function() {
  return [MqttAlarmAccessory.service];
};
