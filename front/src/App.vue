<template>
  <el-container>
    <el-header>
      <app-header></app-header>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
    <el-footer>
      <app-footer></app-footer>
    </el-footer>
  </el-container>
</template>

<script>
import AppHeader from "./components/layouts/AppHeader";
import AppFooter from "./components/layouts/AppFooter";
import { mapMutations, mapState } from "vuex";
import http from "./services/http";

export default {
  name: "app",
  components: {
    AppHeader,
    AppFooter,
  },
  methods: {
    ...mapMutations("online", ["updateOnlineUsers"]),
    ...mapMutations("user", ["updateUser"]),
  },
  computed: {
    ...mapState('user', ['id'])
  },
  async created() {
    const { success, id, name } = (await http.get("/users/whoAmI")).data;

    this.sockets.subscribe("UPDATE_ONLINE_USERS", (data) => {
      this.updateOnlineUsers({
        users: data.filter((people) => people.id !== this.id),
      });
    });

    if (success) {
      this.updateUser({
        id,
        name,
      });

      this.$socket.connect();
    }
  },
  beforeUnmount() {
    this.sockets.unsubscribe('UPDATE_ONLINE_USERS');
  },
};
</script>

<style>
body {
  margin: 0;
}
html {
  box-sizing: border-box;
}
*,
*:before,
*:after {
  box-sizing: inherit;
}
.el-header {
  text-align: center;
  line-height: 60px;
  border-bottom: 1px solid black;
}
.el-main {
  height: calc(100vh - 120px);
}
.el-footer {
  text-align: center;
  line-height: 60px;
  border-top: 1px solid black;
}
</style>
