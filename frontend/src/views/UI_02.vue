<template>
  <div class="UI_02">
    <div class="title">
      <v-row align="center">
        <div class="button">
          <!-- UI01 button -->
          <v-btn
            v-on:click="link_to_live"
            id="b2" color="primary" dark>Live
            <v-icon color="white" dark right>mdi-video</v-icon>
          </v-btn>
        </div>
        <!-- select groups to watch -->
        <v-col cols="12" md="4">
          <v-select 
            v-model="groups_selected"
            :items="groups"
            attach
            chips
            label="Groups"
            multiple
          ></v-select>
        </v-col>
      </v-row>
    </div>
    <hr align=center>
    <v-container fluid pa-2>
      <!-- Left Part: Daily chart -->
      <v-row>
        <v-col
          cols="12"
          md="3"
        >
          <v-card
            class="pa-3"
            outlined
            tile
          >
            <v-select
              v-model="space_selected"
              :items="space"
              label="Space"
              dense
            ></v-select>

            <span class="h2" id="highlight">적정 인원 :  </span>
            <span class="h2" id="highlight">{{proper_n_people}}</span>

            <!-- Safety Score -->
            <v-layout wrap row>
              <v-flex xs12 sm6 md6 class="pb-2">
                <!-- When safety Score is high: color is green -->
                <v-card
                  v-if="safety" 
                  class ='margin'
                  height="100" 
                  width="200" 
                  color="#00E676"
                  elevation="2"
                >
                  <v-container pa-1>
                    <v-layout row>
                      <v-card-title primary-title class="justify-center">
                        <div>
                          <div class="h4" id="center">금주 안전지수</div>
                          <span class="h2" id="highlight">{{safetyScore}}</span>
                          <span class="h5" id="ten"> /10</span>
                        </div>
                      </v-card-title>
                    </v-layout>
                  </v-container>
                </v-card>
                <!-- When Safety Score is low: color is red -->
                <v-card
                  v-else
                  height="100"
                  width="200"
                  color="#FF9E80"
                >
                  <v-container pa-1>
                    <v-layout row>                   
                      <v-card-title primary-title class="justify-center">
                        <div>
                          <div class="h4" id="center">금주 안전지수</div>
                          <span class="h2" id="highlight">{{safetyScore}}</span>
                          <span class="h5" id="ten"> /10</span>
                        </div>
                      </v-card-title>
                    </v-layout>
                  </v-container>
                </v-card>
              </v-flex>
              <v-flex xs12 sm6 md6 class="pb-2">
                <v-card height="100" width="200">
                  <v-container pa-1>
                    <v-layout row>
                      <v-card-title primary-title>
                        <div>
                          <div class="h4" id="center">지난주 대비</div>
                          <span class="h2" id="highlight">{{safetyRate}} % </span>
                          <span>
                            <img v-if="isUp" :src="upSrc">
                            <img v-if="isDown" :src="downSrc">
                          </span>
                        </div>
                      </v-card-title>
                    </v-layout>
                  </v-container>
                </v-card>
              </v-flex>
              <!-- Daily Chart -->
              <v-flex>
                <daily-chart :chart-data="dailyDatacollection" width="350" height="300"></daily-chart>
              </v-flex>
              <!-- Plus Information -->
              <v-flex xs12 sm6 md6>
                  <v-card >
                    <v-container pa-1>
                      <v-layout row>                   
                        <v-card-title primary-title class="justify-center">
                          <div>
                            <div class="h4" id="center">평균 방문자 수</div>
                            <div id="highlight">{{avg_people}} 명</div>
                          </div>
                          </v-card-title>
                      </v-layout>                     
                    </v-container>
                  </v-card>
                </v-flex>
                <v-flex xs12 sm6 md6>
                  <v-card>
                    <v-container pa-1>
                      <v-layout row>                   
                        <v-card-title primary-title class="justify-center">
                          <div>
                            <div class="h4" id="center">최대 방문자 수</div>
                            <div class="h5" id="highlight">{{max_people}} 명</div>
                          </div>
                        </v-card-title>
                      </v-layout>
                    </v-container>
                  </v-card>
                </v-flex>
            </v-layout>
          </v-card>
        </v-col>
        <!-- Right Part: Period Chart -->
        <v-col cols="12" md="9">
          <v-card
            class="pa-3"
            outlined
            tile
          ><!-- date picker for selecting a period -->
            <v-row>
              <v-col
                cols="12"
                sm="6"
                md="4"
                class= "px-3 py-1 ma-0"
              >
                <v-menu
                  ref="menu"
                  v-model="menu"
                  :close-on-content-click="false"
                  :return-value.sync="date"
                  transition="scale-transition"
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }" class ="py-1">
                    <v-text-field
                      class= "py-1"
                      v-model="dateRangeText"
                      label="Date"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker v-model="dates" range no-title scrollable class= "pa-1">
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="menu = false">Cancel</v-btn>
                    <v-btn text color="primary" @click="$refs.menu.save(date)">OK</v-btn>
                  </v-date-picker>
                </v-menu>
              </v-col>
              <!-- Select Time Unit -->
              <v-col
                cols="12"
                sm="6"
                md="4"
              >
                <v-select
                  v-model="times"
                  :items="time_unit"
                  label="Time Unit"
                  dense
                ></v-select>
              </v-col>
              <!-- Update dates & time unit -->
              <v-col
                cols="12"
                sm="3"
              >
                <v-btn
                  icon
                  color="primary"
                  @click="counter+=1"
                >
                  <v-icon>mdi-cached</v-icon>
                </v-btn>
              </v-col>
            </v-row>

            <!-- Congestion Chart -->
            <h2 id="chart">혼잡도</h2>
            <congestion-chart :chart-data="congestionDatacollection" height="300"/>
            
            <!-- Risk Chart -->
            <h2 id="chart">위험도</h2>
            <risk-chart :chart-data="riskDatacollection" height="300"/>
            
            <!-- Information Table -->
            <v-data-table 
              dense 
              :headers="headers" 
              :items="places"
              :items-per-page="5"
              item-key="location"
              class="elevation-1"
            >
            <template v-slot : places.avg_congestion="{ places }">
              <v-chip
                :color="this.getColor(places.avg_congestion)"
                dark
              >
                {{ places.avg_congestion }}
              </v-chip>
            </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>


<script>
  import DailyChart from '@/components/DailyChart'
  import CongestionChart from '@/components/CongestionChart'
  import RiskChart from '@/components/RiskChart'
  import axios from 'axios'
  import moment from 'moment'
  // import vueMoment from 'vue-moment'


  export default {
    name: 'UI_02',
    components: {
      DailyChart,
      CongestionChart,
      RiskChart,
    },
    data() {
      return {
        center: 'center',
        result: '', // res.data

        // Location
        groups: ['Lounge', 'Cafe', 'Gym'],        
        groups_selected: ['Lounge', 'Cafe', 'Gym'], // 선택된 장소 배열
        groups_num: [0, 1, 2], // 선택된 장소의 배열 index
        space: ['Lounge', 'Cafe', 'Gym'],
        space_selected: 'Lounge', //this.groups[0] || ''
        space_num: 0, //
        proper_n_people: '',

        // Safety Score
        safetyScore: '',
        cardColor: '',
        prevScore: '',
        safetyRate: '', // (safetyScore - preScore / preScore) * 100 safetyScore가 이전(prevScore)에 비해 얼마나 증감 했는가?
        safetyWord: '',
        safety: false,
        isUp: false,
        isSame: false,
        isDown: false,
        upSrc: require('../assets/UI_02/up-arrow.png'),
        downSrc: require('../assets/UI_02/down-arrow.png'),
        
        // Date Picker
        dates: [moment().format('YYYY-MM-DD'), moment().subtract(7, 'd').format('YYYY-MM-DD')],
        menu: false,
        firstDate: '', //moment().format("YYYY-MM-DD"),
        lastDate: '', //moment().format("YYYY-MM-DD"),
        days: moment(),

        // Time Unit
        time_unit: ['minute', 'hour', 'day'],
        times: 'hour',

        // Update
        counter: 0,

        // Color
        colors: [ '#4285f4', '#34a853', '#fbbc05', '#ea4335' ],

        // Daily Chart
        dailyDatacollection: [],
        dailyBackgroundColor: [],
        max_people: '',
        avg_people: '',

        // Chart Choice
        choice: '',

        // Congestion Chart
        congestionLabel: [],
        congestionData_1: [],
        congestionData_2: [],
        congestionData_3: [],
        congestionDatacollection: [], // instantiating datacollection with null
        pointRadius_con_1: [],
        pointBorderColors_con_1: [],
        pointBackgroundColors_con_1: [],
        pointRadius_con_2: [],
        pointBorderColors_con_2: [],
        pointBackgroundColors_con_2: [],
        pointRadius_con_3: [],
        pointBorderColors_con_3: [],
        pointBackgroundColors_con_3: [],
        
        // Risk Chart   
        riskLabel: [],
        riskData_1: [],
        riskData_2: [],
        riskData_3: [],
        riskDatacollection: [],
        pointRadius_risk_1: [],
        pointBorderColors_risk_1: [],
        pointBackgroundColors_risk_1: [],
        pointRadius_risk_2: [],
        pointBorderColors_risk_2: [],
        pointBackgroundColors_risk_2: [],
        pointRadius_risk_3: [],
        pointBorderColors_risk_3: [],
        pointBackgroundColors_risk_3: [],
             
        // Figures for information table
        location: [],
        appropriate_people: [],
        max_congestion: [],
        avg_congestion: [],
        max_risk: [],
        avg_risk: [],
        high_risk: [],
        alert: [],
        headers: [
          {
            text: '장소',
            align: 'start',
            sortable: false,
            value: 'location',
          },
          { text: '적정 인원 (명)', value: 'appropriate_people' },
          { text: '최대 혼잡도 (%)', value: 'max_congestion' },
          { text: '평균 혼잡도 (%)', value: 'avg_congestion' },
          { text: '최대 위험도 (%)', value: 'max_risk' },
          { text: '평균 위험도 (%)', value: 'avg_risk' },
          { text: '경고 발생 횟수 (회)', value: 'alert' },
        ],
        places: [],
        //places: [{location: 'Co-Working Space', appropriate_people: 9, avg_congestion: 31.583333333333332, avg_risk: 35.30555555555556, alert: 5},
        //{location: 'Test Video', appropriate_people: 9, avg_congestion: 26.583333333333332, avg_risk: 30.305555555555557, alert: 5}]
        rate_color: 'black',
      }
    },
    computed: {
      // check dates
      dateRangeText () {
        if(this.dates[0] > this.dates[1])
          [this.dates[0], this.dates[1]] = [this.dates[1], this.dates[0]] 
        return this.dates.join(' ~ ')
      },
    },
    created() {
      // first create page
      console.log(this.dates, this.firstDate, this.lastDate)
      this.getCreateData()
    },
    watch: {
      // when counter value changes, get new data
      counter (val) {
        console.log("counter: " + this.counter);
        this.getData();
      },
      // when group changes, update all page
      groups_selected (val) {
        console.log('groups_selceted: '+this.groups_selected)
        this.groups_num.length=0
        this.groups_num = [] // same code above
        for(var i=0; i<this.groups_selected.length; i++) {
          this.groups_num.push(this.groups.indexOf(this.groups_selected[i]))
        }
        console.log('groups_num: '+this.groups_num)
        this.space=this.groups_selected
        
        // UPDATE EVERYTHING
        this.fillSpace();

        this.updateSafetyScore();
        this.updateDaily();

        this.updateData();
        this.drawGraph();

        this.fillPlaces();
      },
      // when space changes, update daily part
      space_selected (val) {
        this.space_num = this.groups.indexOf(this.space_selected)
        this.proper_n_people = this.result[this.space_num].proper_n_people
        this.updateSafetyScore()
        this.updateDaily()
      },
    },
    methods: {
      getColor(val){
        var hold = '60' // places에 적용 기준은 주의
        if(val < hold)
          return 'black'
        else if (val >= hold)
          return 'red'
      },
      link_to_live(){
      this.$router.push("/video");
      },
      fillGroups() {
        this.groups.length=0
        for(var i=0; i<this.result.length; i++){
          this.groups.push(this.result[i].location)
        }
        console.log('fillgroups-location: '+ this.groups)
      },
      fillGroupsSelected() {
        this.groups_selected.length=0
        this.groups_num.length=0
        for(var i=0; i<this.result.length; i++){
          this.groups_selected.push(this.result[i].location)
          this.groups_num.push(i)
        }
        console.log('fillgroupsselected-location: '+ this.groups_selected)
      },
      fillCreateGroupsSelected() {
        this.groups_selected.length=0
        this.groups_num.length=0
        this.groups_selected.push(this.result[0].location)
        this.groups_num.push(0)
      },
      fillSpace() {
        this.space_selected = this.groups_selected[this.groups_selected.length-1]
        this.space_num = this.groups.indexOf(this.space_selected)
        console.log('fillspace-location: '+ this.space_selected)
        this.proper_n_people = this.result[this.space_num].proper_n_people
        console.log("fillspace - proper_n_people: "+ this.proper_n_people)
      },
      updateSafetyScore() {
        this.safetyScore = parseFloat(this.result[this.space_num].today.safety_score)
        this.prevScore = parseFloat(this.result[this.space_num].today.prev_safety_score)
        this.safetyRate = ((this.safetyScore-this.prevScore)/this.prevScore*100)
        this.safetyRate = parseFloat(this.safetyRate.toFixed(1))
        console.log("safe: "+this.safetyScore, " prev: " + this.prevScore + " rate: " + this.safetyRate);
        if(this.safetyScore >= 6) {
          this.safety = true;
        }
        else {
          this.safety = false;
        }

        if(this.safetyRate > 0) {
          this.isUp = true;
          this.isSame = false;
          this.isDown = false;
        }
        else if(this.safetyRate == 0) {
          this.isUp = false;
          this.isSame = true;
          this.isDown = false;
        }
        else if(this.safetyRate < 0) { // 내려간 비율을 나타냄
          this.isUp = false;
          this.isSame = false;
          this.isDown = true;
          this.safetyRate = -this.safetyRate;
        }
      },
      updateDaily() { // Daily Chart Data
        console.log('updateDaily')
        this.dailyDatacollection.length = 0
        this.dailyBackgroundColor.length = 0
        
        for(var i=8; i<this.result[this.space_num].current_hour-1; i++) {
          this.dailyBackgroundColor.push('#BDBDBD');
        }
        this.dailyBackgroundColor.push('#E91E63');

        this.dailyDatacollection = {
          // Data for the y-axis of the chart
          labels: [ //'0', '2','4', '6', 
          '8시', '9시', '10시', '11시', '12시', '13시', '14시', '15시', '16시', '17시', '18시', '19시', '20시', '21시'],
          datasets: [
            {
              label: "방문자 수",
              backgroundColor: this.dailyBackgroundColor,
              data: [ this.result[this.space_num].today.n_people[8], this.result[this.space_num].today.n_people[9],
                this.result[this.space_num].today.n_people[10], this.result[this.space_num].today.n_people[11],
                this.result[this.space_num].today.n_people[12], this.result[this.space_num].today.n_people[13],
                this.result[this.space_num].today.n_people[14], this.result[this.space_num].today.n_people[15],
                this.result[this.space_num].today.n_people[16], this.result[this.space_num].today.n_people[17],
                this.result[this.space_num].today.n_people[18], this.result[this.space_num].today.n_people[19],
                this.result[this.space_num].today.n_people[20], this.result[this.space_num].today.n_people[21] ]
              
            }
          ]
        }
        this.max_people = this.result[this.space_num].today.max_people
        this.avg_people = this.result[this.space_num].today.avg_people
      },
      updateLabel() { // Congestion & Risk Chart Label
        var diff=this.firstDate
        this.congestionLabel.length = 0
        this.riskLabel.length = 0

        console.log('updateLabel days: '+ this.days)
        console.log('updateLabel this.firstDate: ' + this.firstDate)

        if( this.times=='minute' ) {
          for (var i=0; i<=this.days; i++) { // show 8am 9am 10am 11am ... 10pm
            console.log(i + ' diff date: '+diff.format('YYYY-MM-DD'))
            this.congestionLabel.push(diff.format('YYYY-MM-DD')+' 8am')          
            this.riskLabel.push(diff.format('YYYY-MM-DD')+' 8am')
            for (var j=0; j<5; j++){
              this.congestionLabel.push('')
              this.riskLabel.push('')
            }
            this.congestionLabel.push('9am')
            this.riskLabel.push('9am')
            for (var j=0; j<5; j++){
              this.congestionLabel.push('')
              this.riskLabel.push('')
            }
            this.congestionLabel.push('10am')
            this.riskLabel.push('10am')
            for (var j=0; j<5; j++){
              this.congestionLabel.push('')
              this.riskLabel.push('')
            }
            this.congestionLabel.push('11am')
            this.riskLabel.push('11am')
            for (var j=0; j<5; j++){
              this.congestionLabel.push('')
              this.riskLabel.push('')
            }
            this.congestionLabel.push('12pm')
            this.riskLabel.push('12pm')
            for (var j=0; j<5; j++){
              this.congestionLabel.push('')
              this.riskLabel.push('')
            }            
            this.congestionLabel.push('1pm')
            this.riskLabel.push('1pm')
            for (var j=0; j<5; j++){
              this.congestionLabel.push('')
              this.riskLabel.push('')
            }
            this.congestionLabel.push('2pm')
            this.riskLabel.push('2pm')
            for (var j=0; j<5; j++){
              this.congestionLabel.push('')
              this.riskLabel.push('')
            }
            this.congestionLabel.push('3pm')
            this.riskLabel.push('3pm')
            for (var j=0; j<5; j++){
              this.congestionLabel.push('')
              this.riskLabel.push('')
            }
            this.congestionLabel.push('4pm')
            this.riskLabel.push('4pm')
            for (var j=0; j<5; j++){
              this.congestionLabel.push('')
              this.riskLabel.push('')
            }
            this.congestionLabel.push('5pm')
            this.riskLabel.push('5pm')
            for (var j=0; j<5; j++){
              this.congestionLabel.push('')
              this.riskLabel.push('')
            }
            this.congestionLabel.push('6pm')
            this.riskLabel.push('6pm')
            for (var j=0; j<5; j++){
              this.congestionLabel.push('')
              this.riskLabel.push('')
            }
            this.congestionLabel.push('7pm')
            this.riskLabel.push('7pm')
            for (var j=0; j<5; j++){
              this.congestionLabel.push('')
              this.riskLabel.push('')
            }
            this.congestionLabel.push('8pm')
            this.riskLabel.push('8pm')
            for (var j=0; j<5; j++){
              this.congestionLabel.push('')
              this.riskLabel.push('')
            }
            this.congestionLabel.push('9pm')
            this.riskLabel.push('9pm')
            for (var j=0; j<5; j++){
              this.congestionLabel.push('')
              this.riskLabel.push('')
            }
            this.congestionLabel.push('10pm')
            this.riskLabel.push('10pm')
            for (var j=0; j<5; j++){
              this.congestionLabel.push('')
              this.riskLabel.push('')
            }
            diff = diff.add(1, 'days')
          }
        }
        else if ( this.times=='hour' ) {
          for (var i=0; i<=this.days; i++) { // show 8am 12pm 3pm 6pm 9pm
            console.log(i + ' diff date: '+diff.format('YYYY-MM-DD'))
            this.congestionLabel.push(diff.format('YYYY-MM-DD')+' 8am')          
            this.riskLabel.push(diff.format('YYYY-MM-DD')+' 8am')    
            for (var j=0; j<3; j++){
              this.congestionLabel.push('')
              this.riskLabel.push('')
            }
            this.congestionLabel.push('12pm')
            this.riskLabel.push('12pm')
            for (var j=0; j<2; j++){
              this.congestionLabel.push('')
              this.riskLabel.push('')
            }
            this.congestionLabel.push('3pm')
            this.riskLabel.push('3pm')
            for (var j=0; j<2; j++){
              this.congestionLabel.push('')
              this.riskLabel.push('')
            }
            this.congestionLabel.push('6pm')
            this.riskLabel.push('6pm')
            for (var j=0; j<2; j++){
              this.congestionLabel.push('')
              this.riskLabel.push('')
            }
            this.congestionLabel.push('9pm')
            this.riskLabel.push('9pm')
            for (var j=0; j<1; j++){
              this.congestionLabel.push('')
              this.riskLabel.push('')
            }
            diff = diff.add(1, 'days')
          }     
        }
        else if ( this.times=='day' ) {
          for (var i=0; i<=this.days; i++) { // show only date
            console.log(i + ' diff date: '+diff.format('YYYY-MM-DD'))
            this.congestionLabel.push(diff.format('YYYY-MM-DD'))          
            this.riskLabel.push(diff.format('YYYY-MM-DD'))
            diff = diff.add(1, 'days')
          }
        }     
      },
      updateData() { // Congestion & Risk Chart Data 
        this.congestionData_1.length = 0
        this.congestionData_2.length = 0
        this.congestionData_3.length = 0
        this.riskData_1.length = 0
        this.riskData_2.length = 0
        this.riskData_3.length = 0
// Logic Needs Change START //
        if( this.times=='minute' ) {
          for (var i=0; i<this.groups_selected.length; i++){
            if(i==0){
              var j=0;
              while( j < ( this.days + 1 ) * 1440 ){ // 1day = 1440m = 24h * 60m/h, 1380m = 23h * 60m/h
                j += 480;
                for(var k=48; k<138; k++) {
                  this.congestionData_1.push(this.result[0].selected_period.congestions[j]) // 값 넣기
                  this.riskData_1.push(this.result[0].selected_period.risks[j])
                  j += 10;
                }
              }
            }
            else if(i==1){
              var j=0;
              while(j<(this.days+1)*1440){ // 1440 = 24*60
                j += 480;
                for(var k=48; k<138; k++) {
                  this.congestionData_2.push(this.result[1].selected_period.congestions[j]) // 값 넣기
                  this.riskData_2.push(this.result[1].selected_period.risks[j])
                  j += 10;
                }             
              }  
            }
            else if(i==2){
              var j=0;
              while(j<(this.days+1)*1440){ // 1440 = 24*60
                j += 480;
                for(var k=48; k<138; k++) {
                  this.congestionData_3.push(this.result[2].selected_period.congestions[j]) // 값 넣기
                  this.riskData_3.push(this.result[2].selected_period.risks[j])
                  j += 10;
                }             
              }  
            }
          }
        }
// Logic Needs Change END//
        else if ( this.times=='hour' ) {
          for (var i=0; i<this.groups_selected.length; i++) {
            if(i==0){
              var j=0;
              while( j < ( this.days + 1 ) * 24 ){
                j += 8;
                for(var k=8; k<23; k++) {
                  this.congestionData_1.push(this.result[0].selected_period.congestions[j]) // 값 넣기
                  this.riskData_1.push(this.result[0].selected_period.risks[j])
                  j++;
                }         
                j++;    
              }       
            }
            else if(i==1){
              var j=0;
              while(j<(this.days+1)*24){
                j += 8;
                for(var k=8; k<23; k++) {
                  this.congestionData_2.push(this.result[1].selected_period.congestions[j]) // 값 넣기
                  this.riskData_2.push(this.result[1].selected_period.risks[j])
                  j++;
                } 
                j++;            
              }
            }
            else if(i==2){
              var j=0;
              while(j<(this.days+1)*24){
                j += 8;
                for(var k=8; k<23; k++) {
                  this.congestionData_3.push(this.result[2].selected_period.congestions[j]) // 값 넣기
                  this.riskData_3.push(this.result[2].selected_period.risks[j])
                  j++;
                } 
                j++;            
              }
            }
          }
        }
        else if ( this.times=='day' ) {
          for (var i=0; i<this.groups_selected.length; i++){
            if(i==0){
              for(var j=0; j<(this.days+1); j++){
                this.congestionData_1.push(this.result[0].selected_period.congestions[j]) // 값 넣기
                this.riskData_1.push(this.result[0].selected_period.risks[j])                
              }
            }
            else if(i==1){
              for(var j=0; j<(this.days+1); j++){
                this.congestionData_2.push(this.result[1].selected_period.congestions[j])
                this.riskData_2.push(this.result[1].selected_period.risks[j])                    
              }
            }
            else if(i==2){
              for(var j=0; j<(this.days+1); j++){
                this.congestionData_3.push(this.result[2].selected_period.congestions[j])
                this.riskData_3.push(this.result[2].selected_period.risks[j])                    
              }
            }
          }
        }
      },
      drawGraph () { // Draw All Charts
        Chart.pluginService.register({
          beforeDraw: function(chartInstance, easing) {
            var lineOpts = chartInstance.options.drawHorizontalLine;
            if (lineOpts) {
              // Decide graph X, Y axis, fonts, and draw line on the graph
              var yAxis = chartInstance.scales["y-axis-0"];
              var yValueStart = yAxis.getPixelForValue(lineOpts.lineY[0], 0, 0, true);
              var yValueEnd = yAxis.getPixelForValue(lineOpts.lineY[1], 0, 0, true);

              var xAxis = chartInstance.scales["x-axis-0"];
              var xValueStart = xAxis.getPixelForTick(0) - 5;
              var xValueEnd = xAxis.right;

              var ctx = chartInstance.chart.ctx;
              ctx.save();

              ctx.font = lineOpts.textFont;
              ctx.fillStyle = lineOpts.textColor;
              ctx.fillText(lineOpts.text, lineOpts.textPosition, yValueStart + 8);

              ctx.setLineDash([15, 15]);
              ctx.strokeStyle = lineOpts.lineColor;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(xValueStart, yValueStart);
              ctx.lineTo(xValueEnd, yValueEnd);
              ctx.stroke();

              ctx.restore();
            }
          }
        });

        this.pointBackgroundColors_con_1.length = 0;
        this.pointBorderColors_con_1.length = 0;
        this.pointRadius_con_1.length = 0;

        this.pointBackgroundColors_con_2.length = 0;
        this.pointBorderColors_con_2.length = 0;
        this.pointRadius_con_2.length = 0;

        this.pointBackgroundColors_con_3.length = 0;
        this.pointBorderColors_con_3.length = 0;
        this.pointRadius_con_3.length = 0;
        
        this.pointBackgroundColors_risk_1.length = 0;
        this.pointBorderColors_risk_1.length = 0;
        this.pointRadius_risk_1.length = 0;

        this.pointBackgroundColors_risk_2.length = 0;
        this.pointBorderColors_risk_2.length = 0;
        this.pointRadius_risk_2.length = 0;

        this.pointBackgroundColors_risk_3.length = 0;
        this.pointBorderColors_risk_3.length = 0;
        this.pointRadius_risk_3.length = 0;

        if(this.groups_selected.length == 1) { // show graph of the only selected group
          this.congestionDatacollection = {
            // Data for the y-axis of the chart
            labels: this.congestionLabel,
            datasets: [
              {
                label: this.groups_selected[0],
                borderColor: this.colors[0],          
                fill: false,
                borderWidth: 4,
                // Data for the x-axis of the chart
                data: this.congestionData_1,
                pointRadius: this.pointRadius_con_1,
                pointBorderColor: this.pointBorderColors_con_1,
                pointBackgroundColor: this.pointBackgroundColors_con_1,
              }
            ]
          }
          this.riskDatacollection = {
            // Data for the y-axis of the chart
            labels: this.riskLabel,
            datasets: [
              {
                label: this.groups_selected[0],
                borderColor: this.colors[0],
                fill: false,
                borderWidth: 4,
                // Data for the x-axis of the chart
                data: this.riskData_1,
                pointRadius: this.pointRadius_risk_1,
                pointBorderColor: this.pointBorderColors_risk_1,
                pointBackgroundColor: this.pointBackgroundColors_risk_1,
              }
            ],
          }
          for (var i = 0; i < this.congestionDatacollection.datasets[0].data.length; i++) {
            if (this.congestionDatacollection.datasets[0].data[i] > 60) {
              this.pointBackgroundColors_con_1.push("#ea4335");
              this.pointBorderColors_con_1.push("#ea4335");
              this.pointRadius_con_1.push(3);
            } else {
              this.pointBackgroundColors_con_1.push("");
              this.pointBorderColors_con_1.push("")
              this.pointRadius_con_1.push(0);
            }              
          }               
          for (var i = 0; i < this.congestionDatacollection.datasets[0].data.length; i++) {
            if (this.riskDatacollection.datasets[0].data[i] > 60) {
              this.pointBackgroundColors_risk_1.push("#ea4335");
              this.pointBorderColors_risk_1.push("#ea4335");
              this.pointRadius_risk_1.push(3);
            } else {
              this.pointBackgroundColors_risk_1.push("");
              this.pointBorderColors_risk_1.push("")
              this.pointRadius_risk_1.push(0);
            }          
          } 
        }
        else if(this.groups_selected.length == 2) { // show graph of the last place of selected group
          this.congestionDatacollection = {
            // Data for the y-axis of the chart
            labels: this.congestionLabel,
            datasets: [
              {
                label: this.groups_selected[0],
                borderColor: this.colors[0],          
                fill: false,
                borderWidth: 4,
                // Data for the x-axis of the chart
                data: this.congestionData_1,
                pointRadius: this.pointRadius_con_1,
                pointBorderColor: this.pointBorderColors_con_1,
                pointBackgroundColor: this.pointBackgroundColors_con_1,
              },
              {
                label: this.groups_selected[1],
                borderColor: this.colors[1],          
                fill: false,
                borderWidth: 4,
                // Data for the x-axis of the chart
                data: this.congestionData_2,
                pointRadius: this.pointRadius_con_2,
                pointBorderColor: this.pointBorderColors_con_2,
                pointBackgroundColor: this.pointBackgroundColors_con_2,
              }
            ]
          }
          this.riskDatacollection = {
            // Data for the y-axis of the chart
            labels: this.riskLabel,
            datasets: [
              {
                label: this.groups_selected[0],
                borderColor: this.colors[0],
                fill: false,
                borderWidth: 4,
                // Data for the x-axis of the chart
                data: this.riskData_1,
                pointRadius: this.pointRadius_risk_1,
                pointBorderColor: this.pointBorderColors_risk_1,
                pointBackgroundColor: this.pointBackgroundColors_risk_1,
              },
              {
                label: this.groups_selected[1],
                borderColor: this.colors[1],
                fill: false,
                borderWidth: 4,
                // Data for the x-axis of the chart
                data: this.riskData_2,
                pointRadius: this.pointRadius_risk_2,
                pointBorderColor: this.pointBorderColors_risk_2,
                pointBackgroundColor: this.pointBackgroundColors_risk_2,
              },
            ],
          } 
          for (var i = 0; i < this.congestionDatacollection.datasets[0].data.length; i++) {
            if (this.congestionDatacollection.datasets[0].data[i] > 60) {
              this.pointBackgroundColors_con_1.push("#ea4335");
              this.pointBorderColors_con_1.push("#ea4335");
              this.pointRadius_con_1.push(3);
            } else {
              this.pointBackgroundColors_con_1.push("");
              this.pointBorderColors_con_1.push("")
              this.pointRadius_con_1.push(0);
            }
            if (this.congestionDatacollection.datasets[1].data[i] > 60) {
              this.pointBackgroundColors_con_2.push("#ea4335");
              this.pointBorderColors_con_2.push("#ea4335");
              this.pointRadius_con_2.push(3);
            } else {
              this.pointBackgroundColors_con_2.push("");
              this.pointBorderColors_con_2.push("")
              this.pointRadius_con_2.push(0);
            }         
          }      
          
          for (var i = 0; i < this.congestionDatacollection.datasets[0].data.length; i++) {
            if (this.riskDatacollection.datasets[0].data[i] > 60) {
              this.pointBackgroundColors_risk_1.push("#ea4335");
              this.pointBorderColors_risk_1.push("#ea4335");
              this.pointRadius_risk_1.push(3);
            } else {
              this.pointBackgroundColors_risk_1.push("");
              this.pointBorderColors_risk_1.push("")
              this.pointRadius_risk_1.push(0);
            }
            if (this.riskDatacollection.datasets[1].data[i] > 60) {
              this.pointBackgroundColors_risk_2.push("#ea4335");
              this.pointBorderColors_risk_2.push("#ea4335");
              this.pointRadius_risk_2.push(3);
            } else {
              this.pointBackgroundColors_risk_2.push("");
              this.pointBorderColors_risk_2.push("")
              this.pointRadius_risk_2.push(0);
            }
          }                  
        }
        else if(this.groups_selected.length == 3) {
          this.congestionDatacollection = {
            // Data for the y-axis of the chart
            labels: this.congestionLabel,
            datasets: [
              {
                label: this.groups_selected[0],
                borderColor: this.colors[0],          
                fill: false,
                borderWidth: 4,
                // Data for the x-axis of the chart
                data: this.congestionData_1,
                pointRadius: this.pointRadius_con_1,
                pointBorderColor: this.pointBorderColors_con_1,
                pointBackgroundColor: this.pointBackgroundColors_con_1,
              },
              {
                label: this.groups_selected[1],
                borderColor: this.colors[1],          
                fill: false,
                borderWidth: 4,
                // Data for the x-axis of the chart
                data: this.congestionData_2,
                pointRadius: this.pointRadius_con_2,
                pointBorderColor: this.pointBorderColors_con_2,
                pointBackgroundColor: this.pointBackgroundColors_con_2,
              },
              {
                label: this.groups_selected[2],
                borderColor: this.colors[2],          
                fill: false,
                borderWidth: 4,
                // Data for the x-axis of the chart
                data: this.congestionData_3,
                pointRadius: this.pointRadius_con_3,
                pointBorderColor: this.pointBorderColors_con_3,
                pointBackgroundColor: this.pointBackgroundColors_con_3,
              }
            ]
          }
          this.riskDatacollection = {
            // Data for the y-axis of the chart
            labels: this.riskLabel,
            datasets: [ // 환경 설정
              {
                label: this.groups_selected[0],
                borderColor: this.colors[0],
                fill: false,
                borderWidth: 4,
                // Data for the x-axis of the chart
                data: this.riskData_1,
                pointRadius: this.pointRadius_risk_1,
                pointBorderColor: this.pointBorderColors_risk_1,
                pointBackgroundColor: this.pointBackgroundColors_risk_1,
                // pointStyle: 'triangle'
              },
              {
                label: this.groups_selected[1],
                borderColor: this.colors[1],
                fill: false,
                borderWidth: 4,
                // Data for the x-axis of the chart
                data: this.riskData_2,
                pointRadius: this.pointRadius_risk_2,
                pointBorderColor: this.pointBorderColors_risk_2,
                pointBackgroundColor: this.pointBackgroundColors_risk_2,
                // pointStyle: 'triangle'
              },
              {
                label: this.groups_selected[2],
                borderColor: this.colors[2],
                fill: false,
                borderWidth: 4,
                // Data for the x-axis of the chart
                data: this.riskData_3,
                pointRadius: this.pointRadius_risk_3,
                pointBorderColor: this.pointBorderColors_risk_3,
                pointBackgroundColor: this.pointBackgroundColors_risk_3,
                // pointStyle: 'triangle'
              }
            ],
          }    // 데이터 적용
          for (var i = 0; i < this.congestionDatacollection.datasets[0].data.length; i++) {
            if (this.congestionDatacollection.datasets[0].data[i] > 60) {
              this.pointBackgroundColors_con_1.push("#ea4335");
              this.pointBorderColors_con_1.push("#ea4335");
              this.pointRadius_con_1.push(3);
            } else {
              this.pointBackgroundColors_con_1.push("");
              this.pointBorderColors_con_1.push("")
              this.pointRadius_con_1.push(0);
            }
            if (this.congestionDatacollection.datasets[1].data[i] > 60) {
              this.pointBackgroundColors_con_2.push("#ea4335");
              this.pointBorderColors_con_2.push("#ea4335");
              this.pointRadius_con_2.push(3);
            } else {
              this.pointBackgroundColors_con_2.push("");
              this.pointBorderColors_con_2.push("")
              this.pointRadius_con_2.push(0);
            }    
            if (this.congestionDatacollection.datasets[2].data[i] > 60) {
              this.pointBackgroundColors_con_3.push("#ea4335");
              this.pointBorderColors_con_3.push("#ea4335");
              this.pointRadius_con_3.push(3);
            } else {
              this.pointBackgroundColors_con_3.push("");
              this.pointBorderColors_con_3.push("")
              this.pointRadius_con_3.push(0);
            }       
          }      
          
          for (var i = 0; i < this.congestionDatacollection.datasets[0].data.length; i++) {
            if (this.riskDatacollection.datasets[0].data[i] > 60) {
              this.pointBackgroundColors_risk_1.push("#ea4335");
              this.pointBorderColors_risk_1.push("#ea4335");
              this.pointRadius_risk_1.push(3);
            } else {
              this.pointBackgroundColors_risk_1.push("");
              this.pointBorderColors_risk_1.push("")
              this.pointRadius_risk_1.push(0);
            }
            if (this.riskDatacollection.datasets[1].data[i] > 60) {
              this.pointBackgroundColors_risk_2.push("#ea4335");
              this.pointBorderColors_risk_2.push("#ea4335");
              this.pointRadius_risk_2.push(3);
            } else {
              this.pointBackgroundColors_risk_2.push("");
              this.pointBorderColors_risk_2.push("")
              this.pointRadius_risk_2.push(0);
            }
            if (this.riskDatacollection.datasets[2].data[i] > 60) {
              this.pointBackgroundColors_risk_3.push("#ea4335");
              this.pointBorderColors_risk_3.push("#ea4335");
              this.pointRadius_risk_3.push(3);
            } else {
              this.pointBackgroundColors_risk_3.push("");
              this.pointBorderColors_risk_3.push("")
              this.pointRadius_risk_3.push(0);
            }
          } 
        }
      },
      fillPlaces(){ // Information Table API 문서 필
        console.log("fillPlaces_groups_selected: " + this.groups_selected)
        console.log("fillPlaces_groups_num: " + this.groups_num)
        this.places.length = 0
        // Make three table
        var place0  = {
          location: '0',
          appropriate_people: 0,
          max_congestion: 0,
          avg_congestion: 0,
          max_risk: 0,
          avg_risk: 0,
          alert: 0,
        }
        var place1  = {
          location: '0',
          appropriate_people: 0,
          max_congestion: 0,
          avg_congestion: 0,
          max_risk: 0,
          avg_risk: 0,
          alert: 0,
        }
        var place2  = {
          location: '0',
          appropriate_people: 0,
          max_congestion: 0,
          avg_congestion: 0,
          max_risk: 0,
          avg_risk: 0,
          alert: 0,
        }
        for(var i=0; i<this.groups_selected.length; i++){     
          if(i==0){
            place0.location = this.result[this.groups_num[i]].location
            place0.appropriate_people = this.result[this.groups_num[i]].proper_n_people 
            place0.max_congestion = this.result[this.groups_num[i]].selected_period.max_congestion.toFixed(1) 
            place0.avg_congestion = this.result[this.groups_num[i]].selected_period.avg_congestion.toFixed(1)
            place0.max_risk = this.result[this.groups_num[i]].selected_period.max_risk.toFixed(1)
            place0.avg_risk = this.result[this.groups_num[i]].selected_period.avg_risk.toFixed(1)
            place0.alert = this.result[this.groups_num[i]].selected_period.alert_count
            this.places.push(place0);
          }     
          else if(i==1){
            place1.location = this.result[this.groups_num[i]].location
            place1.appropriate_people = this.result[this.groups_num[i]].proper_n_people 
            place1.max_congestion = this.result[this.groups_num[i]].selected_period.max_congestion.toFixed(1)
            place1.avg_congestion = this.result[this.groups_num[i]].selected_period.avg_congestion.toFixed(1)
            place1.max_risk = this.result[this.groups_num[i]].selected_period.max_risk.toFixed(1)
            place1.avg_risk = this.result[this.groups_num[i]].selected_period.avg_risk.toFixed(1)
            place1.alert = this.result[this.groups_num[i]].selected_period.alert_count
            this.places.push(place1);
          }
          else if(i==2){
            place2.location = this.result[this.groups_num[i]].location
            place2.appropriate_people = this.result[this.groups_num[i]].proper_n_people 
            place2.max_congestion = this.result[this.groups_num[i]].selected_period.max_congestion.toFixed(1)
            place2.avg_congestion = this.result[this.groups_num[i]].selected_period.avg_congestion.toFixed(1)
            place2.max_risk = this.result[this.groups_num[i]].selected_period.max_risk.toFixed(1)
            place2.avg_risk = this.result[this.groups_num[i]].selected_period.avg_risk.toFixed(1)
            place2.alert = this.result[this.groups_num[i]].selected_period.alert_count
            this.places.push(place2);
          }
        }
        // console.log("fillPlaces[0]: "+this.places[0].location)
        // console.log("fillPlaces[1]: "+this.places[1].location)
      },
      getData() { // get data from backend
        // this.firstDate = moment(this.dates[0], 'YYYY-MM-DD')
        // this.lastDate = moment(this.dates[1], 'YYYY-MM-DD')
        this.firstDate = this.dates[0]
        this.lastDate = this.dates[1]
        this.days = this.lastDate.diff(this.firstDate, 'days')
        console.log("getData - lastDate: " + this.days)
        this.date = this.firstDate.format('YYYY-MM-DD') +'/'+ this.lastDate.format('YYYY-MM-DD')+"/"+ this.times
        axios.get('http://115.145.212.100:53344/api/stats/'+ this.date)
          .then(res => {
            console.log("getdata: " + 'http://115.145.212.100:53344/api/stats/'+ this.date);
            this.result = res.data;
            console.log(this.result)
            this.updateLabel();

            this.fillGroups();
            this.fillGroupsSelected();
            this.fillSpace();

            this.updateSafetyScore();
            this.updateDaily();

            this.updateData();
            this.drawGraph();

            this.fillPlaces();            
          })
      },
      getCreateData() {
        this.firstDate = moment(this.dates[0], 'YYYY-MM-DD')
        this.lastDate = moment(this.dates[1], 'YYYY-MM-DD')
        this.days = this.lastDate.diff(this.firstDate, 'days')
        console.log("getData - lastDate: " + this.days)
        this.date = this.firstDate.format('YYYY-MM-DD') +'/'+ this.lastDate.format('YYYY-MM-DD')+"/"+ this.times
        axios.get('http://115.145.212.100:53344/api/stats/'+ this.date)
          .then(res => {
            console.log("getdata: " + 'http://115.145.212.100:53344/api/stats/'+ this.date);
            this.result = res.data;
            console.log(this.result)
            this.updateLabel();

            this.fillGroups();
            this.fillCreateGroupsSelected();
            this.fillSpace();

            this.updateSafetyScore();
            this.updateDaily();

            this.updateData();
            this.drawGraph();

            this.fillPlaces();            
          })
      },
    }
  }
</script>

<style scoped>
.margin{
  margin-bottom: 5px;
}
.title{
  border-bottom-style:none;
  border-color: lightgray;
  border-width: medium;
  padding-top: 5px;
  margin: 0px;
}
#img{ 
  display: block; 
  margin: 0px auto; 
}
#score{
  text-align: center;
  font-size: 2.0em;
  font-weight: bold;
  font-family: 'Noto Sans KR', sans-serif;
}
#center{
  text-align: center;
  font-size: 0.9em;
  font-family: 'Noto Sans KR', sans-serif;
}
#highlight{
  text-align: center;
  font-size: 1.3em;
  font-weight: bold;
  font-family: 'Noto Sans KR', sans-serif;
}
#ten{ /* safety score /10 */
  text-align: center;
  font-size: 0.8em;
  font-family: 'Noto Sans KR', sans-serif;
}
#rate{
  text-align: center;
  font-size: 0.9em;
  font-family: 'Noto Sans KR', sans-serif;
}
#b2{
  outline: 5px;
  margin-left: 17px;
  margin-top: 5px;
  margin-bottom: 5px;
}
#chart{
  font-family: 'Noto Sans KR', sans-serif;
}
hr{ /* line between top and bottom */
  color: lightgray;
  width: 99%;
  margin-left: 10px;
  border-style: solid none none none;
  height: 1px;
}
.justify-content-around {
  justify-content: space-around !important;
}
#select{
  padding-top: 10px;
}
</style>