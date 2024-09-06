<template>
  <a-config-provider :locale="locale">
    <router-view />
  </a-config-provider>
</template>

<script>
import { ConfigProvider } from "ant-design-vue";
import zhCN from "ant-design-vue/es/locale/zh_CN";
import { ref, reactive } from "vue";
export default {
  name: "App",
  components: {
    AConfigProvider: ConfigProvider,
  },
  setup() {
    let locale = ref(zhCN);

    return {
      locale,
    };
  },
};
</script>

<style lang="less">
@import "./assets/theme/index.less";
</style>
