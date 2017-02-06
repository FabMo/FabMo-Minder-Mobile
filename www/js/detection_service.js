//message that will be broadcast on the network
var REQ = "R U A SBT ?\0";

//The reply that should send any FabMo Machine
var OK = "YES I M !\0";

//Error message if you're message was not understandable by the FabMo machine
var ERR = "I DNT UNDRSTND !\0";

// Second message asking for the machine informations.
var HOSTNAME = "U NAME ?\0";

var socket;
var broadcastAddress = '255.255.255.255';
var broadcastPort = 24862; // = 7777 without conversion



function detection_service(callback){

	var detect = new detection(1100,function(data){
		/*****************************************************************/
		if( data === []) // false in every case
		{
			// NOT TRIGGERED FOR NOW ! Should be replace by (data.length === 0)
			callback('no device found');
		}
		else
		{
			try{
				var devices_list = data;
			}
			catch (e) {
				var devices_list= [];
			}

			var count_array = []; // used for getting a unique device list.

			// make a list of unique devices ( currently based on the hostname and need to be replace with a serial number )
			for(var dev in devices_list)
			{
				if(devices_list[dev])
					count_array.push(devices_list[dev].device.hostname);
			}
			count_array = uniq(count_array);


			var new_device_array = []; // new JSON object, represent the devices that you can connect to.

			// new JSON object constructor
			for (var single_dev in count_array)
			{
				var dev_interfaces = []; // reset the interfaces array for every new device
				var dev_hostname = count_array[single_dev]; // get the hostname
				var server_port;
				// get the interface array
				for(var device in devices_list) // array with all the ips and net interfaces separately
				{
					if( devices_list[device] && devices_list[device].device.hostname === count_array[single_dev] ) //select the ones corresponding to the current device
					{
						for(var network in devices_list[device].device.networks) // list the interfaces
						{
							if (  devices_list[device].device.networks[network].ip_address === devices_list[device].active_ip ) //select active interfaces.
							{
								dev_interfaces.push({'interface' :  devices_list[device].device.networks[network].interface, 'ip_address' :  devices_list[device].device.networks[network].ip_address}); // add theses to the network section
							}
						}
						server_port = devices_list[device].device.server_port ;
					}
				}
				// add the device to the new_device_array
				new_device_array.push({ "hostname" : dev_hostname, "network" : dev_interfaces, "server_port" : server_port});
			}
		}
		/*********************************************************************/
		callback(null,new_device_array);
	});


}


var detection = function(t,callback) {

	chrome.sockets.udp.create(function(createInfo){
		var current_dialog =[];
		var device;
		var devices =[];

		var timeout = t || 1100;

		chrome.sockets.udp.bind( createInfo.socketId, "0.0.0.0", "0",function(err){
			if(err)console.log(err);
			else{
				//chrome.sockets.udp.setBroadcast(createInfo.socketId,true,function(){});
				chrome.sockets.udp.onReceive.addListener(listener = function ( info ) {
					data=info.data;
					rinfo = {};
					rinfo.address = info.remoteAddress;
					if(ab2str(data) == OK){
						chrome.sockets.udp.send(createInfo.socketId, str2ab(HOSTNAME), rinfo.address,broadcastPort, function (info) {
							//console.log(info);
						});
						current_dialog.push(rinfo.address); // add ip in an array

					} else if(current_dialog.indexOf(rinfo.address)!==-1){ // if the device is a sbt, continue the dialog.
						current_dialog.splice(current_dialog.indexOf(rinfo.address), 1); //end of dialog (remove ip from array )
						//console.log(ab2str(data).replace('\0', '').replace(/é/gi,'e').replace(/ /gi,'_')+ ',"active_ip" : "' +rinfo.address+'"}');
						//substract \0 character of the string before parsing.
						try{
							device = JSON.parse('{"device" : ' + ab2str(data).replace('\0', '') + ',"active_ip" : "'+ rinfo.address+'"}');
						}catch(ex){console.log(ex);}
						devices.push(device);

					}else{
						console.log("[detection_service.js] received from "+rinfo.address+" : unknow message : '"+ ab2str(data) +"'");
					}
				});

				chrome.sockets.udp.send(createInfo.socketId,str2ab(REQ),broadcastAddress,broadcastPort, function (info) {
					//console.log(info);
				});
				//chrome.sockets.udp.send(createInfo.socketId,str2ab(REQ),"192.168.42.1", broadcastPort,  function (info) {
					//console.log(info);
				//});
				var zeroconf = cordova.plugins.zeroconf;
				zeroconf.watch('_fabmo._tcp.','local.', function(result) {
				    var action = result.action;
				    var service = result.service;
				    if (action == 'added') {
								try{
									dev_obj = JSON.parse(service.txtRecord.fabmo);
									device = JSON.parse('{"device" : ' + service.txtRecord.fabmo + ',"active_ip" : "'+ dev_obj.networks[0].ip_address+'"}');
									devices.push(device);
								}catch(ex){/*console.log(ex);*/}

				    } else {
				        console.log('service removed', service);
				    }
				});

				setTimeout(function(){
					chrome.sockets.udp.onReceive.removeListener(listener);
					chrome.sockets.udp.close(createInfo.socketId,function(err){});
					callback(devices);
					return 0; //close the function
				}, timeout);
			}
		});
	});
};

function ChooseBestWayToConnect(tool,callback){
	// Returns an IP address and port
	// Automatic selection of the best way to talk to the tool
	// Based on this priority : USB > ethernet > wifi > wifi-direct
	if (!callback)
		throw "this function need a callback to work !";
	list_itr = [];
	for(var idx in tool.network){
		list_itr.push(tool.network[idx].interface);
	}

	var hasEmbeddedItr=false;
	var EmbededdeItrRegEx='en*';
  for (var i in list_itr) {
    if (list_itr[i].match(EmbededdeItrRegEx)) {
        hasEmbeddedItr=true;
    }
  }

  if(hasEmbeddedItr){
  	tool.network.forEach(function(val,key){
			if(val.interface.match(EmbededdeItrRegEx))
			{
				callback(val.ip_address,tool.server_port);
				return;
			}
		});
  }

	if(list_itr.indexOf("usb0") > -1)
	{
		tool.network.forEach(function(val,key){
			if(val.interface === "usb0")
			{
				callback(val.ip_address,tool.server_port);
				return;
			}
		});
	}
	if(list_itr.indexOf("eth0") > -1)
	{
		tool.network.forEach(function(val,key){
			if(val.interface === "eth0")
			{
				callback(val.ip_address,tool.server_port);
				return;
			}
		});
	}
	if(list_itr.indexOf("en0") > -1)
	{
		tool.network.forEach(function(val,key){
			if(val.interface === "en0")
			{
				callback(val.ip_address,tool.server_port);
				return;
			}
		});
	}
	if(list_itr.indexOf("wlan0") > -1)
	{
		tool.network.forEach(function(val,key){
			if(val.interface === "wlan0")
			{
				callback(val.ip_address,tool.server_port);
				return;
			}
		});
	}
	if(list_itr.indexOf("wlan1") > -1)
	{
		tool.network.forEach(function(val,key){
			if(val.interface === "wlan1")
			{
				callback(val.ip_address,tool.server_port);
				return;
			}
		});
	}
}


function DetectToolsOnTheNetworks(callback){
	detection_service(function(err,tools){
		callback(err,tools);
	});
}

var uniq = function(arr){
	var obj = {};
	var arr2 = [];
	for (var i = 0; i < arr.length; i++) {
	    if (!(arr[i] in obj)) {
	        arr2.push(arr[i]);
	        obj[arr[i]] = true;
	    }
	}
	return arr2;
};

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}
function str2ab(str) {
  var buf = new ArrayBuffer(str.length); // 2 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}
