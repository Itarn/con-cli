#!/usr/bin/env node

const program = require('commander')
const path = require('path')
const fs = require('fs')
const glob = require('glob') // npm i glob -D
const download = require('./download')
// 命令行工具
const inquirer = require('inquirer')
// 获取最新版本信息
const latestVersion = require('latest-version')
// 引入模版生成工具
const generator = require('./generator')
// 引入 ora 优化加载
const ora = require('ora')
// 优化终端显示效果
const chalk = require('chalk')
const logSymbols = require('log-symbols')
// 执行相关命令 提前获取 default 信息
// const execa = require('execa')
// 引入配置信息
const config = require('./config')

program.usage('<project-name>').parse(process.argv)

// let info = execa.shellSyn('git', ['config', 'user.name'])
// console.log(info)

// 根据输入，获取项目名称
let projectName = program.args[0]

if (!projectName) {  // project-name 必填
  // 相当于执行命令的--help选项，显示help信息，这是commander内置的一个命令选项
  program.help() 
  return
}

const list = glob.sync('*')  // 遍历当前目录
let rootName = path.basename(process.cwd())
if (list.length) {  // 如果当前目录不为空
  if (list.filter(name => {
      const fileName = path.resolve(process.cwd(), path.join('.', name))
      const isDir = fs.statSync(fileName).isDirectory()
      return name.indexOf(projectName) !== -1 && isDir
    }).length !== 0) {
    console.log(`项目${projectName}已经存在`)
    return
  }
  rootName = projectName
  next = Promise.resolve(projectName)
} else if (rootName === projectName) {
  rootName = '.'
  next = inquirer.prompt([
    {
      name: 'buildInCurrent',
      message: '当前目录为空，且目录名称和项目名称相同，是否直接在当前目录下创建新项目？',
      type: 'confirm',
      default: true
    }
  ]).then(answer => {
    return Promise.resolve(answer.buildInCurrent ? '.' : projectName)
  })
} else {
  rootName = projectName
  next = Promise.resolve(projectName)
}

next && go()

function go () {
  next.then(projectRoot => {
    if (projectRoot !== '.') {
      fs.mkdirSync(projectRoot)
    }
    return download(projectRoot, config.url).then(target => {
      return {
        name: projectRoot,
        root: projectRoot,
        downloadTemp: target
      }
    })
  }).then(context => {
    // 命令行 输入选项配置
    return inquirer.prompt(config.inquirerOptions(context))
      .then(answers => {
        const spinner = ora()
        spinner.start('正在获取当前 GeekCon UI版本...')
        console.log(answers)
        return latestVersion('ainialannpm').then(version => {
          spinner.succeed('当前 GeekCon UI版本为：' + version)
          answers.projectVersion = version
          return {
            ...context,
            metadata: {
              ...answers
            }
          }
        })
      .catch(err => {
        spinner.fail('获取 GeekCon 失败')
        return Promise.reject(err)
      })
    })
  }).then(context => {
    // 添加生成的逻辑
    return generator(context.metadata, context.downloadTemp, context.root).then(() => {
      return {
        ...context
      }
    }).catch(err => {
      return Promise.reject(err)
    })
  }).then(context => {
    // 成功用绿色显示
    console.log(logSymbols.success, chalk.green('创建成功:)'))
    console.log()
    console.log(chalk.green('cd ' + context.root + '\nnpm install\nnpm run dev'))
  }).catch(err => {
    // 失败了用红色，增强显示
    console.error(logSymbols.error, chalk.red(`创建失败：${err.message}`))
  })
}