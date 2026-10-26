<template>
  <div class="ava-container">
    <el-image class="the-avatar" :src="src" :fit="fit" :style="{ width: size + 'px', height: size + 'px' }">
      <template #error>
        <div v-if="name" class="name" :style="{ fontSize: fontSize + 'px' }">{{ name }}</div>
        <img v-else class="default-img" :src="defaultImg" />
      </template>
    </el-image>
    <slot name="Badge" />
  </div>
</template>

<script lang="ts" setup>
defineProps({
  src: String,
  size: {
    type: Number,
    default: 60
  },
  // 没有图片的时候使用默认名字
  name: {
    type: String
  },
  fontSize: {
    type: Number,
    default: 14
  },
  // 头像中图片的填充方式
  fit: {
    type: String,
    default: "cover"
  }
});
const defaultImg = require("@/components/Avatar/default_avatar.png");
</script>

<style lang="scss" scoped>
.ava-container {
  position: relative;
  .the-avatar {
    position: relative;
    border-radius: 50%;

    .name {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #fff;
      background-color: $primary-color;
    }

    .default-img {
      width: 100%;
      object-fit: fill;
      background-color: #fefefe;
    }
  }
}
</style>
