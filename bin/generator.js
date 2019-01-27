const Metalsmith = require('metalsmith')
const Handlebars = require('handlebars')
const path = require('path')
const fs = require('fs')
const minimatch = require('minimatch')
const rm = require('rimraf').sync


Handlebars.registerHelper('compare', function(v1, v2, options){
  if(v1 == v2){
    //满足添加继续执行
    return options.fn(this)
  }else{
    //不满足条件执行{{else}}部分
    return options.inverse(this)
 }
})

module.exports = function (metadata = {}, src = './src', dest = '.') {
  if (!src) {
    return Promise.reject(new Error(`无效的source：${src}`))
  }
  
  return new Promise((resolve, reject) => {
    const metalsmith = Metalsmith(process.cwd())
      .metadata(metadata)
      .clean(false)
      .source(src)
      .destination(dest)
    
      // 判断下载的项目模板中是否有 .templateignore
      const ignoreFile = path.join(src, '.templateignore')
      if (fs.existsSync(ignoreFile)) {
        const meta = metalsmith.metadata()
        // 先对ignore文件进行渲染，然后按行切割ignore文件的内容，拿到被忽略清单
        const ignores = Handlebars.compile(fs.readFileSync(ignoreFile).toString())(meta)
          .split('\n').filter(item => !!item.length)
        console.log(meta)
        console.log('ignores')
        console.log(ignores)
        metalsmith.use((files, metalsmith, done) => {
          Object.keys(files).forEach(fileName => {
            // 移除被忽略的文件
            ignores.forEach(ignorePattern => {
              if (minimatch(fileName, ignorePattern)) {
                delete files[fileName]
              }
            })
          })
          done()
        })
      }

      metalsmith.use((files, metalsmith, done) => {
        const meta = metalsmith.metadata()
        // console.log('--- meta ---')
        // console.log(meta)
        // 判断是否有 .needrender 文件
        const needRenderFile = path.join(src, '.needrender')
        if (fs.existsSync(needRenderFile)) {
          const needRenderFiles = fs.readFileSync(needRenderFile).toString().split('\n').filter(item => !!item.length)
          needRenderFiles.forEach(needfilename => {
            if (files[needfilename]) {
              const t = files[needfilename].contents.toString()
              files[needfilename].contents = new Buffer(Handlebars.compile(t)(meta))
            }
          })
        }
        // if (fs.existsSync(ignoreFile)) {
        //   // 定义一个用于移除模板中被忽略文件的metalsmith插件
        //   metalsmith.use((files, metalsmith, done) => {
        //     // const meta = metalsmith.metadata()
        //     // // 先对ignore文件进行渲染，然后按行切割ignore文件的内容，拿到被忽略清单
        //     // const ignores = Handlebars.compile(fs.readFileSync(ignoreFile).toString())(meta).split('\n').filter(item => !!item.length)
        //     Object.keys(files).forEach(fileName => {
        //       // 移除被忽略的文件
        //       ignores.forEach(ignorePattern => {
        //         if (minimatch(fileName, ignorePattern)) {
        //           delete files[fileName]
        //         }
        //       })
        //     })
        //     done()
        //   })
        // }
        // Object.keys(files).forEach(fileName => {
        //   const t = files[fileName].contents.toString()
        //   console.log('--- t ---')
        //   console.log(fileName)
        //   // console.log(files[fileName].contents)
        //   // console.log(Handlebars.compile(t)(meta))
        //   files[fileName].contents = new Buffer(Handlebars.compile(t)(meta))
        // })
      	done()
      }).build(err => {
      	rm(src)
      	err ? reject(err) : resolve()
      })
  })
}
