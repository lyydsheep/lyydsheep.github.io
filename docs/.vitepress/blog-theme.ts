// 主题独有配置
import { getThemeConfig } from '@sugarat/theme/node'

// 开启RSS支持（RSS配置）
import type { Theme } from '@sugarat/theme'

const baseUrl = 'https://lyydsheep.github.io/'
const RSS: Theme.RSSOptions = {
  title: 'lyydsheep',
  baseUrl,
  copyright: 'Copyright (c) 2024-present, lyydsheep',
  description: '你的指尖,拥有改变世界的力量',
  language: 'zh-cn',
  image: 'https://lyydsheep.github.io/logo.png',
  favicon: 'https://lyydsheep.github.io/favicon.ico',
}

// 所有配置项，详见文档: https://theme.sugarat.top/
const blogTheme = getThemeConfig({
  // 开启RSS支持
  // RSS,

  // 搜索
  // 默认开启pagefind离线的全文搜索支持（如使用其它的可以设置为false）
  // search: false,

  // markdown 图表支持（会增加一定的构建耗时）
  // mermaid: true

  // 页脚
  // footer: {
  //   // message 字段支持配置为HTML内容，配置多条可以配置为数组
  //   // message: '下面 的内容和图标都是可以修改的噢（当然本条内容也是可以隐藏的）',
  //   copyright: 'MIT License | lyydsheep',
  //   // icpRecord: {
  //   //   name: '蜀ICP备19011724号',
  //   //   link: 'https://beian.miit.gov.cn/'
  //   // },
  //   // securityRecord: {
  //   //   name: '公网安备xxxxx',
  //   //   link: 'https://www.beian.gov.cn/portal/index.do'
  //   // },
  // },

  // 主题色修改
  themeColor: 'el-blue',

  // 文章默认作者
  author: 'lyydshepp',

  // 友链
  friend: [
    {
      nickname: 'saber',
      des: '哲学与人工智能',
      avatar:
        '4adfa94f441cc908e2d356e43fa5fd1](https://raw.githubusercontent.com/lyydsheep/pic/main/202409151116852.png',
      url: 'https://emisaber.github.io/White_Box/',
    },
  ],

  // 公告
  // popover: {
  //   title: '公告',
  //   body: [
  //     { type: 'text', content: '👇公众号👇---👇 微信 👇' },
  //     {
  //       type: 'image',
  //       src: 'https://img.cdn.sugarat.top/mdImg/MTYxNTAxODc2NTIxMA==615018765210~fmt.webp'
  //     },
  //     {
  //       type: 'text',
  //       content: '欢迎大家加群&私信交流'
  //     },
  //     {
  //       type: 'text',
  //       content: '文章首/文尾有群二维码',
  //       style: 'padding-top:0'
  //     },
  //     {
  //       type: 'button',
  //       content: '作者博客',
  //       link: 'https://sugarat.top'
  //     },
  //     {
  //       type: 'button',
  //       content: '加群交流',
  //       props: {
  //         type: 'success'
  //       },
  //       link: 'https://theme.sugarat.top/group.html',
  //     }
  //   ],
  //   duration: 0
  // },
})

export { blogTheme }
