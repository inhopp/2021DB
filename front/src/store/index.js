import { createStore } from 'vuex';
import user from './userStore';
import online from './onlineStore';

export default createStore({
  modules: {
    user,
    online
  }
})
