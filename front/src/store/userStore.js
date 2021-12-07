export default {
  namespaced: true,
  state: {
    id: '',
    name: '',
    current_status: '',
    location: '',
    role: '',
    friends: []
  },
  mutations: {
    //sign_in
    updateUser(state, { id, name, current_status, location, role }) {
      state.id = id;
      state.name = name;
      state.current_status = current_status;
      state.location = location;
      state.role = role;
    },

    //edit_info
    updateUser1(state, { current_status, location }) {
      state.current_status = current_status;
      state.location = location;
    },
    
    updateFriends(state, { friends }) {
      state.friends = [...friends];
    },
  },
};
