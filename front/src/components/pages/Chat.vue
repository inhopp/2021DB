<template>
  <div class="chat">
    <el-row
      justify="center"
      align="middle"
      style="height: 100%;">
      <el-col :span="6" style="height: 100%;">
        <el-card style="height: 100%;" :body-style="{ height: 'calc(100% - 58px)' }">
          <template #header >
            <div class="card-header">
            <el-row>
              <el-col :span="18">
                <span>role  </span>
                <span>name  </span>               
              </el-col>
              <el-col :span="6">
                <el-button
                v-if="!this.friends.find(el => el.id === $route.params.userId)"
                size="mini"
                @click="addFriend($route.params.userId)"
                type="success"
                >
                add
              </el-button>
              <el-button
                v-else
                size="mini"
                @click="removeFriend($route.params.userId)"
                type="danger"
                >
                remove
              </el-button>
              </el-col>
            </el-row>
            </div>
          </template>
          <el-scrollbar class="chat_messages" ref="scrollbar" view-style="height: 100%;">
            <div ref="inner">
              <div v-for="(chatData, index) in chatDatas" :key="index" :class="`${chatData.type} chat_line`">
                <p v-if="chatData.type === 'chat_right'" :class="`${chatData.type}_time`">{{ chatData.is_read ? '읽음' : '읽지 않음' }}, {{ new Date(chatData.created_at).toLocaleTimeString() }}</p>
                <p :class="`${chatData.type}_inner chat_inner`">
                  {{ chatData.message }}
                </p>
                <p v-if="chatData.type === 'chat_left'" :class="`${chatData.type}_time`">{{ new Date(chatData.created_at).toLocaleTimeString() }}, {{ chatData.is_read ? '읽음' : '읽지 않음' }}</p>
              </div>
            </div>
          </el-scrollbar>
          <el-row>
            <el-col
              :span="19">
              <el-input :autosize="true" v-model="chatMessage"></el-input>
            </el-col>
            <el-col
              :span="1">
            </el-col>
            <el-col
              :span="4">
              <el-button type="info" class="send_button" @click="sendMessage">send</el-button>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import http from '../../services/http';
import { ElNotification } from 'element-plus';

export default {
  name: "Chat",
  data() {
    return {
      chatDatas: [],
      chatMessage: ''
    }
  },
  computed: {
    ...mapState('user', ['id', 'friends']),
  },
  async created() {
    // 친구확인
    const { success, errorMessage, friends } = (await http.get('/users/friends')).data;
    if (success) {
      this.updateFriends({
        friends
      });
      // 대화창 입장 처리
      const { success, errorMessage } = (await http.post(`/chats/chatData/is_at_chatroom/${this.$route.params.userId}`, { goingIn: true })).data;
      if (!success) {
        ElNotification({
          title: "Going into chatroom",
          message: errorMessage,
          type: "error",
        });
      } else {
        // 이전 대화 읽음 처리
        const { success, errorMessage } = (await http.post(`/chats/chatData/read/${this.$route.params.userId}`)).data;
        if (!success) {
          ElNotification({
            title: 'read prev chat datas',
            message: errorMessage,
            type: 'error'
          });
        } else {
          // 이전 대화 내용 가져오기
          const { success, chatDatas, errorMessage } = (await http.get(`/chats/chatData/${this.$route.params.userId}`)).data;
          if (success) {
            chatDatas.forEach(chatData => {
              this.chatDatas.push({
                ...chatData,
                type: chatData.from_id === this.id ? 'chat_right' : 'chat_left',
                message: chatData.text,
                created_at: chatData.date_time,
                is_read: chatData.is_read,
                is_rendezvous: chatData.is_rendezvous,
                set_time: chatData.set_time,
                building: chatData.building,
                floor: chatData.floor,
                ssid: chatData.ssid,
                deleted: chatData.deleted
              });

              this.chatDatas.sort((a, b) => a.created_at - b.created_at);
            });
          } else {
            ElNotification({
              title: 'Get prev chat datas',
              message: errorMessage,
              type: 'error'
            });
          }
        }
      }
      
    } else {
      ElNotification({
        title: "Add friend",
        message: errorMessage,
        type: "error",
      });
    }
    
    // socket 연결
    this.sockets.subscribe('CHAT_MESSAGE', msg => {
      this.chatDatas.push({
        ...msg,
        type: 'chat_left'
      });
      
      this.chatDatas.sort((a, b) => a.created_at - b.created_at);
    });
  },
  async beforeUnmount() {
    //채팅방 나감 처리
    const { success, errorMessage } = (await http.post(`/chats/chatData/is_at_chatroom/${this.$route.params.userId}`, { goingIn:false })).data;

    if(!success) {
      ElNotification({
        title: "Getting out of chat room",
        message: errorMessage,
        type: "error",
      });
    }
    this.sockets.unsubscribe('CHAT_MESSAGE');
  },
  methods: {
    ...mapMutations('user', ['updateFriends']),
    async addFriend(friend_id) {
      const { success, errorMessage } = (await http.post('/users/addFriends', {
        friend_id
      })).data;

      if (success) {
        ElNotification({
          title: "Add friend",
          message: "Success",
          type: "success",
        });
        const { success, errorMessage, friends } = (await http.get('/users/friends')).data;
        if (success){
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
      } else {
        ElNotification({
          title: "Add friend",
          message: errorMessage,
          type: "error",
        });
      }
    },
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
    async sendMessage() {
      if (this.chatMessage.trim() !== '') {
        const { is_in_this_room } = (await http.get(`/chats/chatData/is_at_chatroom/${this.$route.params.userId}`)).data;

        const created_at = Date.now();
        this.chatDatas.push({
          message: this.chatMessage,
          type: 'chat_right',
          created_at,
          is_read: is_in_this_room
        });

        // socket 채팅 전송
        this.$socket.emit('CHAT_MESSAGE', {
          message: this.chatMessage,
          targetId: this.$route.params.userId,
          created_at: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
        })

        this.chatMessage = '';

        this.$nextTick(() => {
          this.$refs.scrollbar.setScrollTop(this.$refs.inner.clientHeight);
        });
      }
    },
  },
};
</script>

<style scoped>
p {
  display: inline
}
.chat {
  height: 100%;
}
.chat_line {
  margin: 0 0 5px 0;
  padding: 0;
}
.chat_right {
  text-align: right;
}
.chat_left {
  text-align: left;
}
.chat_right_inner {
  background: #13CA93;
  color: white;
}
.chat_left_time {
  margin-left: 3px;
  font-size: 0.8em;
}
.chat_right_time {
  margin-right: 3px;
  font-size: 0.8em;
}
.chat_inner {
  margin: 0;
  padding: 2px 10px 2px 10px;
  border-radius: 10px;
  display: inline-block;
}
.chat_left_inner {
  background: #666666;
  color: white;
}
.chat_messages {
  margin-bottom: 10px;
  height: calc(100% - 65px);
}
.chat_input {
  margin-right: 5px;
}
.send_button {
  width: 100%;
}
</style>
