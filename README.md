# 视频流媒体数据转发终端

## 离线演示版

项目页面使用本地模拟数据，制作完成后，演示者不需要安装 Node.js。

在开发机项目目录执行：

```powershell
pnpm install
pnpm run build:demo
```

命令会生成 `demo-package` 文件夹。将整个文件夹压缩后交付，演示者解压并双击其中的 `index.html` 即可打开。请保留 `css`、`js`、`img`、`static` 等同级资源目录，不要只发送 `index.html`。

离线演示使用相对资源路径和 hash 路由，适合直接通过 `file:///` 打开；页面跳转和刷新不依赖本地 Node 服务。


## 开发运行

```powershell
pnpm install
pnpm run serve
```

## 设备部署构建

普通构建保留设备部署路径 `/up/`：

```powershell
pnpm run build
```
