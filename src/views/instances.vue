<template>
  <main class="instances-page">
    <section class="instance-workspace">
      <div class="toolbar">
        <el-button type="primary" class="refresh-button" @click="refreshList">
          <span class="refresh-icon">⟳</span>刷新
        </el-button>
        <el-input v-model="keyword" class="search-input" placeholder="请输入关键字" clearable>
          <template #suffix><span class="search-icon">⌕</span></template>
        </el-input>
      </div>

      <div class="table-scroll">
        <table class="instance-table">
          <thead>
            <tr>
              <th class="name-column sortable" @click="sortBy('name')">
                名称 <span>{{ sortIcon("name") }}</span>
              </th>
              <th class="master-column sortable" @click="sortBy('master')">
                归属主服务 <span>{{ sortIcon("master") }}</span>
              </th>
              <th class="ip-column">IP地址</th>
              <th class="network-column">网卡状态</th>
              <th class="disk-column sortable" @click="sortBy('disk')">
                硬盘使用率 <span>{{ sortIcon("disk") }}</span>
              </th>
              <th class="memory-column sortable" @click="sortBy('memory')">
                内存使用率 <span>{{ sortIcon("memory") }}</span>
              </th>
              <th class="cpu-column sortable" @click="sortBy('cpu')">
                CPU使用率 <span>{{ sortIcon("cpu") }}</span>
              </th>
              <th class="status-column sortable" @click="sortBy('online')">
                状态 <span>{{ sortIcon("online") }}</span>
              </th>
              <th class="actions-column">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="instance in pageRows" :key="instance.id">
              <td class="name-cell">
                <div class="instance-name">
                  {{ instance.name }} <span v-if="instance.isMaster" class="master-badge">主服务</span>
                </div>
                <small>CPUID: {{ instance.cpuId }}</small>
              </td>
              <td>{{ instance.master }}</td>
              <td class="ip-cell">
                <span>LIP: {{ instance.lip }}</span
                ><span>RIP: {{ instance.rip }}</span
                ><span>VIP: {{ instance.vip || "-" }}</span>
              </td>
              <td class="network-cell">
                <span>已连接({{ instance.linkSpeed }})</span>
                <small
                  ><b>↑ {{ instance.upload }}</b
                  ><b>↓ {{ instance.download }}</b></small
                >
              </td>
              <td class="usage-cell">
                <div class="usage-track"><i :style="{ width: `${instance.disk}%` }"></i></div>
                <span v-if="instance.diskRoot">外挂：{{ instance.diskExternal }}GB({{ instance.disk }}%)</span>
                <span>根：{{ instance.diskRoot }}GB({{ instance.diskRootPercent }}%)</span>
              </td>
              <td class="usage-cell">
                <div class="usage-track"><i :style="{ width: `${instance.memory}%` }"></i></div>
                <span>{{ instance.memoryUsed }}GB({{ instance.memory }}%)</span>
              </td>
              <td class="usage-cell">
                <div class="usage-track"><i :style="{ width: `${instance.cpu}%` }"></i></div>
                <span>{{ instance.cpu }}%</span>
              </td>
              <td>
                <span :class="['status-badge', instance.online ? 'online' : 'offline']">{{
                  instance.online ? "在线" : "离线"
                }}</span>
              </td>
              <td class="actions-cell">
                <button type="button" @click="showDetails(instance)">详情</button><i></i>
                <button type="button" @click="restartInstance(instance)">重启</button><i></i>
                <button type="button" @click="renameInstance(instance)">重命名</button><i></i>
                <button :class="{ danger: instance.online }" type="button" @click="toggleInstance(instance)">
                  {{ instance.online ? "停用" : "启用" }}
                </button>
              </td>
            </tr>
            <tr v-if="!filteredRows.length">
              <td class="empty-cell" colspan="9">没有匹配的实例</td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="pagination-bar">
        <span>共 {{ filteredRows.length }} 条</span>
        <button type="button" :disabled="currentPage === 1" aria-label="上一页" @click="currentPage--">‹</button>
        <strong>{{ currentPage }}</strong>
        <button type="button" :disabled="currentPage >= pageCount" aria-label="下一页" @click="currentPage++">›</button>
        <select v-model.number="pageSize" aria-label="每页条数">
          <option :value="10">10条/页</option>
          <option :value="20">20条/页</option>
          <option :value="50">50条/页</option>
        </select>
        <label
          >前往 <input v-model.number="pageInput" type="number" min="1" :max="pageCount" @change="goToPage" /> 页</label
        >
      </footer>
    </section>

    <el-dialog v-model="detailVisible" title="实例详情" width="520px">
      <dl v-if="activeInstance" class="detail-list">
        <div>
          <dt>名称</dt>
          <dd>{{ activeInstance.name }}</dd>
        </div>
        <div>
          <dt>CPUID</dt>
          <dd>{{ activeInstance.cpuId }}</dd>
        </div>
        <div>
          <dt>主服务</dt>
          <dd>{{ activeInstance.master }}</dd>
        </div>
        <div>
          <dt>内网地址</dt>
          <dd>{{ activeInstance.lip }}</dd>
        </div>
        <div>
          <dt>运行状态</dt>
          <dd>{{ activeInstance.online ? "在线" : "离线" }}</dd>
        </div>
      </dl>
    </el-dialog>
    <el-dialog v-model="renameVisible" title="重命名实例" width="420px">
      <el-input v-model="renameValue" maxlength="32" placeholder="请输入实例名称" @keyup.enter="confirmRename" />
      <template #footer
        ><el-button @click="renameVisible = false">取消</el-button
        ><el-button type="primary" @click="confirmRename">确定</el-button></template
      >
    </el-dialog>
  </main>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

type SortKey = "name" | "master" | "disk" | "memory" | "cpu" | "online";
type Instance = {
  id: string;
  name: string;
  cpuId: string;
  isMaster: boolean;
  master: string;
  lip: string;
  rip: string;
  vip: string;
  linkSpeed: string;
  upload: string;
  download: string;
  disk: number;
  diskExternal: string;
  diskRoot: string;
  diskRootPercent: number;
  memory: number;
  memoryUsed: string;
  cpu: number;
  online: boolean;
};

const instances = ref<Instance[]>([
  {
    id: "i-001",
    name: "实例75-1-75",
    cpuId: "8ce2f8914f46004",
    isMaster: true,
    master: "",
    lip: "192.168.23.1",
    rip: "192.168.0.75",
    vip: "",
    linkSpeed: "无",
    upload: "0 Kb/s",
    download: "0 Kb/s",
    disk: 6.6,
    diskExternal: "123.49",
    diskRoot: "5.23",
    diskRootPercent: 38,
    memory: 11.2,
    memoryUsed: "0.87",
    cpu: 7.8,
    online: true
  },
  {
    id: "i-002",
    name: "实例75-210-1",
    cpuId: "10111bb878331dab",
    isMaster: false,
    master: "实例75-1-75",
    lip: "192.168.23.210",
    rip: "192.168.200.1",
    vip: "",
    linkSpeed: "无",
    upload: "0 Kb/s",
    download: "0 Kb/s",
    disk: 17.9,
    diskExternal: "",
    diskRoot: "2.46",
    diskRootPercent: 17.9,
    memory: 3.2,
    memoryUsed: "0.25",
    cpu: 1.6,
    online: true
  },
  {
    id: "i-003",
    name: "实例75-2-*",
    cpuId: "646c63220f342d3d",
    isMaster: false,
    master: "实例75-1-75",
    lip: "192.168.23.2",
    rip: "192.168.200.2",
    vip: "",
    linkSpeed: "无",
    upload: "0 Kb/s",
    download: "0 Kb/s",
    disk: 4.9,
    diskExternal: "",
    diskRoot: "2.45",
    diskRootPercent: 17.8,
    memory: 3.4,
    memoryUsed: "0.26",
    cpu: 1.5,
    online: true
  },
  {
    id: "i-004",
    name: "实例75-3-*",
    cpuId: "c56e154701efa50f",
    isMaster: false,
    master: "实例75-1-75",
    lip: "192.168.23.3",
    rip: "192.168.200.3",
    vip: "",
    linkSpeed: "无",
    upload: "0 Kb/s",
    download: "0 Kb/s",
    disk: 18.2,
    diskExternal: "",
    diskRoot: "2.51",
    diskRootPercent: 18.2,
    memory: 3.2,
    memoryUsed: "0.25",
    cpu: 1.7,
    online: true
  }
]);
const keyword = ref("");
const currentPage = ref(1);
const pageSize = ref(50);
const pageInput = ref(1);
const sortKey = ref<SortKey | "">("");
const sortAscending = ref(true);
const detailVisible = ref(false);
const renameVisible = ref(false);
const activeInstance = ref<Instance | null>(null);
const renameValue = ref("");
const filteredRows = computed(() => {
  const query = keyword.value.trim().toLocaleLowerCase();
  const rows = instances.value.filter(
    (instance) =>
      !query ||
      [instance.name, instance.master, instance.lip, instance.rip, instance.cpuId].some((value) =>
        value.toLocaleLowerCase().includes(query)
      )
  );
  if (!sortKey.value) return rows;
  const key = sortKey.value;
  return [...rows].sort((left, right) => {
    const a = left[key];
    const b = right[key];
    const result =
      typeof a === "number" || typeof a === "boolean"
        ? Number(a) - Number(b)
        : String(a).localeCompare(String(b), "zh-CN");
    return sortAscending.value ? result : -result;
  });
});
const pageCount = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)));
const pageRows = computed(() =>
  filteredRows.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
);
watch([keyword, pageSize], () => {
  currentPage.value = 1;
  pageInput.value = 1;
});
watch(pageCount, (count) => {
  if (currentPage.value > count) currentPage.value = count;
});
function refreshList() {
  ElMessage.success("实例列表已刷新");
}
function sortBy(key: SortKey) {
  sortAscending.value = sortKey.value === key ? !sortAscending.value : true;
  sortKey.value = key;
}
function sortIcon(key: SortKey) {
  return sortKey.value !== key ? "↕" : sortAscending.value ? "↑" : "↓";
}
function showDetails(instance: Instance) {
  activeInstance.value = instance;
  detailVisible.value = true;
}
function restartInstance(instance: Instance) {
  ElMessageBox.confirm(`确认重启“${instance.name}”吗？`, "重启实例", {
    confirmButtonText: "重启",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => ElMessage.success(`${instance.name}已提交重启`))
    .catch(() => undefined);
}
function renameInstance(instance: Instance) {
  activeInstance.value = instance;
  renameValue.value = instance.name;
  renameVisible.value = true;
}
function confirmRename() {
  const name = renameValue.value.trim();
  if (!name || !activeInstance.value) return;
  activeInstance.value.name = name;
  renameVisible.value = false;
  ElMessage.success("实例名称已更新");
}
function toggleInstance(instance: Instance) {
  instance.online = !instance.online;
  ElMessage.success(`${instance.name}已${instance.online ? "启用" : "停用"}`);
}
function goToPage() {
  currentPage.value = Math.min(pageCount.value, Math.max(1, Number(pageInput.value) || 1));
  pageInput.value = currentPage.value;
}
</script>

<style lang="scss" scoped>
.instances-page {
  height: 100%;
  min-height: 0;
  padding: 6px;
  box-sizing: border-box;
  background: #edf2f7;
  color: #344358;
}
.instance-workspace {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 18px 20px 10px;
  box-sizing: border-box;
  border-radius: 4px;
  background: #fff;
}
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}
.refresh-button {
  height: 36px;
  padding: 0 14px;
  font-weight: 500;
}
.refresh-icon {
  margin-right: 7px;
  font-size: 16px;
}
.search-input {
  width: 208px;
}
.table-scroll {
  min-height: 0;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
}
.instance-table {
  width: 100%;
  min-width: 0;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 14px;
}
.instance-table th {
  height: 52px;
  padding: 0 10px;
  border-bottom: 1px solid #e3e7ed;
  background: #fafafa;
  color: #344358;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
}
.instance-table td {
  height: 60px;
  padding: 8px 10px;
  border-bottom: 1px solid #e6e9ee;
  vertical-align: middle;
}
.instance-table tbody tr:hover {
  background: #f8faff;
}
.name-column {
  width: 12%;
}
.master-column {
  width: 10%;
}
.ip-column {
  width: 12%;
}
.network-column {
  width: 12%;
}
.disk-column,
.memory-column,
.cpu-column {
  width: 11%;
}
.status-column {
  width: 6%;
}
.actions-column {
  width: 16%;
}
.sortable {
  cursor: pointer;
  user-select: none;
}
.sortable span {
  padding-left: 4px;
  color: #aab3c0;
  font-size: 13px;
}
.name-cell {
  line-height: 1.55;
}
.instance-name {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.name-cell small {
  color: #8a96a7;
  font-size: 12px;
}
.master-badge {
  padding: 2px 7px;
  border-radius: 3px;
  background: #edf3ff;
  color: #477cf0;
  font-size: 12px;
}
.ip-cell,
.network-cell,
.usage-cell {
  line-height: 1.55;
}
.ip-cell span,
.usage-cell > span {
  display: block;
  overflow-wrap: anywhere;
}
.network-cell small {
  display: flex;
  gap: 8px;
  white-space: nowrap;
  font-size: 11px;
}
.network-cell b {
  color: #6b8bc5;
  font-weight: 400;
}
.network-cell b + b {
  color: #24b77f;
}
.usage-track {
  width: 100%;
  height: 6px;
  margin-bottom: 5px;
  overflow: hidden;
  border-radius: 6px;
  background: #e9edf3;
}
.usage-track i {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: #3976f6;
}
.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 2px;
  font-size: 12px;
}
.status-badge.online {
  border-color: #d9f0d9;
  background: #f0f9eb;
  color: #67c23a;
}
.status-badge.offline {
  border-color: #f2d8d8;
  background: #fef0f0;
  color: #f56c6c;
}
.actions-cell {
  white-space: normal;
}
.actions-cell button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #3976f6;
  cursor: pointer;
  font-size: 13px;
}
.actions-cell button:hover {
  color: #174fc4;
}
.actions-cell button.danger {
  color: #f05c67;
}
.actions-cell > i {
  display: inline-block;
  height: 13px;
  margin: 0 8px;
  border-left: 1px solid #cfd5de;
  vertical-align: middle;
}
@media (max-width: 1250px) {
  .instance-table th {
    padding-right: 5px;
    padding-left: 5px;
    font-size: 12px;
  }
  .instance-table td {
    padding-right: 5px;
    padding-left: 5px;
    font-size: 12px;
  }
  .actions-cell > i {
    margin-right: 3px;
    margin-left: 3px;
  }
  .actions-cell button {
    font-size: 11px;
  }
  .network-cell small {
    flex-wrap: wrap;
    gap: 2px 6px;
  }
}
.empty-cell {
  height: 90px !important;
  text-align: center;
  color: #929daf;
}
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 14px;
  min-height: 42px;
  padding-top: 10px;
  color: #66758a;
  font-size: 13px;
}
.pagination-bar > button {
  border: 0;
  background: transparent;
  color: #68778c;
  font-size: 22px;
  cursor: pointer;
}
.pagination-bar > button:disabled {
  color: #c5ccd6;
  cursor: not-allowed;
}
.pagination-bar > strong {
  color: #3976f6;
  font-weight: 600;
}
.pagination-bar select,
.pagination-bar input {
  height: 28px;
  border: 1px solid #d9dee6;
  border-radius: 3px;
  color: #536176;
  background: #fff;
}
.pagination-bar select {
  padding: 0 8px;
}
.pagination-bar label {
  display: flex;
  align-items: center;
  gap: 6px;
}
.pagination-bar input {
  width: 48px;
  padding: 0 5px;
}
.detail-list {
  margin: 0;
}
.detail-list > div {
  display: grid;
  grid-template-columns: 90px 1fr;
  padding: 10px 0;
  border-bottom: 1px solid #eef1f5;
}
.detail-list dt {
  color: #8792a3;
}
.detail-list dd {
  margin: 0;
  color: #344358;
}
@media (max-width: 700px) {
  .instance-workspace {
    padding: 12px 10px 8px;
  }
  .toolbar {
    margin-bottom: 12px;
  }
  .pagination-bar {
    gap: 8px;
    font-size: 12px;
  }
  .search-input {
    width: 180px;
  }
}
</style>
