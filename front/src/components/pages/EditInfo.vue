<template>
  <div class="edit_info">
    <el-row justify="center" align="middle">
      <el-col :span="8">
        <el-card class="box-card">
          <div class="card-header">
            <span>내 정보 수정하기</span>
          </div>
          <br />
          <el-form ref="status_form" :model="status_form" label-width="120px">
            <el-form-item label="상태메시지" prop="current_status">
              <el-input v-model="status_form.current_status" type="textarea"></el-input>
              <el-button type="primary" @click="editCurrentStatus()">변경하기</el-button>
            </el-form-item>
            <!--위치 파일 업로드 프론트 임시 주석처리> -->
            <el-form-item label="현재위치" prop="location">
            <label class="text-reader">
                  <input type="file" id="file" refs="myFile" @change="loadTextFromFile">
                  <div style = " font-size:1em;">{{location_form.content}}</div>
                </label>
            <el-button type="primary" @click="updateLocation()">업로드</el-button>
            </el-form-item>

            <el-form-item label="회원탈퇴">
              <el-button type="danger" @click="remove()">회원탈퇴</el-button>
            </el-form-item>
             <el-form-item>
              <el-button type="primary" @click="cancel()">돌아가기</el-button>
            </el-form-item>

          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapMutations } from "vuex";
import http from "../../services/http";
import { ElNotification } from 'element-plus';

export default {
  name: "EditInfo",
  data() {
    return {
      status_form: {
        current_status: "",
      },
      location_form: {
        content: null,
        building: null,
        longitude: null,
        latitude: null,
        floor: null,
        SSID: null,
        IP: null
      },
    };
  },
  // "위도 경도 건물 층수 SSID IP

  methods: {
    ...mapMutations("user", ["updateUserEditInfo"]),
    async loadTextFromFile(ev) {
      const file = ev.target.files[0];
      const reader = new FileReader();
      reader.onload = e => {
        this.location_form.content = e.target.result;
        try{
          for(var i=0; i<6; i++){
            if (this.location_form.content.split('\n')[i].split(',')[0] == "위도"){
              this.location_form.latitude = this.location_form.content.split('\n')[i].split(',')[1];
            } else if (this.location_form.content.split('\n')[i].split(',')[0] == "경도"){
              this.location_form.longitude = this.location_form.content.split('\n')[i].split(',')[1];
            } else if (this.location_form.content.split('\n')[i].split(',')[0] == "건물"){
              this.location_form.building = this.location_form.content.split('\n')[i].split(',')[1];
            } else if (this.location_form.content.split('\n')[i].split(',')[0] == "층수"){
              this.location_form.floor = this.location_form.content.split('\n')[i].split(',')[1];
            } else if (this.location_form.content.split('\n')[i].split(',')[0] == "SSID"){
              this.location_form.SSID = this.location_form.content.split('\n')[i].split(',')[1];
            } else if (this.location_form.content.split('\n')[i].split(',')[0] == "IP"){
              this.location_form.IP = this.location_form.content.split('\n')[i].split(',')[1];
            } else{
              throw new Error("NO");
            }
          }
        } catch (e) {
          ElNotification({
            title: "CSV 업로드",
            message: "파일 형식이 잘못됐습니다",
            type: "error",
          });
        }
      }
      reader.readAsText(file, "euc-kr");
    },

    async updateLocation() {
      const { success } = (await http.post("/users/updateLocation", this.location_form)).data;
      if (success) {
        ElNotification({
          title: "CSV 업로드",
          message: "성공적으로 업로드 되었습니다.",
          type: "success",
        });
      }
    },
    async editCurrentStatus() {
      const { success, errorMessage } = (await http.post("/users/editCurrentStatus", this.status_form)).data;

      const current_status = this.status_form.current_status;
     
      if (success) {
        // vuex에 user 정보 저장
        this.updateUserEditInfo({
          current_status,
        });

        ElNotification({
          title: "상태메시지 수정",
          message: "성공하였습니다",
          type: "success",
        });
      } else {
        ElNotification({
          title: "상태메시지 수정",
          message: errorMessage,
          type: "error",
        });
      }
    },
    //
    //위치 수정하기
    //
    /*
    async updateLocation() {
      const { success, errorMessage } = (await http.post("/users/updateLocation", this.location_form)).data;

      if (success) {
        // vuex에 user 정보 저장
        this.updateUserEditInfo({
          building,
          floor,
          ssid,
          longitude,
          latitude,
          ip,
        });

        ElNotification({
          title: "위치 수정",
          message: "성공하였습니다",
          type: "success",
        });
      } else {
        ElNotification({
          title: "위치 수정",
          message: errorMessage,
          type: "error",
        });
      }
    },
    */

    cancel() {
      this.$router.push({
        name: 'Home'
      });
    },
    async remove() {
      const { success, errorMessage } = (await http.post("/users/deleteAccount")).data;
        if (success) {
        this.$router.push({
          name: "Home",
        });

        ElNotification({
          title: "회원탈퇴",
          message: "성공하였습니다",
          type: "success",
        });
      } else {
        ElNotification({
          title: "회원탈퇴",
          message: errorMessage,
          type: "error",
        });
      }
    },
  },
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.edit_info {
  height: 100%;
}
.el-row {
  height: 100%;
}
</style>
