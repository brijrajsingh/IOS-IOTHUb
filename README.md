# MAzure

* Generating SAS token for sending Device to Cloud Messages

```sh
http://<host>/sas
```
* Sending device to cloud messages

```sh
var payload = "your payload goes here ";

var options = {

  hostname: '<hubname>.azure-devices.net',

  path: '/devices/device-01/messages/events?api-version=2016-02-03',

  method: 'POST',

  headers: {

    'Authorization': <generated sas token>,

    'Content-Length': payload.length,

    'Content-Type': 'application/atom+xml;type=entry;charset=utf-8'

  }

};
```

* Generating SAS token for creating a device Identity

```sh
http://<host>/sas?op=registerdevice
```

* Creating device identity on IOT Hub

```sh
payload =  '{\"deviceId\":\"<deviceIdentity>\"}';

//for creating the device identity
var options = {
  hostname: '<hubName>.azure-devices.net',
  path: '/devices/<deviceIdentity>?api-version=2016-02-03',
  method: 'PUT',
  headers: {
    'Authorization': <generated sas token>,
    'Content-Length': payload.length,
    'Content-Type': 'application/json'
  }
};

```
