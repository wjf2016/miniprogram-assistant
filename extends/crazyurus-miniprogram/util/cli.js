const vscode = require('vscode')
const path = require('path')
const fs = require('fs-extra')
const { exec } = require('child_process')
const util = require('./index')
const { getRootPath, getProjectConfig } = util

// 获取微信开发者工具的cli路径
function getMiniprogramCliPath(context) {
  let miniprogramCliPath = context.workspaceState.get('miniprogramCliPath')

  return new Promise((resolve, reject) => {
    if (!miniprogramCliPath || !fs.pathExistsSync(miniprogramCliPath)) {
      vscode.window
        .showOpenDialog({
          canSelectFiles: false,
          canSelectFolders: true,
          canSelectMany: false,
          openLabel: '请选择微信开发者工具安装目录',
        })
        .then((uri) => {
          // 用户取消选择
          if (!uri) {
            reject('用户取消选择')
            return
          }

          miniprogramCliPath = path.join(uri[0].fsPath, 'cli.bat')
          context.workspaceState.update(
            'miniprogramCliPath',
            miniprogramCliPath,
          )
          resolve(miniprogramCliPath)
        })

      return
    }

    resolve(miniprogramCliPath)
  })
}

function activate(context) {
  // 构建npm
  vscode.commands.registerCommand('miniprogramAssistant.npm', async () => {
    const projectConfig = getProjectConfig()

    if (!projectConfig) {
      vscode.window.showErrorMessage('请打开微信小程序项目！')
      return
    }

    await vscode.window.withProgress(
      {
        title: '正在构建npm',
        location: vscode.ProgressLocation.Notification,
      },
      async () => {
        const miniprogramCliPath = await getMiniprogramCliPath(context)
        const rootPath = getRootPath()
        const command = `"${miniprogramCliPath}" build-npm --project "${rootPath}"`

        return new Promise((resolve, reject) => {
          exec(command, (error, stdout, stderr) => {
            if (error) {
              // 构建失败
              vscode.window.showErrorMessage('构建失败！')
              resolve()
              return
            }

            vscode.window.showInformationMessage(`构建成功！`)
            resolve()
          })
        })
      },
    )
  })

  // 编译
  vscode.commands.registerCommand('miniprogramAssistant.compile', async () => {
    const projectConfig = getProjectConfig()

    if (!projectConfig) {
      vscode.window.showErrorMessage('请打开微信小程序项目！')
      return
    }

    const miniprogramProjectName = decodeURIComponent(projectConfig.projectname)
    const rootPath = getRootPath()
    const vscodeProjectName = path.basename(rootPath)
    const command = `"${path.join(
      path.dirname(__filename),
      '../bin/miniprogram-compile.exe',
    )}" {miniprogramProjectName="${miniprogramProjectName}";vscodeProjectName="${vscodeProjectName}"}`

    exec(command, (error, stdout, stderr) => {
      if (error) {
        // 编译失败
        vscode.window.showErrorMessage('编译失败！')
        return
      }

      vscode.window.showInformationMessage(`已发送编译命令！`)
    })
  })

  // 预览
  vscode.commands.registerCommand('miniprogramAssistant.preview', async () => {
    const projectConfig = getProjectConfig()

    if (!projectConfig) {
      vscode.window.showErrorMessage('请打开微信小程序项目！')
      return
    }

    const tmpDir = path.join(path.dirname(__filename), '../tmp')
    const base64Txt = path.join(tmpDir, `${projectConfig.appid}.txt`)
    const miniprogramCliPath = await getMiniprogramCliPath(context)
    const rootPath = getRootPath()
    const command = `"${miniprogramCliPath}" preview --project "${rootPath}" --qr-format base64 --qr-output "${base64Txt}"`

    vscode.window.withProgress(
      {
        title: '正在预览小程序',
        location: vscode.ProgressLocation.Notification,
      },
      () => {
        fs.ensureDirSync(tmpDir)

        return new Promise((resolve, reject) => {
          exec(command, async (error, stdout, stderr) => {
            if (error) {
              // 预览失败
              vscode.window.showErrorMessage('预览失败！')
              resolve()
              return
            }

            resolve()

            vscode.window.showInformationMessage('预览成功！')

            const webiewPanel = vscode.window.createWebviewPanel(
              Date.now().toString(),
              '预览二维码',
              vscode.ViewColumn.Two,
              {
                enableScripts: true,
                retainContextWhenHidden: true,
              },
            )

            const base64TStr = fs.readFileSync(base64Txt, 'utf8')
            webiewPanel.webview.html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            html, body {
              height: 100%;
              width: 100%;
              box-sizing:border-box;
              margin:0;
              padding: 0;
              background-color:#fff;
              display:flex;
              align-items:center;
              justify-content:center;
            }
          </style>
        </head>
        <body>
          <img src="data:image/png;base64,${base64TStr}" alt="" />
        </body>
      </html>
    `
          })
        })
      },
    )
  })

  // 上传
  vscode.commands.registerCommand('miniprogramAssistant.upload', async () => {
    const projectConfig = getProjectConfig()

    if (!projectConfig) {
      vscode.window.showErrorMessage('请打开微信小程序项目！')
      return
    }

    const previousVersion = context.workspaceState.get('previousVersion')

    const version = await vscode.window.showInputBox({
      prompt: '请输入版本号',
      placeHolder:
        '请输入版本号，' +
        (previousVersion ? '当前版本：' + previousVersion : '如：1.2.3'),
      value: previousVersion || '',
    })

    if (!version) {
      return
    }

    context.workspaceState.update('previousVersion', version)

    const previousDescription = context.workspaceState.get(
      'previousDescription',
    )

    const description = await vscode.window.showInputBox({
      prompt: '请输入项目备注',
      placeHolder: '请输入项目备注（选填）',
      value: previousDescription || '',
    })

    if (!description) {
      return
    }

    context.workspaceState.update('previousDescription', description)

    await vscode.window.withProgress(
      {
        title: '正在上传小程序',
        location: vscode.ProgressLocation.Notification,
      },
      async () => {
        const miniprogramCliPath = await getMiniprogramCliPath(context)
        const rootPath = getRootPath()
        const command = `"${miniprogramCliPath}" upload --project "${rootPath}" -v "${version}" -d "${description}"`

        return new Promise((resolve, reject) => {
          exec(command, async (error, stdout, stderr) => {
            if (error) {
              // 上传失败
              vscode.window.showErrorMessage('上传失败！')
              resolve()
              return
            }

            resolve()

            const result = await vscode.window.showInformationMessage(
              '上传成功，可前往微信小程序后台提交审核并发布',
              '打开微信小程序后台',
            )

            switch (result) {
              case '打开微信小程序后台':
                vscode.env.openExternal('https://mp.weixin.qq.com/')
                break
              default:
                break
            }
          })
        })
      },
    )
  })
}

module.exports = {
  activate,
}
