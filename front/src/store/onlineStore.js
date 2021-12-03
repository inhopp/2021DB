export default {
	namespaced: true,
	state: {
		users: [],
	},
	mutations: {
		updateOnlineUsers(state, { users }) {
			state.users = users;
		},
	},
};
