const models = require('../../models');
const config = require('../../config/config');

// 카메라 ID로 세팅 불러오기
async function getCameraSettings(req, res) {

  const current_settings = await models.camera.findOne({
    raw: true,
    attributes: [
      ['id', 'camera_id'], 'room_size', 'mode', 'distance_criteria', 'proper_n_people', 'alarm_by_email', 'access_path', 'blurring', 'location'
    ,'alarm_cycle', 'mask_off_criteria', 'alarm_by_mask_off', 'alarm_by_sd', 'sd_criteria', 'alarm_by_cluster', 'isvideo', 'engine_status', 'genesis', 'apocalypse'],
    where: {
      id: req.params.id
    }
  });

  if (current_settings.mode == "video") {
    current_settings.access_path = (current_settings.access_path).replace("/home/seungho/darknet/2020-sw-skku-GIT/video-gumin/", "");
  }

  res.send(current_settings);
}

// 카메라 세팅 저장
async function saveCameraSettings(req, res) {

  let new_settings = req.body;
  /*
  switch (+new_settings.alarm_criteria) {
    case 1:
      new_settings.alarm_criteria = 40;
      break;
    case 2:
      new_settings.alarm_criteria = 60;
      break;
    case 3:
      new_settings.alarm_criteria = 80;
      break;
  }
  */

  const current_settings = await models.camera.findByPk(new_settings.camera_id, {
    attributes: ['mode']
  });
  if (current_settings.mode == "video") {
    new_settings.access_path = config.path.video + new_settings.access_path;
  }

  models.camera.update({
    room_size: new_settings.room_size,
    distance_criteria: new_settings.distance_criteria,
    proper_n_people: new_settings.proper_n_people,
    alarm_by_email: new_settings.alarm_by_email,
    //alarm_criteria: new_settings.alarm_criteria,
    alarm_by_mask_off: new_settings.alarm_by_mask_off,
    alarm_by_sd: new_settings.alarm_by_sd,
    alarm_by_cluster: new_settings.alarm_by_cluster,
    access_path: new_settings.access_path,
    blurring: new_settings.blurring,
    location: new_settings.location,
    alarm_cycle: new_settings.alarm_cycle,
    mask_off_criteria: new_settings.mask_off_criteria,
    sd_criteria: new_settings.sd_criteria,
    isvideo: new_settings.isvideo,
    engine_status: new_settings.engine_status,
    genesis: new_settings.genesis,
    apocalypse: new_settings.apocalypse
  }, {
    where: {
      id: new_settings.camera_id
    }
  });

  res.end();
}

module.exports = {
  getCameraSettings,
  saveCameraSettings
}