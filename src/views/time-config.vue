<template>
  <main class="time-config-page">
    <section class="time-settings">
      <header class="panel-header">时间设置</header>
      <div class="settings-body">
        <div class="form-row current-time-row">
          <span class="field-label">当前时间</span>
          <time>{{ currentTime }}</time>
        </div>
        <div class="form-row mode-row">
          <span class="field-label">校时模式</span>
          <el-radio-group v-model="mode">
            <el-radio value="ntp">NTP</el-radio>
            <el-radio value="manual">手动校时</el-radio>
          </el-radio-group>
        </div>
        <div class="form-row set-time-row">
          <label class="field-label" for="set-time">设置时间</label>
          <el-date-picker
            id="set-time"
            v-model="configuredTime"
            type="datetime"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="选择日期时间"
            :disabled="mode === 'ntp'"
          />
          <el-button type="primary" @click="syncComputerTime">同步计算机时间</el-button>
        </div>
      </div>
    </section>
    <div class="page-actions">
      <el-button type="primary" @click="saveConfiguration">保存配置</el-button>
      <el-button type="primary" @click="syncToNodes">时间同步至节点</el-button>
    </div>
  </main>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { ElMessage } from "element-plus";

type TimeMode = "ntp" | "manual";
const mode = ref<TimeMode>("manual");
const configuredTime = ref(formatDate(new Date()));
const currentTime = ref(formatDate(new Date()));
let clockTimer: number | undefined;

function formatDate(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}:${pad(date.getSeconds())}`;
}
function syncComputerTime() {
  configuredTime.value = formatDate(new Date());
  ElMessage.success("已同步本机时间");
}
function saveConfiguration() {
  if (mode.value === "manual" && !configuredTime.value) {
    ElMessage.warning("请选择设置时间");
    return;
  }
  ElMessage.success("时间配置已保存");
}
function syncToNodes() {
  ElMessage.success(`已向节点同步${mode.value === "ntp" ? "NTP" : configuredTime.value}时间`);
}
onMounted(() => {
  clockTimer = window.setInterval(() => {
    currentTime.value = formatDate(new Date());
  }, 1000);
});
onBeforeUnmount(() => {
  if (clockTimer !== undefined) window.clearInterval(clockTimer);
});
</script>

<style lang="scss" scoped>
.time-config-page {
  min-height: 100%;
  padding: 6px;
  box-sizing: border-box;
  background: #edf2f7;
  color: #344358;
}
.time-settings {
  background: #fff;
  border-radius: 4px;
  height: 100%;
}
.panel-header {
  height: 58px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #e5e8ed;
  font-size: 14px;
  font-weight: 500;
}
.settings-body {
  padding: 16px 20px 20px;
}
.form-row {
  display: flex;
  align-items: center;
  min-height: 44px;
  gap: 12px;
}
.form-row + .form-row {
  margin-top: 8px;
}
.field-label {
  width: 56px;
  flex: 0 0 56px;
  color: #344358;
}
.current-time-row time {
  color: #344358;
  font-variant-numeric: tabular-nums;
}
.mode-row :deep(.el-radio) {
  margin-right: 24px;
}
.mode-row :deep(.el-radio__label) {
  color: #344358;
}
.mode-row :deep(.el-radio.is-checked .el-radio__label) {
  color: #3976f6;
}
.set-time-row :deep(.el-date-editor) {
  width: 294px;
}
.set-time-row .el-button {
  height: 36px;
}
.page-actions {
  display: flex;
  gap: 12px;
  padding: 20px;
}
.page-actions .el-button {
  height: 36px;
  padding: 0 18px;
}
@media (max-width: 640px) {
  .settings-body {
    padding: 14px 12px 18px;
  }
  .form-row {
    flex-wrap: wrap;
    gap: 8px;
  }
  .set-time-row :deep(.el-date-editor) {
    width: min(294px, 100%);
  }
  .page-actions {
    padding: 16px 12px;
    flex-wrap: wrap;
  }
}
</style>
