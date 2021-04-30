const {
  PythonShell
} = require('python-shell');
var axios = require('axios');
var crypto = require('crypto');
// const sms = require('../naver_alarm/sms.js');
let SMSData = require('../naver_alarm/SMSData.json');
const schedule = require('node-schedule');
const models = require('../models');
const moment = require('moment');
const config = require('../config/config');
const {
  Op, json
} = require('sequelize');
var request = require('request');
const {
  killProcessesOnInit
} = require('../lib/shell/utils');
const { path } = require('../config/config');


class Camera {
  constructor(camera_id, io) {
    this.camera_id = camera_id;
    console.log(this.camera_id + " Created");
    this._schd_realtime = schedule.scheduleJob('0 * * * * *', this.uploadRealtimeData.bind(this));
    this._schd_onof = schedule.scheduleJob('0 * * * * *', this.onoffProcess.bind(this));
    this._n_people = 0;
    this._risk = 0;
    this._congestion = 0;
    this._mask_off = 0;
    this._n_not_keep_dist = 0;
    this._cnt_stream = 0;
    this.room = 'cam ' + this.camera_id;
    this._camera_info;
    this._process = null;
    this.io = io;
    this._cycle_count = 0;
    this.engine_state = 0;
    //this._cluster_dict = {};
    this.url = 'https://sens.apigw.ntruss.com/sms/v2/services/ncp:sms:kr:263359313400:preventra_alram/messages';
  }

  async onoffProcess(){
    let nowDate = new Date();
    let minutes = nowDate.getMinutes();
    if(minutes.length == 1)
      minutes = "0" + minutes;
    let now = nowDate.getHours() + ":" + minutes;
    let camera_time = await models.camera.findByPk(this.camera_id, {
      attributes: ['genesis', 'apocalypse']
    });
    if(now == camera_time.genesis){
      if(this.engine_state == 0){
        this.runProcess();
        this.engine_state = 1;
      }
    }
    if(now == camera_time.apocalypse){
      if(this.engine_state == 1){
        this.killProcessId();
        this.engine_state = 0;
      }
    }
  }

  async sendSMS(SMSData, alert_code){
    let timestamp = new Date().getTime();
    var url = '/sms/v2/services/ncp:sms:kr:263359313400:preventra_alram/messages';
    var space = " ";				// one space
    var newLine = "\n";				// new line
    var method = "POST";				// method
    var accessKey = "nYq0zSe9PCZ8RzdLiPE2";			// access key id (from portal or Sub Account)
    var secretKey = "7jYX4EiSNdO0nECO8iRmbvsHNBupcB8dqECgg2lq";			// secret key (from portal or Sub Account)
    let hmac=crypto.createHmac('sha256',secretKey);
    let mes = [];    //배열을 만들어줍니다. 인증서는 그냥 했지만 이렇게 하면 보기 편합니다.
     //message 의 약자입니다. 경로설정할때와같이 의미있게 써줍시다.
     mes.push(method);
     mes.push(space);
     mes.push(url);
     mes.push(newLine);
     mes.push(timestamp);
     mes.push(newLine);
     mes.push(accessKey);
     const signature = hmac.update(mes.join('')).digest('base64');
    SMSData['content']=`risk: ${alert_code[0]}\ncongestion: ${alert_code[1]}\nno_mask: ${alert_code[2]}\nno_keep_dist: ${alert_code[3]}`;
    axios.post(this.url, SMSData,
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'x-ncp-apigw-timestamp':  String(timestamp),
          'x-ncp-iam-access-key': 'nYq0zSe9PCZ8RzdLiPE2',
          'x-ncp-apigw-signature-v2': signature.toString()
      }
      }).then(res => {
        console.log(res.data)
      })
  }

  async uploadRealtimeData() {
    let n_people = this._n_people;
    let risk = this._risk;
    let congestion = this._congestion;
    let mask_off = this._mask_off;
    let n_not_keep_dist = this._n_not_keep_dist;
    //let cluster_dict = this._cluster_dict;
    let cnt_stream = this._cnt_stream;

    this._n_people = 0;
    this._risk = 0;
    this._congestion = 0;
    this._mask_off = 0;
    this._n_not_keep_dist = 0;
    //this._cluster_dict = {};
    this._cnt_stream = 0;

    if (cnt_stream != 0) {
      n_people /= cnt_stream;
      risk /= cnt_stream;
      congestion /= cnt_stream;
      mask_off /= cnt_stream;
      n_not_keep_dist /= cnt_stream;
      // console.log(n_people + ' ' + risk + ' ' + congestion + ' ' + cnt_stream);

    //각 클러스터의 평균 인원 수 계산
    //클러스터 최소 지속시간 기준 필요함!
    //클러스터 지속시간을 알려면 프레임 수를 알 필요가 있음
    //클러스터 삭제 기준 필요
      let now = moment().subtract(1, 'minutes');

      await models.minutely_data.create({
        camera_id: this.camera_id,
        analyzed_time: now.format("YYYY-MM-DD HH:mm:00"),
        n_people: n_people,
        risk: risk,
        congestion: congestion,
        mask_off: mask_off,
        n_not_keep_dist: n_not_keep_dist
      }, {
        logging: false
      });
      /*
      await models.cluster_dict.create({
        camera_id: this.camera_id,
        analyzed_time: now.format("YYYY-MM-DD HH:mm:00"),
        n
      })
      */
    }
    let cycle_num = await models.camera.findByPk(this.camera_id, {
      attributes: ['alarm_cycle']
    });
    this._cycle_count+=1;
    if(this._cycle_count >= cycle_num.alarm_cycle){
      this._cycle_count=0;
      this.checkAlert(this);
    }
  }
  // 알람 조건을 충족하는 지 검사하는 함수
  async checkAlert() {
    let end_time = moment().subtract(1, 'minutes');
    let alert_crit = await models.camera.findByPk(this.camera_id, {
      attributes: ['alarm_by_email', 'alarm_by_mask_off', 'alarm_by_sd', 'alarm_by_cluster', 'alarm_cycle', 'mask_off_criteria', 'sd_criteria']
    });

    if (alert_crit.alarm_by_email) {
      let beg_time = moment(end_time).subtract(alert_crit.alarm_cycle-1, 'minutes');
      if(this.camera_id == 1)
        console.log("time: ", end_time);
      let data_last_x_minutes = await models.minutely_data.findAll({
        raw: true,
        where: {
          camera_id: this.camera_id,
          analyzed_time: {
            [Op.gte]: beg_time.format("YYYY-MM-DD HH:mm:00"),
            [Op.lte]: end_time.format("YYYY-MM-DD HH:mm:00")
          }
        },
        attributes: ['risk', 'congestion', 'mask_off', 'n_not_keep_dist', 'analyzed_time'],
        logging: false
      });

      let total_risk = 0;
      let total_congestion = 0;
      let total_mask_off = 0;
      let total_n_not_keep_dist = 0;
      let cnt_data = data_last_x_minutes.length;
      for (let i = 0; i < cnt_data; i++) {
        total_risk += data_last_x_minutes[i].risk;
        total_congestion += data_last_x_minutes[i].congestion;
        total_mask_off += data_last_x_minutes[i].mask_off;
        total_n_not_keep_dist += data_last_x_minutes[i].n_not_keep_dist;
        if(this.camera_id == 1)
          console.log("analyzed_time: ", data_last_x_minutes[i].analyzed_time);
      }
      if (cnt_data != 0) {
        total_risk /= cnt_data;
        total_congestion /= cnt_data;
        total_mask_off /= cnt_data;
        total_n_not_keep_dist /= cnt_data;
      }

      let alert_result = 0;
      let mask_result = 0;
      let sd_result = 0;
      if (total_mask_off >= alert_crit.mask_off_criteria)
        mask_result = 1; 
      if(total_n_not_keep_dist >= alert_crit.sd_criteria)
        sd_result = 1;
      alert_result = 10*mask_result + sd_result;

      
      let alert_code = new Array();
      alert_code[0] = total_risk.toFixed(2);
      alert_code[1] = total_congestion.toFixed(2);
      alert_code[2] = total_mask_off.toFixed(2);
      alert_code[3] = total_n_not_keep_dist.toFixed(2);
      alert_code[4] = alert_result;

      if (this.camera_id == 1){
        console.log('mask_off_criteria: ', alert_crit.mask_off_criteria)
        console.log('total_mask_off: ', total_mask_off)
        console.log('sd_criteria: ', alert_crit.sd_criteria)
        console.log('total_n_not_keep_dist: ', total_n_not_keep_dist)
        console.log('alert_result: ', alert_result)
        console.log('cnt_data: ', cnt_data)
        console.log('')
      }

      if (alert_result > 0) {
        await models.minutely_data.findOrCreate({
          where: {
            camera_id: this.camera_id,
            analyzed_time: beg_time.format("YYYY-MM-DD HH:mm:00")
          },
          defaults: {
            camera_id: this.camera_id,
            analyzed_time: beg_time.format("YYYY-MM-DD HH:mm:00"),
            risk: 0,
            congestion: 0,
            mask_off : 0,
            n_not_keep_dist : 0,
            n_people: 0
          },
          logging: false
        });
        await models.minutely_data.update({
          alert_checked: true
        }, {
          where: {
            camera_id: this.camera_id,
            analyzed_time: end_time.format("YYYY-MM-DD HH:mm:00")
          },
          logging: false
        });

        // DO ALERT!!
        this.alertRisk(alert_code);
      }
    }
  }

  countRealtimeData(stream) {
    this._n_people += stream.total_people;
    this._risk += stream.risk;
    this._congestion += stream.congestion;
    this._mask_off += stream.mask_off;
    this._n_not_keep_dist += stream.n_not_keep_dist;
    this._cnt_stream++;
  }

  alertRisk(alert_code) {
    /* Alert Data When Risk has ARISED */
    console.log(`${alert_code[4]} to ${this.room}`);
    //프론트에 경고 보냄
    // this.io.to(this.room).emit('alert', alert_code[4]); 

    //SMS 보냄(켜놓으면 계속 돈 나감)
    //this.sendSMS(SMSData, alert_code);
  }

  getEngineState() {
    return this.engine_state;
  }
  
  setEngineState(_var){
    this.engine_state = _var;
  }
  
  async runProcess() {
    if(this.engine_state == 1){
      console.log('try run when state is 1');
      return;
    }
    console.log("Run camera " + this.camera_id);
    //let option = Camera.createPythonOption(this.camera_id);
    //console.log(option);
    const camera_info = await models.camera.findByPk(this.camera_id, {
      raw: true,
      attributes: ['mode', 'access_path', 'room_size', 'distance_criteria', 'proper_n_people', 'blurring', 'isvideo']
    })

    let mode;
    if (camera_info.mode == 'live')
      mode = '-l';
    else if (camera_info.mode == 'video')
      mode = '-v';

    let option = {
      scriptPath: config.path.python,
      args: ["-a", camera_info.access_path, mode, "-S", camera_info.room_size, "-D", camera_info.distance_criteria, "-P", camera_info.proper_n_people] //, "-i", this.camera_id
    }
    if (camera_info.blurring) {
      option.args.push("-b");
    }
    if (camera_info.isvideo) {
      option.args.push("-f");
    }

    let sen = option['args'].join(' ');
    sen = sen + " --id=" + this.camera_id;
    console.log(sen);

    var OPTIONS = {
      //headers: {'Content-Type': 'application/json'},
      url: 'http://192.168.0.11:8000/post',
      body: {
        "option": sen
      },
      json:true
    };
    await this.killProcess();
    request.post(OPTIONS, function (err, res, result) {
      console.log(result)
      this._process = result["result"]
      if(err)
        console.log(err)
    });
    console.log('engine state before run: ', this.engine_state);
    this.engine_state = 1;
    console.log('engine state after run: ', this.engine_state);
    /*
    let mode;
    if (camera_info.mode == 'live')
      mode = '-l';
    else if (camera_info.mode == 'video')
      mode = '-v';

    let option = {
      scriptPath: config.path.python,
      args: ["-a", camera_info.access_path, mode, "-i", this.camera_id, "-S", camera_info.room_size, "-D", camera_info.distance_criteria, "-P", camera_info.proper_n_people]
    }
    if (camera_info.blurring) {
      option.args.push("-b");
    }

    await this.killProcess();
    this._process = PythonShell.run('PreVentra_main.py', option, () => {
      console.log("cam_id: " + this.camera_id + " End!");
    });
    */
    
  }
  
  
  async killProcessId() {
    if(this.engine_state == 0){
      console.log('try kill when state is 0');
      return
    }
    var OPTIONS = {
      //headers: {'Content-Type': 'application/json'},
      url: 'http://192.168.0.11:8000/kill_id',
      body: {
        "camera_id": this.camera_id
      },
      json:true
    };

    await this.killProcess();
    request.post(OPTIONS, function (err, res, result) {
      console.log(result)
      this._process = result["result"]
      if(err)
        console.log(err)
    });
    console.log('engine state before kill: ', this.engine_state);
    this.engine_state = 0;
    console.log('engine state after kill: ', this.engine_state);
  } 
  

  static async createPythonOption(camera_id) {
    const camera_info = await models.camera.findByPk(camera_id, {
      raw: true,
      where: {
        id: camera_id
      },
      attributes: ['mode', 'access_path', 'room_size', 'distance_criteria', 'proper_n_people', 'blurring', 'isvideo']
    })
    let mode;
    if (camera_info.mode == 'live')
      mode = '-l';
    else if (camera_info.mode == 'video')
      mode = '-v';


    let option = {
      scriptPath: config.path.python,
      args: ["-a", camera_info.access_path, mode, "-i", camera_info.id, "-S", camera_info.room_size, "-D", camera_info.distance_criteria, "-P", camera_info.proper_n_people]
    }
    if (camera_info.blurring) {
      option.args.push("-b");
    }
    if (camera_info.isvideo) {
      option.args.push("-f")
    }
    console.log(option);
    return option;
  }
  // 엔진 killed 되면, 해당 프로세스 backend 연결 끊음
  killProcess(signal = "SIGINT") {
    return new Promise((resolve, reject) => {
      if (this._process !== null) {
        this._process.kill(signal);
      }
      resolve();
    });
  }
}

module.exports = Camera;