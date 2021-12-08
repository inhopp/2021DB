<template>
  <div class="search">
    <el-row justify="center" align="middle" style="height: 100%">
      <el-col :span="10" style="height: 100%">
        <el-card style="height: 100%" body-style="height: 100%;">
          <h3 style="text-align: center"> Search Users </h3>

          <el-form align="center" ref="form" :model="form" label-width="120px">
            <el-form-item label="ID or Name">
              <el-input v-model="form.idOrName" style="width: 200px"></el-input>
              <el-button type="primary" @click="search()" >Search</el-button> 
            </el-form-item>
          </el-form>

          <el-table :data="searchs" style="width: 100%" max-Height="700px">
            <el-table-column type="index" width="50" />
            <el-table-column prop="id" label="id" />
            <el-table-column prop="name" label="name" />
            <el-table-column prop="role" label="role" />
            <el-table-column prop="current_status" label="Message" />
            <el-table-column label="friend" align="center">
              <template #default="scope">
                <el-button
                  v-if="!this.friends.find(el => el.id === scope.row.id)"
                  size="mini"
                  @click="addFriend(scope.row.id, scope.row.name)"
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
  name: "Search",
    data() {
    return {
      form: {
        idOrName: '',
      },
    };
  },
  computed: {
    ...mapState('user', ['id', 'friends', 'searchs']),
  },
  methods: {
    ...mapMutations('user', ['updateFriends']),
    ...mapMutations('user', ['updateSearchs']),

    async search() {
      const { success, errorMessage, searchs } = (await http.post('/users/idOrName', this.form)).data;
      if (success) {
        this.updateSearchs({
          searchs
        });
      } else {
        ElNotification({
          title: "Search",
          message: errorMessage,
          type: "error",
        });        
      }
    },

    async addFriend(friend_id, friend_name) {
      const { success, errorMessage } = (await http.post('/users/addFriends', {
        friend_id
      })).data;

      if (success) {
        ElNotification({
          title: "Add friend",
          message: "Success",
          type: "success",
        });
        this.updateFriends({
          friends: [...this.friends, { id: friend_id, name: friend_name }]
        });
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
.search {
  height: 100%;
}
</style>
