import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/images/index";
import "./registerServiceWorker";
import IconSvg from "@/components/IconSvg";
import * as Icons from "@ant-design/icons-vue";

const app = createApp(App);
app.component("icon-svg", IconSvg);

// 注册图标组件
for (const i in Icons) {
  app.component(i, Icons[i]);
}

app.use(store).use(router).mount("#app");
