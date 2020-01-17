const Koa = require('koa')
const app = new Koa()
const Router = require('koa-router')
const router = new Router()
const mongoose = require('mongoose')
const bodyparser = require('koa-bodyparser')
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