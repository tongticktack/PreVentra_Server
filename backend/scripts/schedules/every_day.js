const models = require('../../models');
const {
  Op
} = require('sequelize');

function ttod(time) {
  //console.log(time.substr(0, 10) + "00:00:00")
  var res = new Date(time.substr(0, 10) + " 00:00:00");
  console.log("res: ", res)
  return res;
}

async function createDailyDataFromHoulryData() {
  let max_date = await models.daily_data.max('analyzed_time')
  console.log("MAX DATE:", max_date)
  //현재 daily_data에 튜플이 없는 경우
  if(max_date == 0){
    var D = new Date('2020-10-20')
    max_date = D
  }
  const hourly_data = await models.hourly_data.findAll({
    raw: true,
    attributes: ['camera_id', 'analyzed_time', 'avg_people', 'max_people', 'avg_congestion', 'max_congestion', 'avg_risk', 'max_risk', 'avg_n_not_keep_dist', 'max_n_not_keep_dist' ,'alert_count', 'data_count'],
    order: [
      ['camera_id', 'ASC'],
      ['analyzed_time', 'ASC']
    ],
    where: {
      analyzed_time: {
        [Op.gt]: max_date
      }
    }
  });
  for (let i = 0; i < hourly_data.length; i++){
    console.log("analyze time: ", hourly_data[i].analyzed_time)
  }
  let cam_id = hourly_data[0].camera_id,
    cur_date = ttod(hourly_data[0].analyzed_time),
    avg_people = 0,
    max_people = 0,
    count = 0,
    avg_risk = 0,
    max_risk = 0,
    avg_congestion = 0,
    max_congestion = 0,
    avg_n_not_keep_dist = 0,
    max_n_not_keep_dist = 0,
    cnt_alert = 0;

  for (let i = 0; i < hourly_data.length; i++) {
    if (cam_id !== hourly_data[i].camera_id || cur_date < ttod(hourly_data[i].analyzed_time)) {
      // Save compressed data into hourly_data table
      if (count == 0) {
        avg_risk = 0;
        max_risk = 0;
        avg_congestion = 0;
        max_congestion = 0;
        avg_n_not_keep_dist = 0;
        max_n_not_keep_dist = 0;
        avg_people = 0;
        cnt_alert = 0;
      } else {
        avg_risk /= count;
        avg_congestion /= count;
        avg_people /= count;
        avg_n_not_keep_dist /= count;
      }


      await models.daily_data.findOrCreate({
        where: {
          camera_id: cam_id,
          analyzed_time: cur_date,
        },
        defaults: {
          avg_risk: avg_risk,
          max_risk: max_risk,
          avg_congestion: avg_congestion,
          max_congestion: max_congestion,
          avg_people: avg_people,
          max_people: max_people,
          avg_n_not_keep_dist: avg_n_not_keep_dist,
          max_n_not_keep_dist: max_n_not_keep_dist,
          alert_count: cnt_alert,
          data_count: count
        }
      });

      cam_id = hourly_data[i].camera_id;
      cur_date = ttod(hourly_data[i].analyzed_time)
      avg_risk = 0;
      max_risk = 0;
      avg_congestion = 0;
      max_congestion = 0;
      avg_people = 0;
      max_people = 0;
      avg_n_not_keep_dist = 0;
      max_n_not_keep_dist = 0;
      cnt_alert = 0;
      count = 0;
    }

    avg_risk += hourly_data[i].data_count * hourly_data[i].avg_risk;
    if (max_risk < hourly_data[i].max_risk) {
      max_risk = hourly_data[i].max_risk;
    }

    avg_congestion += hourly_data[i].data_count * hourly_data[i].avg_congestion;
    if (max_congestion < hourly_data[i].max_congestion) {
      max_congestion = hourly_data[i].max_congestion;
    }

    avg_people += hourly_data[i].data_count * hourly_data[i].avg_people;
    if (max_people < hourly_data[i].max_people) {
      max_people = hourly_data[i].max_people;
    }

    avg_n_not_keep_dist += hourly_data[i].data_count * hourly_data[i].avg_n_not_keep_dist;
    if (max_n_not_keep_dist < hourly_data[i].max_n_not_keep_dist) {
      max_n_not_keep_dist = hourly_data[i].max_n_not_keep_dist;
    }

    cnt_alert += hourly_data[i].alert_count
    count += hourly_data[i].data_count;
  }

  if (count == 0) {
    avg_risk = 0;
    max_risk = 0;
    avg_congestion = 0;
    max_congestion = 0;
    avg_people = 0;
    cnt_alert = 0;
    avg_n_not_keep_dist = 0;
    max_n_not_keep_dist = 0;
  } else {
    avg_risk /= count;
    avg_congestion /= count;
    avg_people /= count;
    avg_n_not_keep_dist /= count;
  }

  await models.daily_data.findOrCreate({
    where: {
      camera_id: cam_id,
      analyzed_time: cur_date,
    },
    defaults: {
      avg_risk: avg_risk,
      max_risk: max_risk,
      avg_congestion: avg_congestion,
      max_congestion: max_congestion,
      avg_people: avg_people,
      max_people: max_people,
      avg_n_not_keep_dist: avg_n_not_keep_dist,
      max_n_not_keep_dist: max_n_not_keep_dist,
      alert_count: cnt_alert,
      data_count: count
    }
  });

  /* delete all hourly data
  await models.hourly_data.delete({
      truncate: true
  });
  */
}

createDailyDataFromHoulryData();