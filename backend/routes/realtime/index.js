const express = require('express')
const router = express.Router();
const {
  io
} = require('../../lib/socket/socket');
const {
  processStream,
  initCameras,
  killAllProcesses,
  runProcess, 
  killProcessId,
  sendEngineState
} = require('./realtime');

router.get('/init', initCameras);
router.get('/kill', killAllProcesses);  //나중에 주석처리 해놓기
router.get('/engine', sendEngineState);

var stream_id = 1;
/**
 * Socket.IO 웹소켓
 * 클라이언트가 서버에 연결되었을 때:
 */
io.on('connection', (socket) => {
  console.log('socket connected$', socket);
  // 영상 및 데이터를 보낼 때
  socket.on('camstream', async (stream) => {
    console.log('camstream connected', stream);
    let processedStream = await processStream(stream);
    if (stream_id == stream.camera_id)
      socket.to("cam " + stream.camera_id).emit('stream_display', processedStream); //해당 id만 보내게 바꾸기
  });

  // 클라이언트가 방 들어오기 요청
  socket.on('join_room', (id) => {
    socket.join("cam " + id);
  });

  // 클라이언트가 방 나가기 요청
  socket.on('leave_room', (id) => {
    socket.leave("cam " + id);
  });

  // 클라이언트가 방 교체 요청
  socket.on('switch_room', (cur_id, next_id) => {
    socket.leave("cam " + cur_id);
    socket.join("cam " + next_id);
    stream_id = next_id;
    console.log(next_id);
    // runProcess(next_id);  //next_id에 대한 정보만 보내지게 설정!
    // checkVideoProcessesById(next_id);
  });

  // 클라이언트가 엔진 끄기 or 켜기 요청
  socket.on('turn_engine', (data) => {
    if(data.engine_status == 1)
      runProcess(data.camera_id);
    else
      killProcessId(data.camera_id);
  });

  // 클라이언트가 연결 종료
  socket.on('disconnect', () => {
    console.log('socket disconnected');
    socket.removeAllListeners();
  });
});

module.exports = router;