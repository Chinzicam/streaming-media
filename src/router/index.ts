import { createRouter, createWebHistory, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { localStg } from "@/scripts/store";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/login"
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/login.vue"),
    meta: { public: true }
  },
  {
    path: "/dashboard",
    name: "dashboard",
    meta: { path: "/dashboard" },
    component: () => import("@/views/dashboard.vue")
  },
  {
    path: "/instances",
    name: "instances",
    meta: { path: "/instances" },
    component: () => import("@/views/instances.vue")
  },
  {
    path: "/streams",
    name: "streams",
    meta: { path: "/streams" },
    component: () => import("@/views/streams.vue")
  },
  {
    path: "/time-config",
    name: "time-config",
    meta: { path: "/time-config" },
    component: () => import("@/views/time-config.vue")
  }
];

const isOfflineDemo = process.env.VUE_APP_OFFLINE_DEMO === "true";

const router = createRouter({
  history: isOfflineDemo ? createWebHashHistory() : createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach((to) => {
  const isAuthenticated = Boolean(localStg.get("userInfo"));
  if (to.name !== "login" && !isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }
  if (to.name === "login" && isAuthenticated) {
    return { name: "dashboard" };
  }
  return true;
});

export default router;
