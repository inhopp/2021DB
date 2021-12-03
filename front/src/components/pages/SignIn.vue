<template>
  <div class="sign_in">
    <el-row justify="center" align="middle">
      <el-col :span="6">
        <el-card class="box-card">
          <div class="card-header">
            <span>Sign in</span>
          </div>
          <br />
          <el-form ref="form" :model="form" label-width="120px">
            <el-form-item label="ID">
              <el-input v-model="form.id"></el-input>
            </el-form-item>
            <el-form-item label="PASSWORD">
              <el-input v-model="form.password"></el-input>
            </el-form-item>
            <el-row>
              <el-col :span="18"> </el-col>
              <el-col :span="6">
                <el-button type="primary" @click="signIn()">Sign in</el-button>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapMutations } from "vuex";
import { ElNotification } from 'element-plus';
import http from "../../services/http";

export default {
  name: "SignIn",
  data() {
    return {
      form: {
        id: "",
        password: "",
      },
    };
  },
  methods: {
    ...mapMutations("user", ["updateUser"]),
    async signIn() {
      const { success, errorMessage, id, name } = (
        await http.post("/users/signIn", this.form)
      ).data;

      if (success) {
        // vuex에 user 정보 저장
        this.updateUser({
          id,
          name,
        });

        // Home page 이동(src/router/index 참고)
        this.$router.push({
          name: "Home",
        });

        ElNotification({
          title: "로그인",
          message: "성공하였습니다",
          type: "success",
        });

        // 소켓 연결하기
        this.$socket.connect();
      } else {
        ElNotification({
          title: "로그인",
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
.sign_in {
  height: 100%;
}
.el-row {
  height: 100%;
}
</style>
