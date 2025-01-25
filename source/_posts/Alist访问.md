---
publish: true
---



一般地，点击一个视频是不会加载成功的，就像这样子：

<img src="https://raw.githubusercontent.com/lyydsheep/pic/main/202410191901690.png" alt="image-20241019190139605" style="zoom:50%;" />

这是因为**Alist挂载的是百度云盘，而百度云盘会在处理请求时会先进行身份校验**。一般身份校验操作都会针对**jwt-token、请求头中的User-Agent字段**进行验证。

上述视频无法加载成功的原因就是**User-Agent字段**设置错误。那么我们只需要将**User-Agent字段设置为`pan.baidu.com`就能在线播放视频啦**~~（Alist官网官方文档告诉我的🤪）~~

具体操作（以edge浏览器为例）：

- 按下键盘`F12`，呼出开发者工具
  - <img src="https://raw.githubusercontent.com/lyydsheep/pic/main/202410191910833.png" alt="image-20241019191014765" style="zoom:50%;" />

- 点击网络状况（关键是找到这个🛜+⚙️的图标）
  - <img src="https://raw.githubusercontent.com/lyydsheep/pic/main/202410191913926.png" style="zoom:50%;" />

- 取消勾选`Use browse default`，并将字段值自定义为`pan.baidu.com`。最终结果如下图
  - <img src="https://raw.githubusercontent.com/lyydsheep/pic/main/202410191916203.png" alt="image-20241019191634164" style="zoom: 67%;" />

- 修改完后刷新（**刷新时不要关闭开发者工具**）即可播放。若后续仍出现不可播放的情况，请检查`User-Agent`是否为`pan.baidu.com`
  - <img src="https://raw.githubusercontent.com/lyydsheep/pic/main/202410191920677.png" alt="image-20241019192045600" style="zoom:50%;" />

