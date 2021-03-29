<template>
  <v-container id="container" fluid>
    <v-row
    justify=center
    >
      <img class= "milestone_img" src="../assets/UI_01/milestone.png">
    </v-row>
    <v-spacer></v-spacer>
    <v-row
      class="mx-4"
      no-gutters
      justify=center
    >
      <v-col cols="2.1">
        <v-card
        class="pa-4 card"
        outlined
        v-bind:style="{ 'font-size': fontsize,'background-color': bgcolor, 'font-weight': 'bold'}"
        >
            위험도<span class="divider">  |  </span>
            <span :style="{ color: RiskColor }" class= "risk"><span class="text_val" :style="{}">{{ risk_value }}</span> <!--({{ figures.risk }})--></span>
        </v-card>
      </v-col>
      <v-col cols="2.1">
        <v-card
        class="pa-4 card"
        outlined
        v-bind:style="{ 'font-size' : fontsize, 'background-color': bgcolor, 'font-weight': 'bold'}"
        >
            혼잡도<span class="divider">  |  </span>
            <span :style="{ color: CongestionColor }" class= "congestion"><span class="text_val">{{ congestion_value }}</span> <!--({{ figures.congestion }}) --></span>
        </v-card>
      </v-col>
    </v-row>
    <br>
    <v-row
    class="mx-4"
    justify="center">
      <v-card
      class="pa-2"
      outlined
      v-bind:style="{ 'background-color': bgcolor }"
      width ="100%"
      >
      
      <v-row
      align=center>
        <!-- <v-col
          class="pa-0"> -->
          <img class="people_img" src="../assets/UI_01/img_n_person.png">
        <!-- <v-col> -->
          <span class= "person" :style="{ 'font-size': fontsize}">인원 수</span><span class="divider"> | </span>
        <!-- </v-col> -->
        <!-- <v-col> -->
          <span :style="{ 'font-size': n_fontsize}">{{ figures.n_person }}</span>
          <span class="constant" :style="{ 'font-size': fontsize }">/ {{ proper_n }}</span>
        <!-- </v-col> -->
      </v-row>
      </v-card>
    </v-row>
    <br>
    <v-row
    class="mx-4"
    no-gutters
    align=center
    justify=end
    >
      <v-col>
        <v-card
        class="pa-0"
        outlined
        :style="{ 'font-size':fontsize }"
        >
        <v-row
        align=center>
          <v-col>
            <img class= "mask_img" src="../assets/UI_01/img_n_mask_off.png">
          </v-col>
          <v-col>
            <span :style="{color:'red'}" class="mask_img">{{ figures.n_mask_off }} <span :style="{ visibility: unitvi, color:'black'}">명</span></span>
          </v-col>
        </v-row>
        </v-card>
      </v-col>
      <v-col>
        <v-card
        class="pa-0"
        outlined
        :style="{ 'font-size':fontsize }"
        >
        <v-row
        align=center>
          <v-col>
            <img class= "mask_img" src="../assets/UI_01/img_n_mask_on.png">
          </v-col>
          <v-col>
            <span :style="{color:'green'}" class="mask_img">{{ figures.n_mask_on }} <span :style="{ visibility: unitvi, color:'black'}">명</span></span>
          </v-col>
        </v-row>
        </v-card>
      </v-col>
      <v-col>
        <v-card
        class="pa-0"
        outlined
        :style="{ 'font-size':fontsize }"
        >
        <v-row
        align=center
        >
          <v-col>
            <img class= "mask_img" src="../assets/UI_01/img_n_mask_unknown.png">
          </v-col>
          <v-col>
            <span :style="{color:'blue'}" class="mask_img">{{ figures.n_mask_unknown }} <span :style="{ visibility: unitvi, color:'black'}">명</span></span>
          </v-col>
        </v-row>
        </v-card>
      </v-col>
    </v-row>
    <br>
    <v-row
    class="mx-4"
    justify="center">
      <v-card
      class="pa-2"
      outlined
      v-bind:style="{ 'font-size' : cluster_fontsize }"
      width="100%">
      <v-row
      align=center>
        <!-- <v-col
        class="pa-0"> -->
          <img class="people_img_01" src="../assets/UI_01/img_n_social_group.png">
        <!-- </v-col>
        <v-col> -->
          <span class= "person">사회적 거리두기(<span :style="{'font-size' : '17px'}">{{ social_dist_hold }}m</span>) 위반 그룹 수</span><span class="divider"> | </span>
          <span>{{ figures.n_cluster }} <span class="constant"></span></span>
        <!-- </v-col> -->
      </v-row>
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios'
  export default {
    name: 'Figure',
    props: {
      figures: {type: Object},
    },
    data(){
      return{
        congestion: this.figures.congestion,
        risk: this.figures.risk,
        OffColor: 'red',
        OnColor: 'black',
        UnknownColor: 'black',
        RiskColor: 'black',
        unitvi: '',
        CongestionColor: 'black',
        risk_value: '',
        congestion_value: '',
        bgcolor: '',
        isred: false,

        fontsize: '23px', // 기본 폰트 사이즈
        n_fontsize: '37px', // 현 인원 수 폰트 사이즈
        cluster_fontsize: '15px', // 클러스터 v-card 폰트 사이즈
        proper_n: '',
        social_dist_hold: '',

        place_id: '', // 적정 인원수를 가져올 장소 넘버
      };
    },
    created(){
      this.get_settings(1);
      this.place_id = 1;
    },
    methods: {
      get_settings(val){
      axios.get('http://115.145.212.100:53344/api/settings/camera/' + val)
        .then(res => {
          this.proper_n= res.data.proper_n_people;
          this.social_dist_hold= res.data.distance_criteria;
        })
    }
    },
    watch: {
      figures: function(new_val){
        if(new_val.risk == 0)
          {this.RiskColor= 'gray'
          this.risk_value= '-'}
        else if(new_val.risk <= 20 && new_val.risk > 0)
          {this.RiskColor= 'rgba(54, 162, 235, 1)';
          this.risk_value= "양호";}
        else if(new_val.risk <= 40)
          {this.RiskColor= 'rgba(75, 192, 192, 1)';
          this.risk_value= "관심";}
        else if(new_val.risk <= 60)
          {this.RiskColor= 'rgba(255, 206, 86, 1)';
          this.risk_value= "주의";}
        else if(new_val.risk <= 80)
          {this.RiskColor= 'rgba(255, 159, 64, 1)';
          this.risk_value= "경계";}
        else
          {this.RiskColor= 'rgba(255, 0, 0, 0.8)';
          this.risk_value= "심각";
          // if(this.isred == false)
            // this.red_sign()
            }

        if(new_val.congestion == 0)
          {this.CongestionColor= 'gray'
          this.congestion_value= '-'}
        else if(new_val.congestion <= 20 && new_val.congestion > 0)
          {this.CongestionColor= 'rgba(54, 162, 235, 1)';
          this.congestion_value= "양호";}
        else if(new_val.congestion <= 40)
          {this.CongestionColor= 'rgba(75, 192, 192, 1)';
          this.congestion_value= "관심";}
        else if(new_val.congestion <= 60)
          {this.CongestionColor= 'rgba(255, 206, 86, 1)';
          this.congestion_value= "주의";}
        else if(new_val.congestion <= 80)
          {this.CongestionColor= 'rgba(255, 159, 64, 1)';
          this.congestion_value= "경계";}
        else
          {this.CongestionColor= 'rgba(255, 0, 0, 0.8)';
          this.congestion_value= "심각";
          // if(this.isred == false)
            // this.red_sign()
            }
        

        //         if(new_val.place_num == 1)
        //   this.get_settings(1)
        // else if (new_val.place_num == 2)
        //   this.get_settings(2)
        // else if (new_val.place_num == 3)
        //   this.get_settings(3)

        if(new_val.place_num != this.place_id){
          if(new_val.place_num == 1){
            this.get_settings(1)
            this.place_id = 1
          }
          else if(new_val.place_num == 2){
            this.get_settings(2)
            this.place_id = 2
          }
          else if(new_val.place_num == 3){
            this.get_settings(3)
            this.place_id = 3
          }
        }

      },
    },
  }
</script>

<style scoped>
.risk{
  font-weight: bold;
}
.congestion{
  font-weight: bold;
}
.mask_img{
  font-weight: bold;
  height: 60px;
  width: 70px;
  margin-left: 5px;
}
.constant{
  margin-left: 2px;
  margin-right: 100px;
}
.person{
  font-weight: bold;
}
.text_val{
  font-weight: bold;
}
.people_img{
  margin-left: 35%;
  margin-right: 20px;
}
.people_img_01{
  margin-left: 25%;
  margin-right: 20px;
}
.person{
  margin-left: 0px;
  margin-right: 0px;
}
#container{
  padding-top: 0px;
  margin-left: 0px
}
.divider{
  color: lightgray;
  margin-left: 5px;
  margin-right: 5px;
}
</style>