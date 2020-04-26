# miniprogram-assistant README

小程序助手，提升微信小程序开发体验

## 特性

- 整合“[wxml](https://marketplace.visualstudio.com/items?itemName=cnyballk.wxml-vscode)、[minapp](https://marketplace.visualstudio.com/items?itemName=qiu8310.minapp-vscode)、[小程序自定义组件标签跳转到文件](https://marketplace.visualstudio.com/items?itemName=wjf.minapp-comp-definition)”三大 vscode 扩展的功能，同时这几个扩展有重复的功能时，只启用其中最优的一个，并对几个扩展做最优配置。后续将对本扩展本身进行不断优化和加入更多的原创功能.

- 在自定义组件标签内，按空格键将显示该组件的属性和事件建议，光标选中建议时将显示该建议的源码.

- 增加两个命令：“创建小程序页面”和“创建小程序组件”，在资源管理器中右键目录时，会显示这两个菜单。运行命令后会按照模板创建相应的文件。可自定义模板来源目录，具体请看扩展介绍页面的“功能贡献”菜单

- 增加两个命令：“转为驼峰命名”和“转为下划线命名”，在文档中选中需要转换的文字，右键菜单执行“转为驼峰命名”或“转为下划线命名”即可进行转换

- 增加小程序开发相关命令：“构建”、“编译”、“预览”、“上传”，这几个命令只在 windows 系统下可用。使用编译命令时，必须先使用微信开发者工具打开相关项目。相关命令在资源管理器下面的“微信小程序”栏中显示

- 增加微信小程序开发相关的 snippets

# Changelog

## [0.0.5] - 2020-4-26

### Added

- 增加小程序开发相关命令：“构建”、“编译”、“预览”、“上传”，这几个命令只在 windows 系统下可用。使用编译命令时，必须先使用微信开发者工具打开相关项目。相关命令在资源管理器下面的“微信小程序”栏中显示
- 增加微信小程序开发相关的 snippets

## [0.0.3] - 2020-4-22

### Added

- 增加两个命令：“创建小程序页面”和“创建小程序组件”，在资源管理器中右键目录时，会显示这两个菜单。运行命令后会按照模板创建相应的文件。可自定义模板来源目录，具体请看扩展介绍页面的“功能贡献”菜单
- 增加两个命令：“转为驼峰命名”和“转为下划线命名”，在文档中选中需要转换的文字，右键菜单执行“转为驼峰命名”或“转为下划线命名”即可进行转换

## [0.0.2] - 2020-4-21

### Fixed

- 修复扩展打包后依赖异常的问题

### Added

- 在自定义组件标签内，按空格键将显示该组件的属性和事件建议，光标选中建议时将显示该建议的源码.

### Changed

- 更换扩展图标

## [0.0.1] - 2020-4-20

### Added

- 整合“[wxml](https://marketplace.visualstudio.com/items?itemName=cnyballk.wxml-vscode)、[minapp](https://marketplace.visualstudio.com/items?itemName=qiu8310.minapp-vscode)、[小程序自定义组件标签跳转到文件](https://marketplace.visualstudio.com/items?itemName=wjf.minapp-comp-definition)”三大 vscode 扩展的功能，同时这几个扩展有重复的功能时，只启用其中最优的一个，并对几个扩展做最优配置.后续将对这个扩展本身进行不断优化和加入更多的原创功能.
