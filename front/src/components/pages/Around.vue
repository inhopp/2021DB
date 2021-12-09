<template>
  <div class="around">
    <el-row justify="center" align="middle" style="height: 100%">
      <el-col :span="10" style="height: 100%">
        <el-card style="height: 100%" body-style="height: 100%;">
          <h3 style="text-align: center"> Around </h3>

          <el-table :data="arounds" style="width: 100%" max-Height="700px">
            <el-table-column type="index" width="50" />
            <el-table-column prop="building" label="Building" />
            <el-table-column prop="floor" label="Floor" />
            <el-table-column prop="ssid" label="SSID" />
            <el-table-column label="More" align="center">
                <template #default="scope">
                <el-button type="primary" @click="move(scope.row.building, scope.row.floor, scope.row.ssid)"> Move </el-button>
                </template>
            </el-table-column>
          </el-table>
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
  name: "Around",
  computed: {
    ...mapState('user', ['id', 'arounds']),
  },
  methods: {
    ...mapMutations('user', ['updateArounds', 'updateAroundsub']),
    move(building, floor, ssid) {
        this.updateAroundsub({
            building,
            floor,
            ssid
        }),

        this.$router.push({
          name: "Around_sub"
        });
    }
  },
  async created() {
    const { success, errorMessage, arounds } = (await http.get('/users/arounds')).data;

    if (success) {
      this.updateArounds({
        arounds
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
.around {
  height: 100%;
}
</style>
