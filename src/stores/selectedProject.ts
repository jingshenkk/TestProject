import type { Project } from '@/mocks/projects';

/**
 * 「当前选中项目」记忆（模块级单例，非持久化）
 *
 * 为什么需要它：
 *   location.state 只在「带 state 的那次跳转」里有效。用户从视频页跳到首页/其它模块后，
 *   再从侧栏点「视频」回来时 state 已丢失，VideoPage 会误判为"未选择项目"而展示空态，
 *   丢失刚才选中的创作上下文。这里在内存里记住最近一次选中的项目作为回退值：
 *     - 点项目跳转 → 写入（最新意图优先）
 *     - 离开视频页再回来（无 state）→ 回退到记忆值，恢复创作界面
 *     - 直接从侧栏进入且从未选过 → 记忆为空 → 展示空态
 *   不写 sessionStorage / localStorage：刷新页面应回归"未选择"，避免凭空恢复一个旧项目。
 *
 * 注意：VideoPage 是路由级组件，每次进入会重新 mount，因此无需订阅、直接读取即可拿到最新值。
 */

let current: Project | null = null;

export function getSelectedProject(): Project | null {
  return current;
}

export function setSelectedProject(project: Project | null): void {
  current = project;
}