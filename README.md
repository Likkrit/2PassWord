# 2PassWord

管理和自动填写网站账号密码的Chrome插件，使用BaaS、AES加密保存不同网站的账号密码。

背景
-------
为了安全起见，不同网站的会使用不同的账号密码，但是当网站或APP数量越来越多的时候，账号密码越来越记错。2password就是用于解决数量繁多的网站账号密码不一致的问题。

说明
-------
2password是一个账号密码备忘录，它用AES将数据加密后储存在你的云数据库中，不在本地留下数据。并且，这个云数据库是你自己的。

**特点:**

1. 使用免费的Google Firebase或着野狗云作为云数据库。

2. 所有数据使用AES算法加密。

3. 账号密码不存储在本地和浏览器，电脑丢失也不会泄露数据。

4. 不通过浏览器的自动填充方式自动填写表单。

用法
-------
1. 下载或Clone整个项目，Chrome扩展程序中点击开发者模式，导入项目文件夹。

2. 在Google Firebase或野狗云注册一个账号，创建一个应用，在应用规则中加入以下规则。

```json
{
  "rules": {
      "$user": {
        ".read": true,
        ".write": true
      }
    }
}
```

3. 进入2PassWord选项，将创建的应用地址填入地址栏中，例如`https://2passowrd.firebaseio.com/2passowrd`，最后设置一个自定义密码。

### 更新日志

**0.2.4**

- 更新设置页面  
- 逻辑优化  
- 更新说明文档

**0.2.2 - 0.2.3**

- 逻辑优化

**0.2.1**

- 增加手势密码

Todo
-------
- 增加手势密码出现频率设置  
- 完善手势密码  
- 逻辑优化
