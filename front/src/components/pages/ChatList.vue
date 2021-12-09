<template>
  <div class="chatList">
    <el-row justify="center" align="middle" style="height: 100%">
      <el-col :span="10" style="height: 100%">
        <el-card style="height: 100%" body-style="height: 100%;">
          <h3 style="text-align: center">Chat List</h3>
          <el-table
            :data="chatList"
            style="width: 100%"
            max-Height="700px"
            cell-class-name="nowrap"
          >
            <el-table-column type="index" width="50" />
            <el-table-column prop="id" label="id" width="100" />
            <el-table-column prop="name" label="name" width="100" />
            <el-table-column prop="role" label="role" width="100" />
            <el-table-column prop="message" label="message" width="100">
              <template #default="scope">
								<span style="white-space: nowrap;">
									{{ scope.row.message }}
								</span>
							</template>
            </el-table-column>
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
                  @click="
                    $router.push({ name: 'Chat', params: { userId: scope.row.id, userName: scope.row.name, userRole: scope.row.role } })
                  "
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
import { ElNotification } from "element-plus";
import http from "../../services/http";

export default {
  name: "ChatList",
  computed: {
    ...mapState('user', ['id', 'friends']),
    ...mapState('online', ['users']),
  },
  ...mapMutations('user', ['updateFriends']),
  async created() {
    const { success, errorMessage, chatList } = (await http.get("/chats/list")).data;

    this.sockets.subscribe("CHAT_MESSAGE", (msg) => {
      const { message, from_id, from_name, created_at } = msg;

      const target = this.chatList.find((chat) => chat.id === from_id);

      if (target) {
        target.message = message;
        target.created_at = created_at;
      } else {
        this.chatList.push({
          id: from_id,
          name: from_name,
          message: message,
          created_at: created_at,
        });
      }

      this.chatList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    });

    if (success) {
      this.chatList = chatList.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    } else {
      ElNotification({
        title: "Get chatlist error",
        message: errorMessage,
        type: "error",
      });
    }
  },
  beforeUnmount() {
    this.sockets.unsubscribe("CHAT_MESSAGE");
  },
  data() {
    return {
      chatList: [],
    };
  },
};
</script>

<style scoped>
.chatList {
  height: 100%;
}
.online {
  color: green;
}
.offline {
  color: red;
}
</style>
