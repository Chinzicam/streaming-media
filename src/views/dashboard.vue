<template>
  <main class="dashboard">
    <section class="overview-bar">
      <div class="overview-item overview-heading"><span class="heading-mark"></span><strong>基本信息</strong></div>
      <div class="overview-item">
        <span class="overview-icon version-icon">◆</span><span>版本号：1.2.3.20260916</span>
      </div>
      <div class="overview-item">
        <span class="overview-icon running-icon">▶</span><span>启动时间：28天53分钟前</span>
      </div>
      <div class="overview-item">
        <span class="overview-icon instance-icon">▣</span
        ><span>实例在线/总数：{{ selectedInstances.length }}/{{ instances.length }}</span>
      </div>
      <el-button class="refresh-button" size="small" @click="refreshData"
        ><span class="refresh-symbol">⟳</span>刷新</el-button
      >
    </section>

    <section :class="['filter-panel', { 'is-collapsed': !filtersExpanded }]">
      <!-- <button class="collapse-button" type="button" @click="filtersExpanded = !filtersExpanded">
        <span>{{ filtersExpanded ? "⌃" : "⌄" }}</span
        >{{ filtersExpanded ? "收起筛选" : "展开筛选" }}
      </button> -->
      <div v-if="filtersExpanded" class="filter-row">
        <span class="filter-label">维度</span>
        <label v-for="metric in metrics" :key="metric.key" class="filter-chip">
          <input v-model="selectedMetrics" type="checkbox" :value="metric.key" />
          <span>{{ metric.label }}</span>
        </label>
      </div>
      <div v-if="filtersExpanded" class="filter-row instance-filter-row">
        <span class="filter-label">实例</span>
        <label v-for="instance in instances" :key="instance.id" class="filter-chip">
          <input v-model="selectedInstances" type="checkbox" :value="instance.id" />
          <span>{{ instance.name }}</span>
        </label>
      </div>
      <div v-if="filtersExpanded" class="filter-row time-filter-row">
        <label class="filter-label" for="time-range">时间</label>
        <select id="time-range" v-model="selectedRange" class="range-select">
          <option v-for="range in ranges" :key="range.value" :value="range.value">{{ range.label }}</option>
        </select>
      </div>
    </section>

    <section class="metrics-panel">
      <div class="metric-grid">
        <template v-for="metric in metrics" :key="metric.key">
          <button
            v-if="selectedMetrics.includes(metric.key)"
            type="button"
            :class="['metric-card', { 'is-selected': activeMetricKey === metric.key }]"
            :style="{ '--metric-color': metric.color }"
            @click="selectMetric(metric.key)"
          >
            <div class="metric-title">
              <span class="metric-icon" :style="{ color: metric.color }">{{ metric.icon }}</span
              >{{ metric.label }}
            </div>
            <template v-if="metric.key === 'cpu' || metric.key === 'disk'">
              <div class="meter-pair">
                <div v-for="stat in metricStats(metric.key)" :key="stat.label" class="meter-item">
                  <div class="meter" :style="{ '--meter-value': `${stat.value}%`, '--meter-color': metric.color }">
                    <span>{{ stat.value }}<small>%</small></span>
                  </div>
                  <span class="meter-label">{{ stat.label }}</span>
                </div>
              </div>
            </template>
            <template v-else-if="metric.key === 'memory'">
              <div class="memory-pair">
                <div>
                  <span>最高</span><strong>{{ metricStats("memory")[0].value }}<small>%</small></strong
                  ><i :style="{ '--fill': `${metricStats('memory')[0].value}%` }"></i>
                </div>
                <div>
                  <span>最低</span><strong>{{ metricStats("memory")[1].value }}<small>%</small></strong
                  ><i :style="{ '--fill': `${metricStats('memory')[1].value}%` }"></i>
                </div>
              </div>
            </template>
            <template v-else-if="['networkSend', 'networkReceive', 'diskRead', 'diskWrite'].includes(metric.key)">
              <div class="rate-pair">
                <div>
                  <span class="rate-symbol high">▤</span
                  ><strong
                    >{{ metricStats(metric.key)[0].value }}<small>{{ metric.unit }}</small></strong
                  ><em>最高</em>
                </div>
                <div>
                  <span class="rate-symbol low">▤</span
                  ><strong
                    >{{ metricStats(metric.key)[1].value }}<small>{{ metric.unit }}</small></strong
                  ><em>最低</em>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="traffic-value">
                <strong>{{ metricStats("streams")[0].value }}</strong
                ><span>路<br />当前拉流</span><strong class="drop-value">{{ metricStats("streams")[1].value }}</strong
                ><span>次<br />断流</span>
              </div>
            </template>
          </button>
        </template>
      </div>
    </section>

    <section class="chart-panel">
      <header class="chart-header">
        <span class="heading-mark"></span><strong>{{ activeMetric.label }}</strong
        ><span class="chart-range">{{ selectedRangeLabel }}</span>
      </header>
      <div class="chart-content">
        <div class="chart-area">
          <div class="chart-legend">
            <span v-for="(instance, index) in selectedInstanceObjects" :key="instance.id"
              ><i :style="{ background: chartColors[index % chartColors.length] }"></i>{{ instance.name }}</span
            >
          </div>
          <div class="chart" role="img" :aria-label="`${activeMetric.label}趋势图`">
            <div class="y-axis">
              <span v-for="tick in chartYTicks" :key="tick">{{ tick }}{{ chartAxisUnit }}</span>
            </div>
            <div
              class="plot-area"
              @mousemove="updateHover('main', $event, $event.currentTarget)"
              @mouseleave="clearHover('main')"
            >
              <div class="grid-lines"><i v-for="tick in chartYTicks" :key="tick"></i></div>
              <svg
                v-if="selectedMetrics.length && selectedInstanceObjects.length"
                class="plot-svg"
                viewBox="0 0 700 190"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <polyline
                  v-for="(instance, index) in selectedInstanceObjects"
                  :key="instance.id"
                  :points="linePoints(index)"
                  fill="none"
                  :stroke="chartColors[index % chartColors.length]"
                  stroke-width="2.5"
                  vector-effect="non-scaling-stroke"
                />
                <line
                  v-if="hoverPoint('main') !== null"
                  :x1="hoverX('main')"
                  y1="0"
                  :x2="hoverX('main')"
                  y2="190"
                  class="hover-guide"
                />
                <template v-if="hoverPoint('main') !== null">
                  <circle
                    v-for="(instance, index) in selectedInstanceObjects"
                    :key="`hover-${instance.id}`"
                    :cx="hoverX('main')"
                    :cy="lineY(index, displayedMetricKey, hoverPoint('main') ?? 0, 190)"
                    r="4"
                    :fill="chartColors[index % chartColors.length]"
                    class="hover-dot"
                  />
                </template>
              </svg>
              <div
                v-if="hoverPoint('main') !== null"
                class="chart-tooltip"
                :style="{ left: `${hoverPercent('main')}%` }"
              >
                <strong>{{ timeLabels[Math.round(((hoverPoint("main") ?? 0) / 13) * 6)] }}</strong>
                <span v-for="(instance, index) in selectedInstanceObjects" :key="`tip-${instance.id}`">
                  <i :style="{ background: chartColors[index % chartColors.length] }"></i>{{ instance.name }}：{{
                    pseudoValue(displayedMetricKey, index, hoverPoint("main") ?? 0)
                  }}{{ chartAxisUnit }}
                </span>
              </div>
              <span v-else class="empty-chart"></span>
              <div class="x-axis">
                <span v-for="label in timeLabels" :key="label">{{ label }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>实例名称</th>
                <th>{{ activeMetric.label }} <span class="sort-mark">↕</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(instance, index) in selectedInstanceObjects" :key="instance.id">
                <td><i :style="{ background: chartColors[index % chartColors.length] }"></i>{{ instance.name }}</td>
                <td>{{ tableValue(activeMetric.key, instance.id) }}{{ activeMetric.unit }}</td>
              </tr>
              <tr v-if="!selectedInstanceObjects.length">
                <td colspan="2" class="empty-row">暂无实例</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <section class="chart-panel extra-panel">
      <header class="chart-header">
        <span class="heading-mark"></span><strong>实例运行状态总览</strong
        ><span class="chart-range">CPU / 内存 / 磁盘 · {{ selectedRangeLabel }}</span>
      </header>
      <div class="extra-chart-grid">
        <div v-for="(metric, metricIndex) in resourceMetrics" :key="metric.key" class="mini-chart">
          <h3>{{ metric.label }}</h3>
          <div class="mini-plot">
            <div class="mini-y-axis">
              <span v-for="tick in [100, 50, 0]" :key="tick" class="mini-y-label">{{ tick }}{{ metric.unit }}</span>
            </div>
            <div
              class="mini-lines"
              @mousemove="updateHover(`resource-${metric.key}`, $event, $event.currentTarget)"
              @mouseleave="clearHover(`resource-${metric.key}`)"
            >
              <i v-for="tick in [0, 1, 2]" :key="tick"></i>
              <svg viewBox="0 0 700 150" preserveAspectRatio="none" aria-hidden="true">
                <polyline
                  v-for="(instance, instanceIndex) in selectedInstanceObjects"
                  :key="instance.id"
                  :points="linePoints(instanceIndex, metric.key, 150)"
                  fill="none"
                  :stroke="chartColors[instanceIndex % chartColors.length]"
                  stroke-width="2"
                  vector-effect="non-scaling-stroke"
                />
                <line
                  v-if="hoverPoint(`resource-${metric.key}`) !== null"
                  :x1="hoverX(`resource-${metric.key}`)"
                  y1="0"
                  :x2="hoverX(`resource-${metric.key}`)"
                  y2="150"
                  class="hover-guide"
                />
                <template v-if="hoverPoint(`resource-${metric.key}`) !== null">
                  <circle
                    v-for="(instance, instanceIndex) in selectedInstanceObjects"
                    :key="`hover-${metric.key}-${instance.id}`"
                    :cx="hoverX(`resource-${metric.key}`)"
                    :cy="lineY(instanceIndex, metric.key, hoverPoint(`resource-${metric.key}`) ?? 0, 150)"
                    r="3.5"
                    :fill="chartColors[instanceIndex % chartColors.length]"
                    class="hover-dot"
                  />
                </template>
              </svg>
              <div
                v-if="hoverPoint(`resource-${metric.key}`) !== null"
                class="mini-tooltip"
                :style="{ left: `${hoverPercent(`resource-${metric.key}`)}%` }"
              >
                {{ timeLabels[Math.round(((hoverPoint(`resource-${metric.key}`) ?? 0) / 13) * 6)] }} ·
                {{ metric.label }}
                <span
                  v-for="(instance, instanceIndex) in selectedInstanceObjects"
                  :key="`mini-tip-${metric.key}-${instance.id}`"
                >
                  <i :style="{ background: chartColors[instanceIndex % chartColors.length] }"></i
                  >{{ pseudoValue(metric.key, instanceIndex, hoverPoint(`resource-${metric.key}`) ?? 0)
                  }}{{ metric.unit }}
                </span>
              </div>
            </div>
          </div>
          <div class="mini-x-axis">
            <span v-for="label in timeLabels" :key="label">{{ label }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="chart-panel extra-panel">
      <header class="chart-header">
        <span class="heading-mark"></span><strong>拉流任务趋势</strong
        ><span class="chart-range">当前拉流与断流次数 · {{ selectedRangeLabel }}</span>
      </header>
      <div class="chart-content single-chart-content">
        <div class="chart-area">
          <div class="chart-legend">
            <span v-for="(instance, index) in selectedInstanceObjects" :key="instance.id"
              ><i :style="{ background: chartColors[index % chartColors.length] }"></i>{{ instance.name }}</span
            >
          </div>
          <div class="chart" role="img" aria-label="拉流任务趋势图">
            <div class="y-axis"><span>120</span><span>90</span><span>60</span><span>30</span><span>0</span></div>
            <div
              class="plot-area"
              @mousemove="updateHover('streams', $event, $event.currentTarget)"
              @mouseleave="clearHover('streams')"
            >
              <div class="grid-lines"><i v-for="tick in yTicks" :key="tick"></i></div>
              <svg class="plot-svg" viewBox="0 0 700 190" preserveAspectRatio="none" aria-hidden="true">
                <polyline
                  v-for="(instance, index) in selectedInstanceObjects"
                  :key="instance.id"
                  :points="linePoints(index, 'streams', 190)"
                  fill="none"
                  :stroke="chartColors[index % chartColors.length]"
                  stroke-width="2.5"
                  vector-effect="non-scaling-stroke"
                />
                <line
                  v-if="hoverPoint('streams') !== null"
                  :x1="hoverX('streams')"
                  y1="0"
                  :x2="hoverX('streams')"
                  y2="190"
                  class="hover-guide"
                />
                <template v-if="hoverPoint('streams') !== null">
                  <circle
                    v-for="(instance, index) in selectedInstanceObjects"
                    :key="`stream-hover-${instance.id}`"
                    :cx="hoverX('streams')"
                    :cy="lineY(index, 'streams', hoverPoint('streams') ?? 0, 190)"
                    r="4"
                    :fill="chartColors[index % chartColors.length]"
                    class="hover-dot"
                  />
                </template>
              </svg>
              <div
                v-if="hoverPoint('streams') !== null"
                class="chart-tooltip"
                :style="{ left: `${hoverPercent('streams')}%` }"
              >
                <strong>{{ timeLabels[Math.round(((hoverPoint("streams") ?? 0) / 13) * 6)] }}</strong>
                <span v-for="(instance, index) in selectedInstanceObjects" :key="`stream-tip-${instance.id}`">
                  <i :style="{ background: chartColors[index % chartColors.length] }"></i>{{ instance.name }}：{{
                    pseudoValue("streams", index, hoverPoint("streams") ?? 0)
                  }}
                  路
                </span>
              </div>
              <div class="x-axis">
                <span v-for="label in timeLabels" :key="label">{{ label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="chart-panel extra-panel">
      <header class="chart-header">
        <span class="heading-mark"></span><strong>磁盘读写速率</strong
        ><span class="chart-range">读取 / 写入 · {{ selectedRangeLabel }}</span>
      </header>
      <div class="extra-chart-grid disk-chart-grid">
        <div v-for="metric in diskMetrics" :key="metric.key" class="mini-chart">
          <h3>{{ metric.label }}</h3>
          <div class="mini-plot">
            <div class="mini-y-axis">
              <span v-for="tick in [100, 50, 0]" :key="tick" class="mini-y-label">{{ tick }}{{ metric.unit }}</span>
            </div>
            <div
              class="mini-lines"
              @mousemove="updateHover(`disk-${metric.key}`, $event, $event.currentTarget)"
              @mouseleave="clearHover(`disk-${metric.key}`)"
            >
              <i v-for="tick in [0, 1, 2]" :key="tick"></i>
              <svg viewBox="0 0 700 150" preserveAspectRatio="none" aria-hidden="true">
                <polyline
                  v-for="(instance, instanceIndex) in selectedInstanceObjects"
                  :key="instance.id"
                  :points="linePoints(instanceIndex, metric.key, 150)"
                  fill="none"
                  :stroke="chartColors[instanceIndex % chartColors.length]"
                  stroke-width="2"
                  vector-effect="non-scaling-stroke"
                />
                <line
                  v-if="hoverPoint(`disk-${metric.key}`) !== null"
                  :x1="hoverX(`disk-${metric.key}`)"
                  y1="0"
                  :x2="hoverX(`disk-${metric.key}`)"
                  y2="150"
                  class="hover-guide"
                />
                <template v-if="hoverPoint(`disk-${metric.key}`) !== null">
                  <circle
                    v-for="(instance, instanceIndex) in selectedInstanceObjects"
                    :key="`disk-hover-${metric.key}-${instance.id}`"
                    :cx="hoverX(`disk-${metric.key}`)"
                    :cy="lineY(instanceIndex, metric.key, hoverPoint(`disk-${metric.key}`) ?? 0, 150)"
                    r="3.5"
                    :fill="chartColors[instanceIndex % chartColors.length]"
                    class="hover-dot"
                  />
                </template>
              </svg>
              <div
                v-if="hoverPoint(`disk-${metric.key}`) !== null"
                class="mini-tooltip"
                :style="{ left: `${hoverPercent(`disk-${metric.key}`)}%` }"
              >
                {{ timeLabels[Math.round(((hoverPoint(`disk-${metric.key}`) ?? 0) / 13) * 6)] }} · {{ metric.label }}
                <span
                  v-for="(instance, instanceIndex) in selectedInstanceObjects"
                  :key="`disk-tip-${metric.key}-${instance.id}`"
                >
                  <i :style="{ background: chartColors[instanceIndex % chartColors.length] }"></i
                  >{{ pseudoValue(metric.key, instanceIndex, hoverPoint(`disk-${metric.key}`) ?? 0) }} {{ metric.unit }}
                </span>
              </div>
            </div>
          </div>
          <div class="mini-x-axis">
            <span v-for="label in timeLabels" :key="label">{{ label }}</span>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";

const metrics = [
  { key: "cpu", label: "CPU使用率", icon: "◉", color: "#ff8b43", unit: "%" },
  { key: "memory", label: "内存使用率", icon: "▥", color: "#4e8cff", unit: "%" },
  { key: "disk", label: "硬盘使用率", icon: "▰", color: "#5789ff", unit: "%" },
  { key: "networkSend", label: "网络发送速率", icon: "⇧", color: "#3db8d9", unit: "Mb/s" },
  { key: "networkReceive", label: "网络接收速率", icon: "⇩", color: "#34a8c8", unit: "Mb/s" },
  { key: "diskRead", label: "硬盘读取速率", icon: "⇧", color: "#5789ff", unit: "KB/s" },
  { key: "diskWrite", label: "硬盘写入速率", icon: "⇩", color: "#34bca2", unit: "KB/s" },
  { key: "streams", label: "流数量", icon: "▦", color: "#8b69db", unit: " 路" }
] as const;
type MetricKey = (typeof metrics)[number]["key"];
const resourceMetrics = metrics.filter((metric) => ["cpu", "memory", "disk"].includes(metric.key));
const diskMetrics = metrics.filter((metric) => ["diskRead", "diskWrite"].includes(metric.key));
const instances = [
  { id: "edge-1", name: "实例70-1-70" },
  { id: "edge-2", name: "实例70-210-53" },
  { id: "edge-3", name: "实例70-218-43" },
  { id: "edge-4", name: "实例70-63-100" }
];
const ranges = [
  { value: 10, label: "近10分钟" },
  { value: 30, label: "近30分钟" },
  { value: 60, label: "近1小时" },
  { value: 360, label: "近6小时" }
];
const chartColors = ["#4e83ff", "#19b889", "#a75bd4", "#8874ff"];
const selectedMetrics = ref<MetricKey[]>(metrics.map((metric) => metric.key));
const selectedInstances = ref(instances.map((instance) => instance.id));
const selectedRange = ref(10);
const filtersExpanded = ref(true);
const refreshSeed = ref(0);
const activeMetricKey = ref<MetricKey | null>(null);
const hoveredPoints = ref<Record<string, number | null>>({});
const displayedMetricKey = computed<MetricKey>(() => activeMetricKey.value ?? "cpu");
const activeMetric = computed(() => metrics.find((metric) => metric.key === displayedMetricKey.value) ?? metrics[0]);
const selectedInstanceObjects = computed(() =>
  instances.filter((instance) => selectedInstances.value.includes(instance.id))
);
const selectedRangeLabel = computed(
  () => ranges.find((range) => range.value === selectedRange.value)?.label ?? "近10分钟"
);
const timeLabels = computed(() => {
  const points = 7;
  const span = selectedRange.value;
  return Array.from({ length: points }, (_, index) => {
    const minutesAgo = Math.round((span * (points - index - 1)) / (points - 1));
    if (minutesAgo === 0) return "现在";
    if (minutesAgo >= 60) return `${Math.floor(minutesAgo / 60)}小时前`;
    return `${minutesAgo}分钟前`;
  });
});
const yTicks = [100, 75, 50, 25, 0];
const chartYTicks = computed(() => {
  if (activeMetric.value.key === "networkSend" || activeMetric.value.key === "networkReceive") {
    return [240, 180, 120, 60, 0];
  }
  if (activeMetric.value.key === "diskRead" || activeMetric.value.key === "diskWrite") {
    return [800, 600, 400, 200, 0];
  }
  if (activeMetric.value.key === "streams") return [120, 90, 60, 30, 0];
  return yTicks;
});
const chartAxisUnit = computed(() => {
  if (activeMetric.value.key === "networkSend" || activeMetric.value.key === "networkReceive") return " Mb/s";
  if (activeMetric.value.key === "diskRead" || activeMetric.value.key === "diskWrite") return " KB/s";
  return activeMetric.value.unit;
});
function hoverPoint(chartId: string) {
  return hoveredPoints.value[chartId] ?? null;
}
function hoverX(chartId: string) {
  return ((hoverPoint(chartId) ?? 0) / 13) * 700;
}
function hoverPercent(chartId: string) {
  return ((hoverPoint(chartId) ?? 0) / 13) * 100;
}

function pseudoValue(metric: MetricKey, instanceIndex: number, pointIndex: number) {
  const seed = refreshSeed.value * 17 + selectedRange.value;
  const wave = Math.sin((pointIndex + 1) * 1.37 + instanceIndex * 1.9 + seed * 0.21);
  const drift = Math.cos((pointIndex + instanceIndex + seed) * 0.73);
  const base =
    metric === "cpu"
      ? 42
      : metric === "memory"
      ? 57
      : metric === "disk"
      ? 63
      : metric === "networkSend"
      ? 52
      : metric === "networkReceive"
      ? 38
      : metric === "diskRead"
      ? 28
      : metric === "diskWrite"
      ? 22
      : 47;
  const value = base + instanceIndex * 6 + wave * 15 + drift * 8;
  return metric === "networkSend" || metric === "networkReceive"
    ? Math.max(5, Math.round(value * 3.2))
    : metric === "diskRead" || metric === "diskWrite"
    ? Math.max(2, Math.round(value * 7.5))
    : Math.max(4, Math.min(96, Math.round(value)));
}
function linePoints(instanceIndex: number, metric: MetricKey = displayedMetricKey.value, height = 190) {
  return Array.from({ length: 14 }, (_, index) => {
    return `${(index / 13) * 700},${lineY(instanceIndex, metric, index, height)}`;
  }).join(" ");
}
function lineY(instanceIndex: number, metric: MetricKey, pointIndex: number, height: number) {
  const value = pseudoValue(metric, instanceIndex, pointIndex);
  const normalizedValue =
    metric === "networkSend" || metric === "networkReceive"
      ? (value / 240) * 100
      : metric === "diskRead" || metric === "diskWrite"
      ? (value / 800) * 100
      : metric === "streams"
      ? (value / 120) * 100
      : value;
  return height - 15 - normalizedValue * ((height - 25) / 100);
}
function updateHover(chartId: string, event: MouseEvent, target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return;
  const bounds = target.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
  hoveredPoints.value[chartId] = Math.round(ratio * 13);
}
function clearHover(chartId: string) {
  delete hoveredPoints.value[chartId];
}
function metricStats(key: MetricKey) {
  const seed = refreshSeed.value * 7 + selectedRange.value;
  if (key === "cpu")
    return [
      { label: "最高", value: 14 + (seed % 4) },
      { label: "最低", value: 3 + (seed % 2) }
    ];
  if (key === "memory")
    return [
      { label: "最高", value: 9 + (seed % 3) },
      { label: "最低", value: 5 + (seed % 2) }
    ];
  if (key === "disk")
    return [
      { label: "最高", value: 8 + (seed % 3) },
      { label: "最低", value: seed % 2 }
    ];
  if (key === "networkSend" || key === "networkReceive")
    return [
      { label: "最高", value: ((key === "networkSend" ? 4.2 : 3.4) + (seed % 9) * 0.17).toFixed(2), unit: "Mb/s" },
      { label: "最低", value: ((key === "networkSend" ? 380 : 290) + (seed % 11) * 13).toFixed(2), unit: "Kb/s" }
    ];
  if (key === "diskRead" || key === "diskWrite")
    return [
      { label: "最高", value: ((key === "diskRead" ? 86 : 64) + (seed % 13) * 8).toFixed(2), unit: "KB/s" },
      { label: "最低", value: ((seed % 4) * 2).toFixed(2), unit: "KB/s" }
    ];
  return [
    { label: "当前拉流", value: 95 + (seed % 5) },
    { label: "断流", value: seed % 3 }
  ];
}
function latestValue(instanceIndex: number) {
  return pseudoValue(displayedMetricKey.value, instanceIndex, 13);
}
function tableValue(metric: MetricKey, instanceId: string) {
  const instanceIndex = instances.findIndex((instance) => instance.id === instanceId);
  const metricIndex = metrics.findIndex((item) => item.key === metric);
  const seed = refreshSeed.value * 19 + selectedRange.value * 3 + instanceIndex * 11 + metricIndex * 23;
  const variation = (Math.sin(seed * 0.37) + 1) / 2;
  if (metric === "networkSend") return `${(2.8 + variation * 5.6).toFixed(2)} Mb/s`;
  if (metric === "networkReceive") return `${(1.9 + variation * 4.8).toFixed(2)} Mb/s`;
  if (metric === "diskRead") return `${(40 + variation * 240).toFixed(1)} KB/s`;
  if (metric === "diskWrite") return `${(18 + variation * 150).toFixed(1)} KB/s`;
  if (metric === "streams") return `${Math.round(40 + variation * 80)} 路`;
  return `${Math.round(12 + variation * 76)}%`;
}
function selectMetric(key: MetricKey) {
  activeMetricKey.value = key;
}
watch(selectedMetrics, (visibleMetrics) => {
  if (activeMetricKey.value && !visibleMetrics.includes(activeMetricKey.value)) {
    activeMetricKey.value = visibleMetrics[0] ?? null;
  }
});
function refreshData() {
  refreshSeed.value += 1;
}
</script>

<style lang="scss" scoped>
.dashboard {
  height: 100%;
  min-height: 0;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 8px;
  box-sizing: border-box;
  background: #edf2f7;
  color: #344358;
  font-size: 13px;
}
.overview-bar,
.filter-panel,
.metrics-panel,
.chart-panel {
  background: #fff;
  border-radius: 4px;
}
.overview-bar {
  min-height: 52px;
  display: flex;
  align-items: center;
  gap: clamp(12px, 3vw, 48px);
  padding: 0 18px;
  box-sizing: border-box;
}
.overview-item {
  display: flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}
.overview-heading {
  min-width: 100px;
}
.overview-heading strong {
  font-weight: 600;
}
.heading-mark {
  width: 4px;
  height: 16px;
  flex: 0 0 4px;
  border-radius: 2px;
  background: #3976f6;
}
.overview-icon {
  width: 18px;
  height: 18px;
  display: inline-grid;
  place-items: center;
  border-radius: 3px;
  background: #f0f3f8;
  font-size: 12px;
}
.version-icon {
  color: #3976f6;
}
.running-icon {
  color: #17a978;
}
.instance-icon {
  color: #8956d6;
}
.refresh-button {
  margin-left: auto;
  color: #3976f6;
  background: #edf3ff;
  border-color: #edf3ff;
}
.refresh-symbol {
  margin-right: 6px;
  font-size: 16px;
}
.filter-panel {
  display: flex;
  flex-direction: column;
  margin-top: 8px;
  padding: 18px;
  box-sizing: border-box;
}
.filter-panel.is-collapsed {
  padding-top: 12px;
  padding-bottom: 12px;
}
.filter-panel:not(:has(.filter-row)) {
  min-height: 0;
  padding-top: 14px;
  padding-bottom: 14px;
}
.filter-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 26px;
  min-height: 34px;
  padding-right: 110px;
}
.filter-label {
  width: 30px;
  flex: 0 0 30px;
  color: #536176;
}
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 30px;
  padding: 0 10px;
  border-radius: 3px;
  color: #3976f6;
  background: #eaf0ff;
  cursor: pointer;
  user-select: none;
}
.filter-chip input {
  width: 13px;
  height: 13px;
  margin: 0;
  accent-color: #3976f6;
}
.instance-filter-row {
  margin-top: 20px;
}
.time-filter-row {
  margin-top: 18px;
}
.range-select {
  width: 268px;
  height: 30px;
  padding: 0 10px;
  border: 1px solid #d8dee8;
  border-radius: 3px;
  color: #46556b;
  background: #fff;
  outline-color: #3976f6;
}
.collapse-button {
  align-self: flex-end;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 30px;
  margin: -8px 0 0;
  border: 0;
  padding: 0 2px;
  color: #3976f6;
  background: transparent;
  cursor: pointer;
}
.collapse-button span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  line-height: 1;
  font-size: 15px;
}
.filter-panel.is-collapsed .collapse-button {
  margin: -8px 0;
}
.metrics-panel {
  margin-top: 14px;
  padding: 26px 18px 18px;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px 32px;
}
.metric-card {
  min-width: 0;
  min-height: 148px;
  padding: 16px 18px 12px;
  text-align: left;
  color: #344358;
  border: 1px solid transparent;
  border-radius: 3px;
  background: linear-gradient(145deg, #e7efff, #fbfcff);
  box-shadow: 0 5px 14px rgba(40, 61, 92, 0.11);
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;
}
.metric-card:nth-child(even) {
  background: linear-gradient(145deg, #def5fb, #fbfdff);
}
.metric-card:hover {
  transform: translateY(-1px);
}
.metric-card.is-selected {
  border-color: var(--metric-color, #4e83ff);
}
.metric-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
}
.metric-icon {
  font-size: 15px;
  font-weight: 700;
}
.rate-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 33px;
}
.rate-pair > div {
  position: relative;
  display: grid;
  grid-template-columns: 34px 1fr;
  align-items: center;
}
.rate-symbol {
  grid-row: span 2;
  font-size: 29px;
}
.rate-symbol.high {
  color: #f04455;
}
.rate-symbol.low {
  color: #16c89b;
}
.rate-pair strong {
  font-size: 21px;
  font-weight: 500;
  white-space: nowrap;
}
.rate-pair small {
  margin-left: 4px;
  font-size: 11px;
}
.rate-pair em {
  font-style: normal;
  font-size: 12px;
}
.meter-pair {
  display: flex;
  justify-content: center;
  gap: 34px;
  margin-top: 20px;
}
.meter-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}
.meter {
  width: 92px;
  height: 46px;
  display: grid;
  place-items: center;
  border: 10px solid #e2e7ed;
  border-bottom: 0;
  border-radius: 60px 60px 0 0;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}
.meter::before {
  content: "";
  position: absolute;
  inset: -10px;
  border: 10px solid var(--meter-color);
  border-bottom: 0;
  border-radius: 60px 60px 0 0;
  clip-path: polygon(0 0, var(--meter-value) 0, var(--meter-value) 100%, 0 100%);
}
.meter span {
  position: relative;
  margin-top: 13px;
  font-size: 19px;
  font-weight: 600;
}
.meter small {
  font-size: 11px;
}
.meter-label {
  font-size: 12px;
}
.memory-pair {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 18px;
}
.memory-pair > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.memory-pair strong {
  font-size: 20px;
  font-weight: 500;
}
.memory-pair small {
  margin-left: 4px;
  font-size: 11px;
}
.memory-pair i {
  height: 14px;
  background: repeating-linear-gradient(90deg, #dfe4eb 0 5px, transparent 5px 8px);
  position: relative;
}
.memory-pair i::before {
  content: "";
  width: var(--fill);
  height: 100%;
  position: absolute;
  background: #21c79a;
}
.traffic-value {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 33px;
}
.traffic-value strong {
  font-size: 22px;
  font-weight: 500;
}
.traffic-value span {
  line-height: 1.55;
}
.traffic-value .drop-value {
  margin-left: auto;
  color: #ff6a4d;
}
.chart-panel {
  margin-top: 14px;
  min-height: 330px;
  border: 1px solid #d9dee6;
}
.chart-header {
  height: 54px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 18px;
  border-bottom: 1px solid #e0e4ea;
}
.chart-header strong {
  font-weight: 500;
}
.chart-range {
  margin-left: auto;
  color: #929daf;
  font-size: 12px;
}
.chart-content {
  display: grid;
  grid-template-columns: minmax(0, 2.1fr) minmax(260px, 1fr);
  gap: 24px;
  padding: 12px 18px 18px;
}
.chart-area {
  min-width: 0;
}
.chart-legend {
  min-height: 26px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  color: #66758a;
  font-size: 12px;
}
.chart-legend span,
.table-wrap td:first-child {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.chart-legend i,
.table-wrap td i {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.chart {
  height: 225px;
  display: flex;
  gap: 8px;
}
.y-axis {
  width: 54px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  padding: 6px 0 27px;
  box-sizing: border-box;
  color: #9aa5b6;
  font-size: 11px;
}
.plot-area {
  position: relative;
  min-width: 0;
  flex: 1;
  margin-bottom: 34px;
  min-height: 190px;
  overflow: visible;
}
.grid-lines {
  position: absolute;
  inset: 6px 0 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.grid-lines i {
  border-top: 1px solid #edf1f6;
}
.plot-svg {
  position: absolute;
  inset: 6px 0 0;
  width: 100%;
  height: calc(100% - 7px);
  overflow: visible;
  pointer-events: none;
}
.hover-guide {
  stroke: #8995a8;
  stroke-width: 1;
  stroke-dasharray: 4 3;
  vector-effect: non-scaling-stroke;
}
.hover-dot {
  stroke: #fff;
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
}
.chart-tooltip,
.mini-tooltip {
  position: absolute;
  z-index: 2;
  top: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 130px;
  max-width: 220px;
  padding: 8px 10px;
  transform: translateX(8px);
  border: 1px solid #e2e7ef;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 3px 12px rgba(35, 51, 75, 0.12);
  color: #526176;
  font-size: 11px;
  pointer-events: none;
}
.chart-tooltip strong {
  color: #344358;
  font-weight: 600;
}
.chart-tooltip span,
.mini-tooltip span {
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}
.chart-tooltip i,
.mini-tooltip i {
  width: 7px;
  height: 7px;
  flex: 0 0 7px;
  border-radius: 50%;
}
.x-axis {
  position: absolute;
  left: 0;
  right: 0;
  bottom: -31px;
  display: flex;
  justify-content: space-between;
  color: #9aa5b6;
  font-size: 11px;
}
.empty-chart {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #99a3b1;
}
.table-wrap {
  padding-top: 24px;
  overflow-x: auto;
}
.table-wrap table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 12px;
}
.table-wrap th {
  height: 36px;
  padding: 0 10px;
  background: #eaf0ff;
  font-weight: 600;
}
.table-wrap td {
  height: 36px;
  padding: 0 10px;
  border-bottom: 1px solid #eef1f5;
  white-space: nowrap;
}
.sort-mark {
  color: #9aa5b6;
}
.empty-row {
  text-align: center;
  color: #9aa5b6;
}
.extra-panel {
  margin-bottom: 14px;
}
.extra-chart-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  padding: 8px 18px 20px;
}
.mini-chart {
  min-width: 0;
  padding: 8px 14px 16px;
}
.mini-chart + .mini-chart {
  border-left: 1px solid #edf0f5;
}
.mini-chart h3 {
  margin: 0 0 12px;
  color: #536176;
  font-size: 13px;
  font-weight: 500;
}
.mini-plot {
  height: 176px;
  display: flex;
  gap: 8px;
}
.mini-y-axis {
  display: flex;
  flex: 0 0 38px;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  min-height: 0;
  padding: 0 0 2px;
  box-sizing: border-box;
}
.mini-y-label {
  display: block;
  max-width: 100%;
  line-height: 1;
  white-space: nowrap;
  color: #9aa5b6;
  font-size: 10px;
}
.mini-lines {
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: visible;
}
.mini-lines > i {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1px solid #edf1f6;
}
.mini-lines > i:nth-child(1) {
  top: 0;
}
.mini-lines > i:nth-child(2) {
  top: 50%;
}
.mini-lines > i:nth-child(3) {
  bottom: 0;
}
.mini-lines svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}
.mini-x-axis {
  display: flex;
  justify-content: space-between;
  margin: 6px 0 0 41px;
  color: #9aa5b6;
  font-size: 10px;
  white-space: nowrap;
}
.single-chart-content {
  grid-template-columns: 1fr;
}
.disk-chart-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
@media (max-width: 1180px) {
  .overview-bar {
    gap: 14px;
    overflow-x: auto;
  }
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
  .chart-content {
    grid-template-columns: 1fr;
  }
  .extra-chart-grid {
    grid-template-columns: 1fr;
  }
  .mini-chart + .mini-chart {
    border-left: 0;
    border-top: 1px solid #edf0f5;
  }
  .table-wrap {
    padding-top: 0;
  }
}
@media (max-width: 640px) {
  .dashboard {
    padding: 6px;
  }
  .overview-bar {
    padding: 10px;
    flex-wrap: wrap;
  }
  .overview-heading {
    min-width: auto;
  }
  .refresh-button {
    margin-left: 0;
  }
  .filter-panel {
    padding: 16px 12px;
  }
  .filter-row {
    gap: 8px;
    padding-right: 0;
  }
  .collapse-button {
    position: static;
    display: block;
    margin: 0 0 12px auto;
  }
  .instance-filter-row,
  .time-filter-row {
    margin-top: 12px;
  }
  .range-select {
    width: min(268px, calc(100% - 55px));
  }
  .metrics-panel {
    padding: 12px;
  }
  .metric-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .metric-card {
    min-height: 132px;
  }
  .chart-content {
    padding: 10px;
  }
  .chart-range {
    font-size: 10px;
  }
}
</style>
