# 照片库移动端应用

基于React Native和Expo开发的照片库移动端应用，与Django后端完全兼容。

## 功能特性

### 已实现功能
- ✅ 用户登录认证
- ✅ JWT Token自动刷新
- ✅ 图片浏览（网格视图）
- ✅ 图片详情查看
- ✅ 个人资料管理
- ✅ 响应式设计
- ✅ 离线Token存储

### 待实现功能
- 🔄 图片上传
- 🔄 图片分组管理
- 🔄 搜索和过滤
- 🔄 图片编辑
- 🔄 分享功能

## 技术栈

- **React Native**: 跨平台移动应用开发
- **Expo**: 开发工具链和平台
- **TypeScript**: 类型安全的JavaScript
- **Redux Toolkit**: 状态管理
- **React Navigation**: 导航系统
- **Axios**: HTTP客户端
- **Expo SecureStore**: 安全存储

## 项目结构

```
mobile/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── ImageGrid.tsx
│   │   └── LoadingSpinner.tsx
│   ├── navigation/          # 导航配置
│   │   └── AppNavigator.tsx
│   ├── screens/            # 页面组件
│   │   ├── LoginScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── GalleryScreen.tsx
│   │   ├── ImageDetailScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/           # API服务
│   │   └── api.ts
│   ├── store/              # Redux状态管理
│   │   ├── index.ts
│   │   ├── hooks.ts
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       ├── imagesSlice.ts
│   │       └── groupsSlice.ts
│   ├── types/              # TypeScript类型定义
│   │   └── index.ts
│   └── utils/              # 工具函数
│       └── index.ts
├── App.tsx                 # 应用入口
└── package.json
```

## 开发环境要求

- Node.js 18+
- npm 或 yarn
- Expo CLI
- 运行中的Django后端服务

## 安装和运行

### 1. 安装依赖

```bash
cd mobile
npm install
```

### 2. 配置API地址

编辑 `src/services/api.ts` 文件，修改 `BASE_URL` 为你的后端服务地址：

```typescript
const BASE_URL = 'http://你的后端地址:8000'; // 例如: http://192.168.1.100:8000
```

### 3. 启动开发服务器

```bash
npm start
```

### 4. 运行应用

选择你的目标平台：

- **Web**: 按 `w` 键或访问 http://localhost:8081
- **iOS模拟器**: 按 `i` 键
- **Android模拟器**: 按 `a` 键
- **物理设备**: 使用Expo Go app扫描二维码

## API配置

移动端应用需要连接到Django后端。确保：

1. Django服务正在运行
2. CORS设置允许移动端访问
3. API地址在 `src/services/api.ts` 中正确配置

### Django CORS设置

在Django的 `settings.py` 中添加：

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",  # Expo Web
    "http://127.0.0.1:8081",
]

# 或者在开发环境中允许所有来源
CORS_ALLOW_ALL_ORIGINS = True  # 仅在开发环境使用
```

## 使用说明

### 1. 登录
- 打开应用后自动显示登录页面
- 使用你在Web端创建的账户登录
- 支持用户名和密码登录

### 2. 浏览图片
- 登录后进入主页，显示最近上传的图片
- 点击"查看所有图片"进入画廊页面
- 支持查看所有图片或仅查看我的图片

### 3. 查看图片详情
- 点击任意图片进入详情页面
- 显示图片的完整信息和元数据
- 支持查看大图

### 4. 个人资料
- 在主页点击"个人资料"按钮
- 查看账户信息和统计数据
- 支持退出登录

## 开发指南

### 添加新功能

1. **新增屏幕**：
   - 在 `src/screens/` 目录下创建新组件
   - 在 `src/types/index.ts` 中添加导航参数
   - 在 `src/navigation/AppNavigator.tsx` 中注册路由

2. **新增API接口**：
   - 在 `src/services/api.ts` 中添加新的API方法
   - 在相应的Redux slice中添加异步action

3. **新增组件**：
   - 在 `src/components/` 目录下创建可复用组件
   - 遵循TypeScript类型规范

### 状态管理

使用Redux Toolkit进行状态管理：

```typescript
// 在组件中使用
const dispatch = useAppDispatch();
const user = useAppSelector(selectUser);

// 调用API
dispatch(fetchImages());
```

### 导航

使用React Navigation进行页面导航：

```typescript
// 导航到其他页面
navigation.navigate('ImageDetail', { imageId: 123 });

// 返回上一页
navigation.goBack();
```

## 构建和部署

### 构建APK (Android)

```bash
expo build:android
```

### 构建IPA (iOS)

```bash
expo build:ios
```

### 发布到应用商店

参考 [Expo发布指南](https://docs.expo.dev/distribution/introduction/)

## 故障排除

### 常见问题

1. **无法连接到后端**
   - 检查API地址配置
   - 确保后端服务正在运行
   - 检查CORS设置

2. **登录失败**
   - 确认用户名和密码正确
   - 检查后端认证API是否正常

3. **图片无法加载**
   - 检查图片URL是否可访问
   - 确认网络连接正常

4. **开发服务器启动失败**
   - 清除缓存：`expo start -c`
   - 重新安装依赖：`rm -rf node_modules && npm install`

### 调试技巧

1. **启用Redux DevTools**：
   - 安装Redux DevTools扩展
   - 在Web版本中查看状态变化

2. **网络请求调试**：
   - 在浏览器开发者工具中查看网络请求
   - 检查API响应和错误信息

3. **控制台日志**：
   - 使用 `console.log()` 输出调试信息
   - 在Expo DevTools中查看日志

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交Issue或联系开发团队。
