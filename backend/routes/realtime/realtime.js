const models = require('../../models');
const config = require('../../config/config');
const Camera = require('../../class/Camera');
const {
  io
} = require('../../lib/socket/socket');
const HashMap = require('hashmap');
var request = require('request');

let camera_map = new HashMap();
// PreVentra 엔진에서 전달받은 데이터 처리
function processStream(stream) {
  return new Promise((resolve, reject) => {

    stream.total_people = stream.mask_weared + stream.mask_off + stream.mask_incorrect + stream.mask_unknown;

    if (stream.risk > 100)
      stream.risk = 100
    if (stream.congestion > 100)
      stream.congestion = 100

    // 카메라 데이터 누적
    if (camera_map.has(stream.camera_id))
      camera_map.get(stream.camera_id).countRealtimeData(stream);

    // incorrect와 mask off 추합
    //stream.mask_off = stream.mask_off + stream.mask_incorrect;

    // 이미지 데이터 base64 인코딩
    if(stream.frame_on)
      stream.img = stream.img.toString("base64");

    resolve(stream);
  });
}

// 카메라 클래스 생성 및 초기화
async function initCameras(req, res) {
  // 유저의 카메라 리스트 불러오기
  let start = new Date();
  console.log('user_id:', req.params)
  const list_of_cams = await models.camera.findAll({
    raw: true,
    where: {
      //user_id: req.user
      user_id: 1
    },
    order: [
      ['id', 'ASC']
    ],
    attributes: ['id', 'mode'],
    logging: false
  });

  // 각 카메라마다 카메라 리스트 생성
  for (let i = 0; i < list_of_cams.length; i++) {
    const cam = list_of_cams[i];
    let cam_obj;
    if (camera_map.has(cam.id))
      cam_obj = camera_map.get(cam.id);
    else
      cam_obj = createCameraById(cam.id);

    // 기본 카메라 프로세스 실행
    /*
    if (i == 0) {
      cam_obj.runProcess();  //이 정보만 보여지겠끔? 물론 켜져있지는 않겠지먼
    }
    */
  }
  let end = new Date();
  console.log("excution time: ", (end - start));
  res.end();
}

// 카메라 id로 카메라 클래스 생성
function createCameraById(cam_id) {
  let cam = new Camera(cam_id, io);
  camera_map.set(cam_id, cam);
  return cam;
}

// 카메라 스트리밍 프로세스 실행
function runProcess(cam_id) {
  // killAllProcesses();  //주석처리 나중에 하기!
  camera_map.get(cam_id).runProcess();
}


function killProcessId(cam_id) {
  camera_map.get(cam_id).killProcessId();
}


// 모든 카메라 프로세스 종료
async function killAllProcesses(res, req) {
  for (let camera of camera_map.values()) {
    await camera.killProcess();
  }
  
  var KILL_OPTIONS = {
    url:'http://192.168.0.11:8000/kill'
  }
  /*
  request.post(KILL_OPTIONS, function(err, res, result){
    console.log(result)
    if(err)
      console.log(err)
    else
      console.log("killed")
  });
  */
}

function sendEngineState(req, res){
  console.log("sendEngineState: ", req.query);
  var cam_id = req.query.camera_id;
  console.log(`cam_id : ${cam_id}`)
  //console.log('this is camera map', camera_map)
  //console.log(camera_map.get(cam_id))
  //let state = camera_map.get(cam_id).getEngineState();
  // console.log('골목길~~ ',camera_map.get(+cam_id))
  var state = camera_map.get(+cam_id).getEngineState(); 
  console.log(`state`,state)
  var result = {engine_state : `${state}`};
  res.send(result);
}

module.exports = {
  processStream,
  initCameras,
  killAllProcesses,
  //checkVideoProcessesById,
  runProcess, 
  killProcessId,
  sendEngineState
};