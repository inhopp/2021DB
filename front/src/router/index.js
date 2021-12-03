import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/pages/Home';
import SignIn from '../components/pages/SignIn';
import SignUp from '../components/pages/SignUp';
import Chat from '../components/pages/Chat';
import Online from '../components/pages/Online';
import Friend from '../components/pages/Friend';
import ChatList from '../components/pages/ChatList';
import http from '../services/http';
import { ElNotification } from 'element-plus';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/signin',
    name: 'SignIn',
    component: SignIn,
  },
  {
    path: '/signup',
    name: 'SignUp',
    component: SignUp
  },
  {
    path: '/chat/:userId',
    name: 'Chat',
    component: Chat,
    meta: { authRequired: true }
  },
  {
    path: '/online',
    name: 'Online',
    component: Online,
    meta: { authRequired: true }
  },
  {
    path: '/friend',
    name: 'Friend',
    component: Friend,
    meta: { authRequired: true }
  },
  {
    path: '/chatList',
    name: 'ChatList',
    component: ChatList,
    meta: { authRequired: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach(async function (to, from, next) {
  if (to.matched.some(function (routeInfo) {
    return routeInfo.meta.authRequired;
  })) {
    const { success } = (await http.get('/users/whoAmI')).data;
    
    if (success) {
      next();
    } else {
      ElNotification({
        title: 'Authentication is required',
        message: 'Authentication is required',
        type: 'warning',
      })
      next('/signin');
    }
  } else {
    next();
  }
});

export default router
