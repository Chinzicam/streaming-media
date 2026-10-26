<template>
  <router-view v-if="route.name === 'login'" />
  <div v-else class="application-shell">
    <aside class="main-sidebar">
      <div class="brand">
        <div class="brand-mark">VF</div>
        <div class="brand-copy">
          <span class="brand-kicker">STREAMING MEDIA</span>
          <strong>视频流媒体<br />数据转发终端</strong>
        </div>
      </div>
      <div class="nav-caption">工作空间</div>
      <el-menu class="main-menus" :router="true" :default-active="route.meta.path || route.path">
        <el-menu-item :index="item.path" v-for="item in menuList" :key="item.ID">
          <i :class="['iconfont', 'icon-' + item.icon]"></i>
          <span class="m-title">{{ item.title }}</span>
          <span v-if="route.path === item.path" class="active-marker"></span>
        </el-menu-item>
      </el-menu>
      <div class="sidebar-foot"><span class="status-dot"></span>转发服务控制台</div>
    </aside>
    <section class="workspace">
      <header class="st-header">
        <div class="page-heading">
          <span class="page-eyebrow">CONTROL CENTER</span>
          <strong>{{ currentPageTitle }}</strong>
        </div>
        <div class="header-tools">
          <span class="system-status"><i></i>系统运行中</span>
          <span class="header-divider"></span>
          <el-popover trigger="hover" popper-class="popover_acc" width="200px">
            <div class="acc">
              <div class="user">
                <rh-avatar :size="30" />
                <span>{{ userInfo.userName }}</span>
              </div>
            </div>
            <footer>
              <el-button type="info" plain class="logout" @click="logout">退出登录</el-button>
            </footer>
            <template #reference>
              <div class="header-r">
                <rh-avatar :size="30" />
                <span class="user-name">{{ userInfo.userName || "未登录" }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
            </template>
          </el-popover>
        </div>
      </header>
      <main class="no-menu-container"><router-view /></main>
    </section>
  </div>
</template>

<script lang="ts" setup>
import { watch, ref, reactive, onMounted, onBeforeUnmount, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { localStg } from "@/scripts/store";
import { ElMessage } from "element-plus";

const route = useRoute();
const router = useRouter();
const userInfo = ref<any>({});
const menuList = reactive([
  { ID: "dashboard", title: "仪表盘", path: "/dashboard", icon: "usermanage" },
  { ID: "instances", title: "实例管理", path: "/instances", icon: "sys" },
  { ID: "streams", title: "流列表", path: "/streams", icon: "usermanage" },
  { ID: "time-config", title: "时间配置", path: "/time-config", icon: "usermanage" }
]);
const currentPageTitle = computed(() => menuList.find((item) => item.path === route.path)?.title ?? "控制台");

onMounted(() => {
  const storedUserInfo = localStg.get("userInfo");
  userInfo.value = storedUserInfo ? JSON.parse(storedUserInfo) : {};
});

watch(
  () => localStg.get("userInfo"),
  (newValue) => {
    userInfo.value = newValue ? JSON.parse(newValue) : {};
  },
  { immediate: true }
);

const logout = () => {
  localStg.remove("userInfo");
  router.push("/login");
  ElMessage.success("已退出登录");
};

onBeforeUnmount(() => {
  delete sessionStorage.joinArr;
  delete sessionStorage.quitArr;
  delete sessionStorage.sendArr;
});
</script>

<style lang="scss">
.application-shell {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #f5f3f0;
}

.main-sidebar {
  position: relative;
  z-index: 2;
  display: flex;
  flex: 0 0 212px;
  flex-direction: column;
  width: 212px;
  height: 100%;
  padding: 30px 18px 20px;
  color: #f8f4ee;
  background: #252724;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 2px 28px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.11);
}

.brand-mark {
  display: grid;
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 12px 12px 12px 4px;
  color: #fff;
  background: #e87924;
  font-size: 17px;
  font-weight: 800;
}

.brand-copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;

  strong {
    font-size: 14px;
    line-height: 1.5;
  }
}

.brand-kicker,
.page-eyebrow {
  color: #e8a16c;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1.2px;
}

.nav-caption {
  padding: 28px 12px 10px;
  color: #90918d;
  font-size: 11px;
}

.el-menu.main-menus {
  width: 100%;
  border: 0;
  background: transparent;

  .el-menu-item {
    position: relative;
    height: 46px;
    margin: 4px 0;
    padding: 0 12px !important;
    border-radius: 6px;
    color: #c3c4bf;
    font-size: 13px;
    gap: 12px;

    i.iconfont {
      width: 18px;
      color: #a5a59f;
      font-size: 17px;
      text-align: center;
    }

    &:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.07);
    }

    &.is-active {
      color: #fff;
      background: rgba(232, 121, 36, 0.2);

      i.iconfont {
        color: #f49a54;
      }
    }
  }

  .m-title {
    flex: 1;
  }

  .active-marker {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #f49a54;
  }
}

.sidebar-foot {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: auto;
  padding: 15px 10px 2px;
  border-top: 1px solid rgba(255, 255, 255, 0.11);
  color: #a9aaa5;
  font-size: 11px;
}

.status-dot,
.system-status i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #66bd7a;
  box-shadow: 0 0 0 3px rgba(102, 189, 122, 0.13);
}

.workspace {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: calc(100% - 252px);
  min-width: 0;
  min-height: 0;
}

.st-header {
  display: flex;
  flex: 0 0 78px;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  padding: 0 32px;
  border-bottom: 1px solid #e9e5e0;
  background: #fff;
}

.page-heading {
  display: flex;
  flex-direction: column;
  gap: 5px;

  .page-eyebrow {
    color: #aa9e92;
    font-size: 9px;
  }

  strong {
    color: #282925;
    font-size: 18px;
  }
}

.header-tools,
.header-r,
.system-status {
  display: flex;
  align-items: center;
}

.header-tools {
  gap: 20px;
}

.system-status {
  gap: 9px;
  color: #686b64;
  font-size: 12px;
}

.header-divider {
  width: 1px;
  height: 28px;
  background: #e9e5e0;
}

.header-r {
  gap: 10px;
  cursor: pointer;

  .user-name {
    color: #494a45;
    font-size: 13px;
  }

  .el-icon {
    color: #92928c;
  }
}

.no-menu-container {
  width: 100%;
  min-width: 0;
  min-height: 0;
  height: calc(100% - 78px);
  overflow: hidden;

  > :deep(*) {
    height: 100%;
    min-height: 0;
  }
}

.popover_acc {
  .acc {
    padding-bottom: 12px;

    .user {
      display: flex;
      align-items: center;

      > span:last-child {
        margin-left: 12px;
      }
    }
  }

  > footer {
    display: flex;

    .logout {
      margin-left: 5px;
      border: 1px solid $border-color;
      background-color: #f2f2f2;
      color: $text-color;
    }
  }
}

@media (max-width: 760px) {
  .main-sidebar {
    flex-basis: 68px;
    width: 68px;
    align-items: center;
    padding: 18px 6px;
  }

  .brand {
    padding: 0 0 20px;
    border: 0;
  }

  .brand-copy,
  .nav-caption,
  .m-title,
  .active-marker,
  .sidebar-foot {
    display: none;
  }

  .el-menu.main-menus .el-menu-item {
    justify-content: center;
    padding: 0 !important;
  }

  .workspace {
    width: calc(100% - 68px);
  }

  .st-header {
    flex-basis: 68px;
    padding: 0 14px;
  }

  .header-tools {
    gap: 10px;
  }

  .system-status,
  .header-divider,
  .header-r .user-name {
    display: none;
  }

  .no-menu-container {
    height: calc(100% - 68px);
  }
}
</style>
