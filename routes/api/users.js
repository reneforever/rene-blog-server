const Router = require('koa-router')
const router = new Router()
const bcrypt = require('bcryptjs')
const gravatar = require('gravatar')

const jwt = require('jsonwebtoken')
const keys = require('../../config/keys')
const passport = require('koa-passport');

// 引入User模型
const User = require('../../models/User')

// router.get('/test',async(ctx)=>{
//   ctx.status = 200
//   ctx.body = {
//     msg:'users works'
//   }
// })

const tools = require('../../config/tools')
// 注册接口
router.post('/register',async ctx=>{
  const findResult = await User.find({email:ctx.request.body.email})
  if(findResult.length>0){
    ctx.status = 500
    ctx.body = {
      email:'邮箱已被注册，请更换邮箱地址'
    }
  }else{
    const avatar = gravatar.url(ctx.request.body.email, { s: '200', r: 'pg', d: 'mm' });
    // 注册
      const newUser = new User({
        name:ctx.request.body.name,
        email:ctx.request.body.email,
        password:tools.enbcrypt(ctx.request.body.password),
        avatar:avatar
      })
      
      // 储存到数据库
      await newUser.save().then(user=>{
        ctx.body = user
      }).catch(err=>{
        console.log(err)
      })
      // 返回JSON数据
      ctx.body = newUser
    }
  })

// 登录接口
router.post('/login',async ctx=>{
  const findResult = await User.find({email:ctx.request.body.email})
  const user = findResult[0]
  const password = ctx.request.body.password

  if(findResult.length == 0){
    ctx.status = 404
    ctx.body = {email:'用户不存在'}
  }else{
    var result = await bcrypt.compareSync(password,user.password)
    if(result){

      // 返回token
      const payload = {id:user.id,name:user.name,avatar:user.avatar}
      const token = jwt.sign(payload,keys.secretOrkey,{expiresIn:3600})

      ctx.status = 200
      ctx.body = {success: true,token:'Bearer'+token}
    }else{
      ctx.status = 400
      ctx.body = {password:'密码错误'}
    }
  }
})
// 获取用户接口
router.get('/current',passport.authenticate('jwt',{session:false}),async ctx=>{
  ctx.body = {
    id: ctx.state.user.id,
    name:ctx.state.user.name,
    email:ctx.state.user.email,
    avatar:ctx.state.user.avatar
  }
})

module.exports = router.routes()