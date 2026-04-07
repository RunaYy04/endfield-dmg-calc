<div align="center">
<img alt="logo" height="100" width="100" src="public/favicon.png" />
<h2> Endfield DPS Calculator </h2>
<p> 专为《明日方舟：终末地》打造的数据计算与排轴工具 </p>

<br />

</div>

![main](/screenshots/main.png)
<p align="center" style="
    background-image: linear-gradient(120deg, #fccb90 0%, #d57eeb 100%);
    -webkit-background-clip: text; 
    background-clip: text;
    color: transparent; 
    font-size: 14px;
    font-weight: bold;
    display: inline-block;
    width: 100%;
">
  <i> 这是洁哥,她很可爱 </i>
</p>

## 说明

- 本项目采用 [Vue 3](https://cn.vuejs.org/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vitejs.dev/) + [Pinia](https://pinia.vuejs.org/) + [Naïve UI](https://www.naiveui.com/) 开发
- Node.js 版本要求：>= 22.x，包管理器推荐：npm >= 8
- 核心功能基于本地浏览器计算，排轴与装备数据暂时保存在浏览器本地状态中。

## 交流与反馈

欢迎在 GitHub Issues 中提出您的建议、反馈 Bug，或是提供新的干员/装备数据推导公式。

## Demo

- 在线演示：[Endfield DPS Calculator](https://dps.072104.xyz/)

## 功能

- 动态排轴系统：为每个输出动作配置段数、技能类型及临时增益
- 装备锻造：支持自由录入自定义武器、护甲、配件与基础面板数据
- 增益调配：自定义战术增益乘区（额外暴击、易伤、脆弱、减抗等）
- 装备与增益实时同步至计算器下拉列表
- 支持多条时间轴（Timeline）的创建、复制

## 界面展示


<details>
<summary> 伤害计算与排轴面板 </summary>

![排轴面板](/screenshots/calculator.png)

</details>

<details>
<summary> 添加装备 </summary>

![添加装备](/screenshots/equipment.png)

</details>

<details>
<summary> 调配增益 </summary>

![调配增益](/screenshots/buff.png)

</details>


## 部署

本项目为纯前端项目，可轻松部署在任意静态托管平台上。

### Vercel / Netlify 部署

1. 点击本仓库右上角的 `Fork`，复制本仓库到你的 `GitHub` 账号
2. 在 Vercel / Netlify 等平台中导入该仓库
3. 框架预设选择 `Vite` 或 `Vue`
4. 构建命令 (Build Command) 填写为：`npm run build`
5. 输出目录 (Output Directory) 填写为：`dist`
6. 点击 `Deploy`，即可成功部署

### 本地构建部署

1. 环境依赖：`Node.js`（>= 22.x）以及 `npm`
2. 拉取仓库至本地并安装依赖：`npm install`
3. 编译打包：`npm run build`
4. 将生成的 `dist` 目录下的所有文件上传至您的 Web 服务器（如 Nginx, Apache）即可访问。


## 鸣谢

- 数据及逻辑来源参考自 B站 UP主 [@片雲](https://space.bilibili.com/112745) 的 Endfield伤害期望计算器
- 感谢《明日方舟：终末地》及上海鹰角网络科技有限公司带来的优秀游戏作品。

## 许可证

- 本项目基于 [MIT License](https://opensource.org/licenses/MIT) 许可进行开源

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=RunaYy04/endfield-calc&type=Date)](https://star-history.com/#RunaYy04/endfield-calc&Date)
