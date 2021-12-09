<template>
  <div class="friend">
    <el-row justify="center" align="middle" style="height: 100%">
      <el-col :span="14" style="height: 100%">
        <el-card style="height: 100%" body-style="height: 100%;">
          <h3 style="text-align: center">Friend</h3>
          <el-table :data="friends" style="width: 100%" max-Height="700px">
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
            <el-table-column label="friend" align="center">
              <template #default="scope">
                <el-button
                  v-if="!this.friends.find(friend => friend.id === scope.row.id)"
                  size="mini"
                  @click="addFriend(scope.row.id, scope.row.name, scope.row.role, scope.row.current_status)"
                  type="success"
                  >
                  add
                </el-button>
                <el-button
                  v-else
                  size="mini"
                  @click="removeFriend(scope.row.id)"
                  type="danger"
                  >
                  remove
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="chat" align="center">
              <template #default="scope">
                <el-button
                  size="mini"
                  type="primary"
                  @click="$router.push({ name: 'Chat', params: { userId: scope.row.id, userName: scope.row.name, userRole: scope.row.role } })"
                  >chat</el-button
                >
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
  name: "Friend",
  computed: {
    ...mapState('user', ['id', 'friends']),
    ...mapState('online', ['users']),
  },
  methods: {
    ...mapMutations('user', ['updateFriends']),
    async removeFriend(friend_id) {
      const { success, errorMessage } = (await http.post('/users/removeFriends', {
        friend_id
      })).data;

      if (success) {
        ElNotification({
          title: "Remove friend",
          message: "Success",
          type: "success",
        });
        this.updateFriends({
          friends: this.friends.filter(friend => friend.id !== friend_id)
        });
      } else {
        ElNotification({
          title: "Remove friend",
          message: errorMessage,
          type: "error",
        });
      }
    },
  },
  async created() {
    const { success, errorMessage, friends } = (await http.get('/users/friends')).data;

    if (success) {
      this.updateFriends({
        friends
      });
    } else {
      ElNotification({
        title: "Add friend",
        message: errorMessage,
        type: "error",
      });
    }
  }
};
</script>

<style scoped>
.friend {
    height: 100%;
}
.online {
  color: green;
}
.offline {
  color: red;
}
</style>