export default {
  namespaced: true,
  state: {
    id: '',
    name: '',
    active: '',
    current_status: '',
    role: '',
    building: '',
    floor: '',
    ssid: '',
    longitude: '',
    latitude: '',
    ip: '',
    friends: []
  },
  mutations: {
    //sign_in
    updateUser(state, { id, name, active, current_status, role, building, floor, ssid, longitude, latitude, ip}) {
      state.id = id;
      state.name = name;
      state.active = active;
      state.current_status = current_status;
      state.role = role;
      state.building = building;
      state.floor = floor;
      state.ssid = ssid;
      state.longitude = longitude;
      state.latitude = latitude;
      state.ip = ip;
    },

    //edit_info
    updateUserEditInfo(state, { current_status, building, floor, ssid, longitude, latitude, ip }) {
      state.current_status = current_status;
      state.building = building;
      state.floor = floor;
      state.ssid = ssid;
      state.longitude = longitude;
      state.latitude = latitude;
      state.ip = ip;
    },
    
    updateFriends(state, { friends }) {
      state.friends = [...friends];
    },
  },
};
