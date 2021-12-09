<template>
  <div class="friend">
    <el-row justify="center" align="middle" style="height: 100%">
      <el-col :span="14" style="height: 100%">
        <el-card style="height: 100%" body-style="height: 100%;">
          <h3 style="text-align: center"> {{ `${select_building}`-`${select_floor}`-`${select_ssid}`}} </h3>
          <el-table :data="aroundsub" style="width: 100%" max-Height="700px">
            <el-table-column type="index" width="50" />
            <el-table-column prop="id" label="id" />
            <el-table-column prop="name" label="name" />
            <el-table-column prop="role" label="role" />
            <el-table-column prop="current_status" label="status" />
            <el-table-column label="online" align="center">
                <template #default="scope">
                    <span v-if="users.find(user => user.id === scope.row.id)" class="online"> Online </span>
                    <span v-else class="offline"> Offline </span>
                </template>
            </el-table-column>
            <el-table-column label="chat" align="center">
              <template #default="scope">
                <el-button
                  size="mini"
                  type="primary"
                  @click="$router.push({ name: 'Chat', params: { userId: scope.row.id } })"
                  >chat</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <el-row>
            <el-col :span="16"> </el-col>
            <el-col :span="8">
            <el-button style="margin-top: 20px" type="info" @click="$router.push({ name: 'Around' })" 
            :icon="ArrowLeft">Previous Page</el-button>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState, mapMutations } from "vuex";
import { ElNotification } from 'element-plus';
import http from '../../services/http';

export default {
  name: "Around_sub",
  computed: {
    ...mapState('user', ['id', 'select_building', 'select_floor', 'select_ssid', 'aroundsub']),
    ...mapState('online', ['users']),
  },
  methods: {
    ...mapMutations('user', ['updateAroundsub']),
  },
  async created() {
    const { success, errorMessage, aroundsub } = (await http.get('/users/aroundsub', this.select_ssid)).data;

    if (success) {
      this.updateAroundsub({
        aroundsub
      });
    } else {
      ElNotification({
        title: "Around users",
        message: errorMessage,
        type: "error",
      });
    }
  }
};
</script>

<style scoped>
.around_sub {
  height: 100%;
}
</style>
