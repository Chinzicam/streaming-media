<template>
  <template v-if="route.name === 'login'">
    <router-view />
  </template>
  <template v-else>
    <div style="width: 100%; height: 100%">
      <header class="st-header">
        <div class="header-l">
          <div class="logo">
            <span class="system-title">流媒体转发终端</span>
          </div>
        </div>
        <el-popover trigger="hover" popper-class=" popover_acc" width="200px">
          <div class="acc">
            <div class="user">
              <!-- <Avatar :size="30" /> -->
              <rh-avatar :size="30" />
              <span>{{ userInfo.userName }}</span>
            </div>
          </div>
          <footer>
            <el-button type="info" plain class="logout" @click="logout"> 退出登录 </el-button>
          </footer>
          <template #reference>
            <div class="header-r">
              <rh-avatar :size="20" /><span class="user-name">{{
                userInfo.userName ? userInfo.userName : "未登录"
              }}</span>
            </div>
          </template>
        </el-popover>
      </header>
      <div class="wrap">
        <div class="main-sidebar">
          <el-menu class="main-menus" :router="true" :default-active="route.meta.path || route.path">
            <el-menu-item :index="item.path" v-for="(item, index) in menuList" :key="index">
              <i :class="['iconfont', 'icon-' + item.icon]"></i>
              <span class="m-title">{{ item.title }}</span>
            </el-menu-item>
          </el-menu>
        </div>
        <div class="no-menu-container">
          <router-view />
        </div>
      </div>
    </div>
  </template>
</template>

<script lang="ts" setup>
import { watch, ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { localStg } from "@/scripts/store";
import { ElMessage } from "element-plus";

const route = useRoute();
const router = useRouter();
const userInfo = ref<any>({});

onMounted(() => {
  const storedUserInfo = localStg.get("userInfo");
  console.log("Stored userInfo:", storedUserInfo);
  userInfo.value = storedUserInfo ? JSON.parse(storedUserInfo) : {};
});

const menuList = reactive([
  {
    ID: "dashboard",
    title: "仪表盘",
    path: "/dashboard",
    icon: "usermanage"
  },
  {
    ID: "instances",
    title: "实例管理",
    path: "/instances",
    icon: "sys"
  },
  {
    ID: "streams",
    title: "流列表",
    path: "/streams",
    icon: "usermanage"
  },
  {
    ID: "time-config",
    title: "时间配置",
    path: "/time-config",
    icon: "usermanage"
  }
]);
watch(
  () => localStg.get("userInfo"),
  (newValue) => {
    userInfo.value = newValue ? JSON.parse(newValue) : {};
  },
  { immediate: true }
);
// 退出登录
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
.popover_acc {
  .acc {
    padding-bottom: 12px;

    .user {
      display: flex;
      -webkit-box-align: center;
      align-items: center;

      > span:last-child {
        margin-left: 12px;
      }
    }
  }

  > footer {
    display: flex;

    .logout {
      margin-left: 10px;
    }

    .el-button--info {
      background-color: #f2f2f2;
      padding: 10px 18px;
      color: $text-color;
      border: 1px solid $border-color;
      margin-left: 5px;
    }
  }
}

.st-header {
  width: 100%;
  height: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: $topbar-bg;

  .header-l {
    display: flex;
    align-items: center;
    padding-left: 14px;

    .logo {
      // width: 177px;
      height: 24px;
      display: flex;
      align-items: center;

      .img-logo {
        width: 24px;
        height: 24px;
        margin-right: 10px;
      }

      .img {
        width: 125px;
        height: 17px;
      }
    }

    .icon-collapse {
      font-size: 16px;
      color: #fff;
      cursor: pointer;
    }

    .open {
      transform: rotate(0);
    }

    .close {
      transform: rotate(180deg);
    }
  }

  .header-r {
    display: flex;
    align-items: center;
    padding-right: 40px;

    .user-name {
      color: #fff;
      margin-left: 10px;
    }
  }
}

.wrap {
  display: flex;
  height: calc(100% - 48px);
  width: 100%;
  min-height: 0;
  overflow: hidden;
}

.main-sidebar {
  width: 100px;
  min-width: 100px;
  height: 100%;
  max-height: 100%;

  padding: 40px 0;
  box-sizing: border-box;
  background: $level1-bg;
  display: flex;
  justify-content: center;
  z-index: 2;
}

.no-menu-container {
  width: calc(100% - 100px);
  min-width: 0;
  min-height: 0;
  height: 100%;
  overflow: hidden;

  > :deep(*) {
    height: 100%;
    min-height: 0;
  }
}

.el-menu.main-menus {
  background: $level1-bg;
  border: none;

  .el-menu-item,
  .el-menu-item > span {
    cursor: pointer;
  }

  .el-menu-item {
    width: 60px;
    height: 60px;
    margin-bottom: $normal-size;
    font-size: $normal-size;
    padding: 0 !important;
    display: flex;
    line-height: 1;
    justify-content: center;
    flex-direction: column;
    color: $sub-text-color;
    border-radius: 2px;

    &.is-active {
      color: #fff;
      background: $primary-color;
    }

    i.iconfont {
      font-size: 18px;
    }

    .m-title {
      margin-top: 8px;
    }
  }

  .el-menu-item:not(.is-active):hover {
    color: #fff;
    // background: #629af5;
    background: rgba($color: $primary-color, $alpha: 0.5);
  }
}

@media (min-width: 1366px) and (max-width: 1600px) {
  .main-sidebar {
    width: 80px;
    min-width: 80px;
  }

  .no-menu-container {
    width: calc(100% - 80px);
  }
}

.system-title {
  font-family: "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 1px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  padding-left: 12px;
}
</style>
