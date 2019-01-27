const year = new Date().getFullYear()

module.exports = {
  url: 'github:ainialan6/testTemplate',
  // url: 'gitlab:http://git.geekbang.org:FE/con-common-web#geekcon',
  inquirerOptions: function (context) {
    return [
      {
        name: 'projectName',
        message: 'Project name',
        default: context.name
      }, {
        name: 'projectDescription',
        message: 'Project description',
        default: `A GeekCon project base in Vue`
      }, {
        name: 'projectAuthor',
        message: 'Author',
        default: 'Alan' // TODO: 提前获取 git 账号
      }, {
        type: 'list',
        name: 'con',
        message: 'Which the following conference will you init?',
        choices: [{
          name: 'QCon',
          value: 'qcon'
        }, {
          name: 'ArcSummit',
          value: 'as'
        }]
        // filter: function(val) {
        //   return val.toLowerCase();
        // }
      }, {
        type: 'list',
        name: 'location',
        message: 'Where the conference will be held in?',
        choices: [{
          name: '北京',
          value: 'bj'
        }, {
          name: '上海',
          value: 'sz'
        }, {
          name: '广州',
          value: 'gz'
        }],
        when: function (answers) {
          if (answers.con === 'qcon') {
            return true
          }
        }
      }, {
        type: 'list',
        name: 'location',
        message: 'Where the conference will be held in?',
        choices: [{
          name: '北京',
          value: 'bj'
        }, {
          name: '深圳',
          value: 'sz'
        }],
        when: function (answers) {
          if (answers.con === 'as') {
            return true
          }
        }
      }, {
        name: 'year',
        message: 'What is the number of sessions of the conference?',
        default: year
      }]
  }
}