<template>
  <main class="streams-page">
    <section class="streams-workspace">
      <div class="toolbar">
        <div class="toolbar-actions">
          <el-button type="primary" @click="openBatchDialog"><span class="button-symbol">＋</span>批量</el-button>
          <el-button type="primary" @click="openAddDialog"><span class="button-symbol">＋</span>添加</el-button>
          <el-button plain :disabled="!selectedIds.length" @click="removeSelected"
            ><span class="button-symbol trash-symbol">▤</span>删除</el-button
          >
        </div>
        <el-input v-model="keyword" class="search-input" placeholder="请输入关键字" clearable>
          <template #suffix><span class="search-icon">⌕</span></template>
        </el-input>
      </div>

      <div class="table-scroll">
        <table class="stream-table">
          <thead>
            <tr>
              <th class="check-column">
                <input v-model="allVisibleSelected" type="checkbox" aria-label="选择当前页" />
              </th>
              <th class="instance-column sortable" @click="sortBy('instance')">
                实例 <span>{{ sortIcon("instance") }}</span>
              </th>
              <th class="node-column">指定节点</th>
              <th class="created-column sortable" @click="sortBy('createdAt')">
                添加时间 <span>{{ sortIcon("createdAt") }}</span>
              </th>
              <th class="type-column sortable" @click="sortBy('type')">
                类型 <span>{{ sortIcon("type") }}</span>
              </th>
              <th class="url-column">流地址</th>
              <th class="alias-column">别名</th>
              <th class="path-column">StreamPath</th>
              <th class="switch-column">开关</th>
              <th class="actions-column">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stream in pageRows" :key="stream.id">
              <td class="check-column">
                <input
                  v-model="selectedIds"
                  type="checkbox"
                  :value="stream.id"
                  :aria-label="`选择${stream.alias || stream.streamPath}`"
                />
              </td>
              <td>{{ stream.instance }}</td>
              <td>
                <span class="node-badge">{{ stream.node }}</span>
              </td>
              <td class="date-cell">{{ stream.createdAt }}</td>
              <td>{{ stream.type === "pull" ? "拉流" : "推流" }}</td>
              <td class="url-cell" :title="stream.url">{{ stream.url }}</td>
              <td class="alias-cell" :title="stream.alias">{{ stream.alias }}</td>
              <td class="path-cell" :title="stream.streamPath">{{ stream.streamPath }}</td>
              <td><el-switch v-model="stream.enabled" /></td>
              <td class="row-actions">
                <button type="button" @click="editStream(stream)">编辑</button><i></i>
                <button type="button" @click="previewStream(stream)">预览</button><i></i>
                <button class="delete-action" type="button" @click="removeStream(stream.id)">删除</button>
              </td>
            </tr>
            <tr v-if="!filteredRows.length">
              <td colspan="10" class="empty-cell">没有匹配的流</td>
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

    <el-dialog v-model="formVisible" :title="editingId ? '编辑流' : '添加流'" width="560px" destroy-on-close>
      <el-form :model="form" label-width="96px" class="stream-form">
        <el-form-item label="实例"
          ><el-select v-model="form.instance" placeholder="请选择实例"
            ><el-option v-for="item in instances" :key="item" :label="item" :value="item" /></el-select
        ></el-form-item>
        <el-form-item label="指定节点"
          ><el-select v-model="form.node" placeholder="请选择节点"
            ><el-option v-for="item in nodes" :key="item" :label="item" :value="item" /></el-select
        ></el-form-item>
        <el-form-item label="类型"
          ><el-radio-group v-model="form.type"
            ><el-radio value="pull">拉流</el-radio><el-radio value="push">推流</el-radio></el-radio-group
          ></el-form-item
        >
        <el-form-item label="流地址"><el-input v-model.trim="form.url" placeholder="请输入流地址" /></el-form-item>
        <el-form-item label="别名"><el-input v-model.trim="form.alias" placeholder="请输入别名" /></el-form-item>
        <el-form-item label="StreamPath"
          ><el-input v-model.trim="form.streamPath" placeholder="请输入 StreamPath"
        /></el-form-item>
      </el-form>
      <template #footer
        ><el-button @click="formVisible = false">取消</el-button
        ><el-button type="primary" @click="saveStream">确定</el-button></template
      >
    </el-dialog>

    <el-dialog v-model="batchVisible" title="批量添加流" width="560px">
      <el-form label-width="96px" class="stream-form">
        <el-form-item label="指定节点"
          ><el-select v-model="batchNode" placeholder="请选择节点"
            ><el-option v-for="item in nodes" :key="item" :label="item" :value="item" /></el-select
        ></el-form-item>
        <el-form-item label="流地址列表"
          ><el-input v-model="batchUrls" type="textarea" :rows="6" placeholder="每行输入一个流地址"
        /></el-form-item>
      </el-form>
      <template #footer
        ><el-button @click="batchVisible = false">取消</el-button
        ><el-button type="primary" @click="addBatch">添加</el-button></template
      >
    </el-dialog>

    <el-dialog v-model="previewVisible" title="流预览" width="560px">
      <div v-if="previewItem" class="preview-content">
        <span class="preview-indicator"></span><strong>{{ previewItem.alias || previewItem.streamPath }}</strong
        ><code>{{ previewItem.url }}</code>
        <p>本地演示页面不连接流媒体服务，预览地址仅供查看。</p>
      </div>
    </el-dialog>
  </main>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

type StreamType = "pull" | "push";
type Stream = {
  id: number;
  instance: string;
  node: string;
  createdAt: string;
  type: StreamType;
  url: string;
  alias: string;
  streamPath: string;
  enabled: boolean;
};
type SortKey = "instance" | "createdAt" | "type";
const instances = ["实例70-63-100", "实例70-1-70", "实例70-210-53"];
const nodes = ["实例70-63-100", "实例70-1-70", "实例70-210-53", "实例70-218-43"];
const streams = ref<Stream[]>([]);
const keyword = ref("");
const selectedIds = ref<number[]>([]);
const currentPage = ref(1);
const pageSize = ref(50);
const pageInput = ref(1);
const sortKey = ref<SortKey | "">("");
const sortAscending = ref(true);
const formVisible = ref(false);
const batchVisible = ref(false);
const previewVisible = ref(false);
const editingId = ref<number | null>(null);
const previewItem = ref<Stream | null>(null);
const batchNode = ref(nodes[0]);
const batchUrls = ref("");
const nextId = ref(1);
const form = reactive({
  instance: instances[0],
  node: nodes[0],
  type: "pull" as StreamType,
  url: "",
  alias: "",
  streamPath: ""
});
const filteredRows = computed(() => {
  const query = keyword.value.trim().toLocaleLowerCase();
  const rows = streams.value.filter(
    (stream) =>
      !query ||
      [
        stream.instance,
        stream.node,
        stream.type === "pull" ? "拉流" : "推流",
        stream.url,
        stream.alias,
        stream.streamPath
      ].some((value) => value.toLocaleLowerCase().includes(query))
  );
  if (!sortKey.value) return rows;
  const key = sortKey.value;
  return [...rows].sort((a, b) => {
    const result = a[key].localeCompare(b[key], "zh-CN");
    return sortAscending.value ? result : -result;
  });
});
const pageCount = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)));
const pageRows = computed(() =>
  filteredRows.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
);
const allVisibleSelected = computed({
  get: () => pageRows.value.length > 0 && pageRows.value.every((stream) => selectedIds.value.includes(stream.id)),
  set: (checked: boolean) => {
    const visibleIds = pageRows.value.map((stream) => stream.id);
    selectedIds.value = checked
      ? [...new Set([...selectedIds.value, ...visibleIds])]
      : selectedIds.value.filter((id) => !visibleIds.includes(id));
  }
});
watch([keyword, pageSize], () => {
  currentPage.value = 1;
  pageInput.value = 1;
});
watch(pageCount, (count) => {
  if (currentPage.value > count) currentPage.value = count;
});
function refreshList() {
  ElMessage.success("流列表已刷新");
}
function sortBy(key: SortKey) {
  sortAscending.value = sortKey.value === key ? !sortAscending.value : true;
  sortKey.value = key;
}
function sortIcon(key: SortKey) {
  return sortKey.value !== key ? "↕" : sortAscending.value ? "↑" : "↓";
}
function resetForm() {
  editingId.value = null;
  Object.assign(form, { instance: instances[0], node: nodes[0], type: "pull", url: "", alias: "", streamPath: "" });
}
function openAddDialog() {
  resetForm();
  formVisible.value = true;
}
function editStream(stream: Stream) {
  editingId.value = stream.id;
  Object.assign(form, {
    instance: stream.instance,
    node: stream.node,
    type: stream.type,
    url: stream.url,
    alias: stream.alias,
    streamPath: stream.streamPath
  });
  formVisible.value = true;
}
function saveStream() {
  if (!form.url.trim() || !form.streamPath.trim()) {
    ElMessage.warning("请填写流地址和 StreamPath");
    return;
  }
  if (editingId.value !== null) {
    const target = streams.value.find((stream) => stream.id === editingId.value);
    if (target) Object.assign(target, form);
    ElMessage.success("流信息已更新");
  } else {
    streams.value.unshift({
      id: nextId.value++,
      ...form,
      createdAt: new Date().toLocaleString("sv-SE").replace("T", " "),
      enabled: true
    });
    ElMessage.success("已添加流");
  }
  formVisible.value = false;
}
function openBatchDialog() {
  batchUrls.value = "";
  batchNode.value = nodes[0];
  batchVisible.value = true;
}
function addBatch() {
  const urls = batchUrls.value
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);
  if (!urls.length) {
    ElMessage.warning("请至少填写一个流地址");
    return;
  }
  const createdAt = new Date().toLocaleString("sv-SE").replace("T", " ");
  streams.value.unshift(
    ...urls.map((url) => ({
      id: nextId.value++,
      instance: instances[0],
      node: batchNode.value,
      createdAt,
      type: "pull" as const,
      url,
      alias: "",
      streamPath: url.split("/").slice(-2).join("/"),
      enabled: true
    }))
  );
  batchVisible.value = false;
  ElMessage.success(`已添加 ${urls.length} 条流`);
}
function previewStream(stream: Stream) {
  previewItem.value = stream;
  previewVisible.value = true;
}
function removeStream(id: number) {
  streams.value = streams.value.filter((stream) => stream.id !== id);
  selectedIds.value = selectedIds.value.filter((selectedId) => selectedId !== id);
  ElMessage.success("流已删除");
}
function removeSelected() {
  if (!selectedIds.value.length) return;
  ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条流吗？`, "批量删除", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      streams.value = streams.value.filter((stream) => !selectedIds.value.includes(stream.id));
      selectedIds.value = [];
      ElMessage.success("选中流已删除");
    })
    .catch(() => undefined);
}
function goToPage() {
  currentPage.value = Math.min(pageCount.value, Math.max(1, Number(pageInput.value) || 1));
  pageInput.value = currentPage.value;
}
</script>

<style lang="scss" scoped>
.streams-page {
  height: 100%;
  min-height: 0;
  padding: 6px;
  box-sizing: border-box;
  background: #edf2f7;
  color: #344358;
}
.streams-workspace {
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
.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.toolbar-actions .el-button {
  height: 36px;
}
.button-symbol {
  margin-right: 5px;
  font-size: 17px;
  line-height: 1;
}
.trash-symbol {
  font-size: 13px;
}
.search-input {
  width: 208px;
}
.table-scroll {
  min-height: 0;
  flex: 1;
  overflow: auto;
}
.stream-table {
  width: 100%;
  min-width: 1050px;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 14px;
}
.stream-table th {
  height: 52px;
  padding: 0 12px;
  border-bottom: 1px solid #e3e7ed;
  background: #fafafa;
  color: #344358;
  text-align: left;
  font-weight: 600;
  white-space: nowrap;
}
.stream-table td {
  height: 52px;
  padding: 8px 12px;
  border-bottom: 1px solid #e6e9ee;
  vertical-align: middle;
}
.stream-table tbody tr:nth-child(even) {
  background: #fafafa;
}
.stream-table tbody tr:hover {
  background: #f5f8ff;
}
.check-column {
  width: 42px;
  text-align: center !important;
}
.check-column input {
  width: 14px;
  height: 14px;
  accent-color: #3976f6;
  vertical-align: middle;
}
.instance-column {
  width: 12%;
}
.node-column {
  width: 9%;
}
.created-column {
  width: 12%;
}
.type-column {
  width: 6%;
}
.url-column {
  width: 19%;
}
.alias-column {
  width: 12%;
}
.path-column {
  width: 18%;
}
.switch-column {
  width: 5%;
}
.actions-column {
  width: 130px;
}
.sortable {
  cursor: pointer;
  user-select: none;
}
.sortable span {
  padding-left: 4px;
  color: #aab3c0;
}
.node-badge {
  display: inline-block;
  padding: 2px 7px;
  border: 1px solid #e2f0d9;
  border-radius: 2px;
  background: #f0f9eb;
  color: #67c23a;
  font-size: 12px;
  white-space: nowrap;
}
.date-cell {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.url-cell,
.alias-cell,
.path-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.row-actions {
  white-space: nowrap;
}
.row-actions button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #3976f6;
  cursor: pointer;
  font-size: 13px;
}
.row-actions button:hover {
  color: #174fc4;
}
.row-actions .delete-action {
  color: #f05c67;
}
.row-actions > i {
  display: inline-block;
  height: 13px;
  margin: 0 7px;
  border-left: 1px solid #cfd5de;
  vertical-align: middle;
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
.stream-form :deep(.el-select) {
  width: 100%;
}
.preview-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 8px 0;
}
.preview-indicator {
  width: 100%;
  height: 210px;
  display: grid;
  place-items: center;
  border-radius: 4px;
  background: #172332;
}
.preview-indicator::after {
  content: "▶";
  color: #fff;
  font-size: 32px;
}
.preview-content code {
  overflow-wrap: anywhere;
  color: #526176;
}
.preview-content p {
  margin: 0;
  color: #909baa;
  font-size: 12px;
}
@media (max-width: 700px) {
  .streams-workspace {
    padding: 12px 10px 8px;
  }
  .toolbar {
    align-items: flex-start;
    flex-direction: column;
    margin-bottom: 12px;
  }
  .toolbar-actions {
    flex-wrap: wrap;
  }
  .search-input {
    width: 100%;
  }
  .pagination-bar {
    gap: 8px;
    font-size: 12px;
  }
}
</style>
