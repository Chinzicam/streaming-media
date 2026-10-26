# 视频流媒体数据转发终端

## 离线演示包

页面使用本地模拟数据，不需要连接设备或后端服务。制作离线演示包时，在项目目录执行：

```powershell
pnpm install
pnpm run build:demo
```

构建完成后，将生成的 `demo-package` 文件夹整体压缩并交给演示者。对方无需安装 Node.js，解压后双击其中的 `index.html` 即可在浏览器中查看。请不要只发送 `index.html`，页面还需要同目录下的 `css`、`js`、`img` 等构建资源。

演示登录账号：`admin`，密码：`FjRh@root!2012`。

## 开发

```powershell
pnpm install
pnpm run serve
```

## 设备部署构建

普通构建仍使用设备部署路径 `/up/`：

```powershell
pnpm run build
```
