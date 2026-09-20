# 星屑回路 / Xingchen Huilu

Mobile-first original casual puzzle game.

- Exactly 3 levels: 入门 / 深思 / 1% 极限
- Core mechanic: visible layered stacks + 7-slot hand + three-of-a-kind collapse.
- Only the top available tile in each stack can be selected; choosing a tile exposes the layer below.
- Level 3 is a difficulty target, not a claimed measured 1% completion rate.
- **Level 3 is the final level. Completing it ends the run with a success celebration.**
- Public web build has no third-party ad SDK dependency.
- Static-hosting ready.

Production integration verified via Vercel Git deployment trigger.

## QA
```bash
npm test
```

## Deploy
Import the repository into Vercel as a static project. No build command is required.


## 移动端体验

项目包含 Web App Manifest，可在手机浏览器中添加到主屏幕，以更接近独立应用的启动体验。图标使用仓库内置的 SVG，不依赖第三方资源。

## Production deployment

The Vercel project is connected to this repository. Production deployments should be triggered by pushes to `main`.
