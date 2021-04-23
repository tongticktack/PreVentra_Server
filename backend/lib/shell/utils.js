const shell = require('shelljs');
const config = require('../../config/config');
var request = require('request');

function killProcessesOnInit() {
  console.log('kill processes on init');
  
  var KILL_OPTIONS = {
    url:'http://192.168.0.11:8000/kill'
  }
  
  request.post(KILL_OPTIONS, function(err, res, result){
    console.log(result)
    if(err)
      console.log(err)
    else
      console.log("killed")
  });

  //shell.exec(config.path.shell + 'kill_preventra.sh')
};

function killProcessesCameraId(camera_id) {
  console.log('kill camera id processes on init');
  
  var KILL_OPTIONS = {
    url:'http://192.168.0.11:8000/kill_id',
    body: {
      "camera_id": camera_id
    },
    json:true
  }
  
  request.post(KILL_OPTIONS, function(err, res, result){
    console.log(result)
    if(err)
      console.log(err)
    else
      console.log("killed")
  });
};

module.exports = {
  killProcessesOnInit,
  killProcessesCameraId
}