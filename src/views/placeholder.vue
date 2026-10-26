<template>
  <section class="placeholder-page">
    <h1>{{ title }}</h1>
  </section>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const titles: Record<string, string> = {
  dashboard: "仪表盘",
  instances: "实例管理",
  streams: "流列表",
  "time-config": "时间配置"
};
const title = computed(() => titles[String(route.name)] || "");
</script>

<style lang="scss" scoped>
.placeholder-page {
  min-height: 100%;
  padding: 24px;
  box-sizing: border-box;
  background: #fff;

  h1 {
    margin: 0;
    color: $main-text-color;
    font-size: 20px;
    font-weight: 500;
  }
}
</style>
