<template>
  <div class="edit_info">
    <el-row justify="center" align="middle">
      <el-col :span="8">
        <el-card class="box-card">
          <div class="card-header">
            <span>내 정보 수정하기</span>
          </div>
          <br />
          <el-form ref="statusForm" :model="statusForm" label-width="120px" :rules="rules">
            <el-form-item label="상태메시지" prop="current_status">
              <el-input v-model="statusForm.current_status" type="textarea"></el-input>
              <el-button type="primary" @click="editCurrentStatus()">변경하기</el-button>
            </el-form-item>
            <!--위치 파일 업로드 프론트 임시 주석처리> -->
            <!-- <el-form-item label="현재위치" prop="location">            
                <label class="text-reader">
                  업데이트하기
                  <input type="file" @change="loadTextFromFile">
                </label> -->
            <!-- <el-upload
                class="upload-demo"
                action="https://jsonplaceholder.typicode.com/posts/"
                accept="text/csv"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :before-remove="beforeRemove"
                multiple
                :limit="3"
                :on-exceed="handleExceed"
                :file-list="fileList"
              >
                <el-button size="small" type="primary">업데이트하기</el-button>
              </el-upload> -->
            <!-- </el-form-item> -->

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
    const statusValidator = (rule, value, callback) => {
      const regex = /^.{0,20}$/; // 모든 글자 20자 이하

      if (!regex.test(value)) {
        callback(new Error("글자를 20자 이하로 입력해주세요"));
      } else {
        callback();
      }
    };
    return {
      statusForm: {
        current_status: "",
      },
      rules: {
        current_status: [{ validator: statusValidator, trigger: "blur" }],
      }
      /*
      //위치파일 형식
      location_form: {
        building: "",
        floor: "",
        ssid: "",
        longitude: "",
        latitude: "",
        ip: "",
      }
      */
    };
  },
  methods: {
    ...mapMutations("user", ["updateUserEditInfo"]),
    /*
    //위치 file 읽기?
    loadTextFromFile(ev) {
      const file = ev.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.$emit("load", e.target.result);
      reader.readAsText(file);
    },
    */
   
    editCurrentStatus() {
      this.$refs["statusForm"].validate(async (valid) => {
        if (valid) {
          const { success, errorMessage } = (
            await http.post("/users/editCurrentStatus", this.statusForm)
          ).data;
          
          const current_status = this.statusForm.current_status;

          if (success) {
            // vuex에 user 정보 저장
            this.updateUserEditInfo({
              current_status,
            });
            ElNotification({
              title: "상태메세지 수정",
              message: "상태메세지가 변경되었습니다",
              type: "success",
            });
          } else {
            ElNotification({
              title: "상태메세지 수정",
              message: errorMessage,
              type: "error",
            });
          }
        } else {
          return false;
        }
      });

      
     
      // if (success) {
      //   // vuex에 user 정보 저장
      //   this.updateUserEditInfo({
      //     current_status,
      //   });

      //   ElNotification({
      //     title: "상태메시지 수정",
      //     message: "성공하였습니다",
      //     type: "success",
      //   });
      // } else {
      //   ElNotification({
      //     title: "상태메시지 수정",
      //     message: errorMessage,
      //     type: "error",
      //   });
      // }
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
