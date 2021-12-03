export default {
  namespaced: true,
  state: {
    id: '',
    name: '',
    friends: []
  },
  mutations: {
    updateUser(state, { id, name }) {
      state.id = id;
      state.name = name;
    },
    updateFriends(state, { friends }) {
      state.friends = [...friends];
    },
  },
};
