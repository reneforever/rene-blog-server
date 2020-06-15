const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const mongoose = require('mongoose')

const passport = require('koa-passport')
app.use(passport.initialize())
app.use(passport.session())

require('./config/passport')(passport)

// 配置跨域
const cors = require('koa2-cors')
app.use(cors())

const Router = require('koa-router')
const router = new Router()
router.get('/',async(ctx)=>{
  ctx.body={
    msg:'hello world'
  }
})


const users = require('./routes/api/users')


// 配置云端mongodb数据库
const db = require('./config/keys.js').mongoURI;
mongoose
  .connect(db,{useNewUrlParser:true,useUnifiedTopology:true})
  .then(()=>{
    console.log('MongoDB Connected...')
  })
  .catch(err=>{
    console.log(err)
  })

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form',  'text']       
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))


// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

// routes
app.use(router.routes(), router.allowedMethods())

// 配置路由地址
router.use('/api/users',users)

// port
const port = process.env.PORT || 5000
app.listen(port,()=>{
  console.log(`server running at ${port}`)
})

module.exports = app
