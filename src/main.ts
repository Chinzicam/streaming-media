import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import "@/assets/icon/iconfont.css";
import "@/assets/icon/iconfont.js";
import "@/assets/styles/index.scss";
import Avatar from "@/components/Avatar/index.vue";
// 修改分页器默认文字
zhCn.el.pagination.goto = "跳至";
const app = createApp(App);
// 注册所有element的icon图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}
app.component("rh-avatar", Avatar);
app.config.errorHandler = (err, vm, info) => {
  console.log("[全局异常]", err, vm, info);
};

app
  .use(router as any)
  .use(ElementPlus as any, { locale: zhCn })
  .mount("#app");
