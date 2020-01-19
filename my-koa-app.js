const Koa = require('koa')
const app = new Koa()
const Router = require('koa-router')
const router = new Router()
const mongoose = require('mongoose')
const bodyparser = require('koa-bodyparser')
const admZip = require('adm-zip')
const zip = new admZip('test.docx')
var xmlreader = require("xmlreader");
var fs = require("fs");
mongoose.connect('mongodb://127.0.0.1/users', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}, (err) => {
  if (err) {
    console.log(err + "数据库连接失败");
  }
  console.log("数据库连接成功");
})

// var db = mongoose.connection;
// db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', function() {
//   // we're connected!
// });

let personSchema = new mongoose.Schema({
    name: String
  }, {
    versionKey: false
  } //不需要数据中'__v'字段
)

//将该docx解压到指定文件夹result下
zip.extractAllTo("./result", /*overwrite*/true);
let buf = fs.readFileSync("./result/word/document.xml", 'utf8');
xmlreader.read(buf, function(errors, res){
  if(null !== errors ){
    console.log(errors)
    return;
  }
  var textI = res['w:document']['w:body']['w:p'].array;
  var html='';
  var title ='';
  var xxA='';
  var xxB='';
  var xxC='';
  var xxD='';
  var answer='';
  for(var i =0;i<textI.length;i++){  
    if(textI[i]['w:r'] !== undefined){
      if(textI[i]['w:r'].array !== undefined) {
        console.log(i+':'+textI[i]['w:r'].array)
        var textJ = textI[i]['w:r'].array;
        for(var j =0;j<textJ.length;j++) { 
          if(textJ[j]['w:t'] !== undefined){
            html+= textJ[j]['w:t'].text()
          }      
        }
      } else {
        var textK = textI[i]['w:r']['w:t'];
          if(textK !== undefined){
            html+= textK.text()
          }      
      }
    }
      
  }
  console.log('html:'+html)
  // console.log( res.text())
  // console.log( res['w:document']['w:body']['w:p'].array[13]['w:r']['w:t'].text());
  // console.log( response.response.text());
});


let Person = mongoose.model('user', personSchema)
router.post('/users/addPerson', async function (ctx) {
  const person = new Person(ctx.request.body)
  console.log(person)
  let code
  let msg
  try {
    await person.save()
    code = 0
    msg = '添加成功'
  } catch (e) {
    code = -1
    msg = e
  }
  ctx.body = {
    code: code,
    msg: msg
  }
})

router.post('/users/getPerson', async function (ctx) {
  // const result = await Person.findOne({name: ctx.request.body.name})
  const results = await Person.find()
  ctx.body = {
    code: 0,
    // result,
    results
  }
})
router.post('/users', async (ctx, next) => {
  ctx.response.body = 'index'
  // await ctx.next()
})
// router.get('/users/:name',async (ctx, next) => {
//   var name = ctx.params.name;
//   ctx.response.body = `${name}`
//   // await ctx.next()
// })

app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(router.routes())
// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});
app.listen(3000);