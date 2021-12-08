<template>
  <div class="edit_info">
    <el-row justify="center" align="middle">
      <el-col :span="8">
        <el-card class="box-card">
          <div class="card-header">
            <span>내 정보 수정하기</span>
          </div>
          <br />
          <el-form ref="form" :model="form" label-width="120px">
            <el-form-item label="상태메시지" prop="current_status">
              <el-input v-model="form.current_status" type="textarea"></el-input>
            </el-form-item>
            <!-- upload button -->
            <el-form-item>
            <el-upload
                class="upload-demo"
                action="https://jsonplaceholder.typicode.com/posts/"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :before-remove="beforeRemove"
                multiple
                :limit="3"
                :on-exceed="handleExceed"
                :file-list="fileList"
              >
                <el-button size="small" type="primary">Click to upload</el-button>
              </el-upload>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="editInfo()">변경하기</el-button>
              <el-button type="primary" @click="cancel()">취소하기</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="danger" @click="remove()">회원탈퇴</el-button>
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
      form: {
        current_status: "",
        building: "",
        floor: "",
        ssid: "",
        longitude: "",
        latitude: "",
        ip: "",
      },
    };
  },
  methods: {
    ...mapMutations("user", ["updateUserEditInfo"]),
    loadTextFromFile(ev) {
      const file = ev.target.files[0];
      const reader = new FileReader();
      reader.onload = e => this.$emit("load", e.target.result);
      reader.readAsText(file);
    },
    async editInfo() {
      const { success, errorMessage } = (await http.post("/users/edit", this.form)).data;

      const current_status = this.form.current_status;
      const building = this.form.building;
      const floor = this.form.floor;
      const ssid = this.form.ssid;
      const longitude = this.form.longitude;
      const latitude = this.form.latitude;
      const ip = this.form.ip;

      if (success) {
        // vuex에 user 정보 저장
        this.updateUserEditInfo({
          current_status,
          building,
          floor,
          ssid,
          longitude,
          latitude,
          ip,
        });

        // Home page 이동(src/router/index 참고)
        this.$router.push({
          name: "Home",
        });

        ElNotification({
          title: "정보수정",
          message: "성공하였습니다",
          type: "success",
        });
      } else {
        ElNotification({
          title: "정보수정",
          message: errorMessage,
          type: "error",
        });
      }
    },
    cancel() {
      this.$router.push({
        name: 'Home'
      });
    },
    async remove() {
      const { success, errorMessage } = (await http.post("/users/deleteAccount", this.form.current_status)).data;
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
