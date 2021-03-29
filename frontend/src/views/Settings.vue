<template>
<!-- this file manages setting page which contains adjusting congestion figure and alarm function -->
<div>
  <v-container id="container" fluid>
    <v-row
      no-gutters
    >
      <v-col>
        <v-card
          class="ma-0"
          max-width="300"
          tile
        >
          <v-list
            dense
            nav
            two-line
          >
            <v-subheader>PLACE</v-subheader>
            <v-list-item-group v-model="item" color="primary">
              <v-list-item
                v-for="(item, i) in place_list"
                :key="i"
              >
                <v-list-item-icon>
                  <v-icon v-text="item.icon"></v-icon>
                </v-list-item-icon>
                <v-list-item-content v-on:click="chg_place(item.value)" >
                  <v-list-item-title v-text="item.text"></v-list-item-title>
                  <v-list-item-subtitle v-text="item.subtext"></v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-col>
      <v-col>
        <v-card
        id="setting_content"
        class="pa-4"
        min-width="900"
        min-height="350">
          <h2>설정<span class="divider">|</span>{{ place || 'null' }}</h2>
          <br>
          <v-divider></v-divider>
          <br>
          <h3>장소 설정</h3>
          <br>
          <span>장소 이름</span><span class="divider">|</span>
          <input class= "input_place_name" v-model="place_name" type= "text" placeholder= "장소이름">
          <br>
          <br>
          <h3>거리두기 기준 <span class="divider">|</span>{{ sd_radius + 'm' || 'null' }}</h3>
          <v-radio-group v-model="sd_radius" :mandatory="false">
            <v-radio label="1m" value=1></v-radio>
            <v-radio label="2m" value=2></v-radio>
          </v-radio-group>
          <br>
          <h3>실내 공간 넓이<span class="divider">|</span>{{ space }}<span v-if="space">m<sup>2</sup></span></h3>
          <br>
          <span>사용자 정의 실내 공간</span><span class="divider">|</span>
          <input class= "input_space" v-model="space" type= "number" placeholder= "제곱미터">
          <br>
          <br>
          <h3>적정 인원<span class="divider">|</span>{{ proper_n_person }}<span v-if="proper_n_person">명</span>
          <span id = 'fivemin_above_description'> {{ scope_of_proper_n_person }}</span></h3>
          <br>
          <span>사용자 정의 적정 인원</span><span class="divider">|</span>
          <input class= "input_n_p" v-model="proper_n_person" type= "number" placeholder= "명">
          <br>
          <span :style="{ color: feedback_color}">{{ feedback }}</span>
          <br>
          <br>
          <h3>CCTV</h3>
          <br>
          <span>CCTV rtsp URL</span><span class="divider">|</span>
          <input class= "input_url" v-model="camera_rtsp" placeholder= "rtsp://example.com...">
          <br>
          <br>
          <h3>보안 모드</h3>
          <v-switch v-model="isblurring" class="mx-2" label="개인정보 보호"></v-switch> <!--label = 모자이크-->
          <h3>비디오 ON/OFF</h3>
          <v-switch v-model="isvideo" class="mx-2" label="비디오"></v-switch>

          <!-- <v-divider></v-divider> -->
          <v-divider></v-divider><br>
          <h3>알림 설정</h3>
          <v-switch v-model="isalarm" class="mx-2" label="경고 알림"></v-switch>
          <transition name="fade" appear>
            <span v-show="isalarm">
              <v-switch v-model="alarm_by_mask_off" class="mx-2" label="마스크 알림"></v-switch>
              <br>
              마스크 알림 기준
              <input class= "input_n_p" v-model="criteria_mask_off" type= "number" placeholder= "명">
              <br>
              <v-switch v-model="alarm_by_sd" class="mx-2" label="거리두기 알림"></v-switch>
              거리두기 알림 기준
              <input class= "input_n_p" v-model="criteria_sd" type= "number" placeholder= "명">
              <br>
              <v-switch v-model="alarm_by_cluster" class="mx-2" label="클러스터 알림"></v-switch>
              <br>
              <h3>알림 주기</h3>
              <v-radio-group v-model="alarm_cycle" >
                <v-radio label="1분" value=1></v-radio>
                <v-radio label="5분" value=5></v-radio>
                <v-radio label="3분" value=3></v-radio>
              <br>
              <!-- <h3>알림 기준<span class="divider">|</span>{{ milestone_display || '' }}</h3>
                <span id = 'fivemin_above_description'>5분 이상 지속될 경우 알람이 울려요</span>
              <v-radio-group v-model="milestone" :mandatory="true">
                <v-radio label="심각" value=3></v-radio>
                <v-radio label="경계" value=2></v-radio>
                <v-radio label="주의" value="1"></v-radio>
              </v-radio-group> -->
            </span>
          </transition>
          <v-btn
            class= "last_btn"
            color="primary"
            width="100%"
            dark
            v-on:click="save_settings"
            >SAVE
          </v-btn>
          <br>
          <v-btn
            width="100%"
            class= "last_btn"
            color="primary"
            dark
            v-on:click="go_back"
            >Go Back
          </v-btn>
          <br><br>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</div>
</template>
<script>
import axios from 'axios'

export default {

  data(){
    return{
      item: 0,
      // place_list: [
      // { text: 'Lounge', icon: 'mdi-sofa-outline', subtext: 'skku', value: "Lounge" },
      // { text: 'Cafe', icon: 'mdi-coffee', subtext: 'cafe nano', value: "Cafe" },
      // ],
      place_list: [
      { text: 'Lounge', icon: 'mdi-sofa-outline', subtext: 'skku', value: "Lounge" },
      { text: '카페', icon: 'mdi-coffee', subtext: 'cafe nano', value: "Cafe" },
      { text: '강의실', icon: 'mdi-book', subtext: 'open source', value: "lecture_01"}
      ],
      space: '',                    // 사용자 정의 실내 공간 INPUT
      proper_n_person: '',          // 적정인원 INPUT
      sd_radius: '',                // 거리두기 기준 INPUT
      isblurring: '',               // 보안모드 INPUT(boolean)
      place_name: '',               // 장소이름 INPUT

      isvideo: '',

      isalarm: '',
      alarm_by_mask_off: '',
      criteria_mask_off : '',

      alarm_by_sd: '',
      criteria_sd : '',

      alarm_by_cluster: '',
      alarm_cycle : '',

      milestone: '',
      places: { 
        'Lounge': 1,
        'Cafe': 2,
        'lecture_01': 3,
              },
      // places: { 'Lounge': 1,
      //           'Cafe': 2,
      //           'lecture_01': 3,
      //         },
      place: 'Lounge',
      feedback_color: 'black',
      camera_rtsp: '',
      
    }
  },
  methods:{
    save_settings(){
      if( this.space == '' || this.space <= 0 || this.proper_n_person == '' ||
          this.proper_n_person <= 0 //|| this.camera_rtsp.substring(0,6) != 'rtsp://'
          ){
        alert('잘못 입력하셨어요.')
      }
      else if(this.feedback_color =='red')
        alert('적정인원이 너무 많아요.')
      else{
        axios.post('http://115.145.212.100:53344/api/settings/camera', {distance_criteria: this.sd_radius, room_size: this.space, alarm_by_email: this.alarm,
                                                                        proper_n_people: this.proper_n_person,
                                                                        camera_id: this.places[this.place], access_path: this.camera_rtsp,
                                                                        blurring: this.isblurring, location: this.place_name,
                                                                        
                                                                        alarm_cycle: this.alarm_cycle, mask_off_criteria: this.criteria_mask_off,
                                                                        alarm_by_mask_off: this.alarm_by_mask_off, alarm_by_sd: this.alarm_by_sd,
                                                                        alarm_by_cluster: this.alarm_by_cluster, mask_off_criteria: this.criteria_mask_off,
                                                                        sd_criteria: this.criteria_sd//, isvideo: this.isvideo})
                                                                        })
        .then(res =>{
          console.log(res.data)
          console.log("장소: " + this.place, "장소 id:" + this.places[this.place],"거리두기 기준: "+ this.sd_radius,"넓이: "+this.space,"이메일: "+ this.isalarm,"적정 인원: "+ this.proper_n_person)
          console.log(`알림주기${this.alarm_cycle}`,`mask_off ${this.alarm_by_mask_off} ${this.criteria_mask_off}`, `sd ${this.alarm_by_sd} ${this.criteria_sd}`, `cluster ${this.alarm_by_cluster}`)
          alert('저장했습니다!');
        })
      }
    },
    go_back(){
      window.history.back();
    },
    chg_place(_place){
      this.place=_place;
      this.get_settings();
    },
    get_settings(){
      axios.get('http://115.145.212.100:53344/api/settings/camera/'+ this.places[this.place])
        .then(res => {
          this.place_name = res.data.location;
          this.sd_radius = res.data.distance_criteria;
          this.space = res.data.room_size;
          this.isalarm = res.data.alarm_by_email;
          this.proper_n_person = res.data.proper_n_people;
          this.camera_rtsp = res.data.access_path;
          this.isblurring = res.data.blurring;
          this.alarm_cycle = res.data.alarm_cycle;
          this.criteria_mask_off = res.data.mask_off_criteria;
          this.isvideo = res.data.isvideo;

          this.alarm_by_mask_off = res.data.alarm_by_mask_off;
          this.alarm_by_sd = res.data.alarm_by_sd;
          this.alarm_by_cluster = res.data.alarm_by_cluster;
          this.criteria_mask_off = res.data.mask_off_criteria;
          this.criteria_sd = res.data.sd_criteria;
          console.log('데이터를 받아옵니다.')
          console.log("장소 이름" + this.place_name, "거리두기 기준" + this.sd_radius, "공간" + this.space, "알람 여부" + this.isalarm, "정의 적정인원" + this.proper_n_person, "블러링" + this.isblurring,
                      "알림주기 : " + this.alarm_cycle, "노마스크 기준 : "+ this.criteria_mask_off, "거리두기 기준 : ",this.criteria_sd,"노마스크 알림on/off : ",this.alarm_by_mask_off
                      ,"거리두기 알림 on/off : ",this.alarm_by_sd, "클러스터 on/off : ",this.alarm_by_cluster)
        })
      console.log("장소!" + this.place, "장소 id :" + this.places[this.place] );
    }
  },
  created(){
    this.get_settings();
  },
  computed:{
    feedback: function(){
      var side = Math.sqrt(this.space);
      var p_prime = Math.round((side/this.sd_radius) * (side/this.sd_radius));
      if(this.proper_n_person > (0.8) * p_prime && this.proper_n_person < (1.2) * p_prime){
        this.feedback_color = 'green';
        return "적절해요";
      }
      else if(this.proper_n_person <= (0.8) * p_prime){
        this.feedback_color = 'orange';
        return "적절해요";
      }
      else if(this.proper_n_person >= (1.2) * p_prime){
        this.feedback_color = 'red';
        return "너무 많아요 :( " + Math.round((1.2) * p_prime) + "명을 넘을 수 없어요..";
      }
    },
    scope_of_proper_n_person: function(){
      var side = Math.sqrt(this.space);
      var p_prime = Math.round((side/this.sd_radius) * (side/this.sd_radius));
      var min = Math.round((0.8) * p_prime);
      var max = Math.round((1.2) * p_prime);
      return "적정인원 범위 : (" + min + " ~ " + max +")"
    }
  },

}
</script>
<style scoped>
/* .fade-enter-active,
.fade-leave-active {
  transition: opacity 1.5s ease;
} */
.slide-fade-enter-active {
  transition: all .3s ease;
}
.slide-fade-leave-active {
  transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
.input_place_name{
  outline: 2px solid #0055d5;
  width: 12%;
}
#container{
  margin:0px;
}
.input_space{
  /* justify-content: center; */
  outline: 2px solid #0055d5;
  width: 12%;
}
.input_n_p{
  outline: 2px solid #0055d5;
  width: 6%;
}
.input_url{
  outline: 2px solid #0055d5;
  width: 30%;
}
#setting_content{
  margin-left: 20px;
  margin-right: 480px;
}
.divider{
  color: lightgray;
  margin-left: 3px;
  margin-right: 7px;
}
#fivemin_above_description{
  font-size: 7px;
  color: lightgray;
  margin-left: 2px;
}
.last_btn{
  margin-bottom: 5px;
}
</style>