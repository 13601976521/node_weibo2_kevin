//import some libs
var express = require('express');
var cons = require('consolidate');
var wb = require('../lib/index.js');
var path=require("path")
var opts = {
    app_key       :  '1022947355' ,
    app_secret    :  '1655077069f3b4458e625906e4404d20' ,
    redirect_uri :   'http://www.coolbird.net:800/callback'
}; 
//init express app
var app = express();
app.use(express.logger({
    format: ':method :url :status'
}));  
//设置文件上传临时文件夹
app.use(express.bodyParser({
    uploadDir:'./uploads'
})); 
app.use(express.cookieParser());
app.use(express.session({
    secret: 'yutou'
}));
app.use(app.router);
app.use(express.errorHandler({
    dumpExceptions: true, 
    showStack: true
}));
app.error=function(err, req, res){
    console.log("500:" + err + " file:" + req.url)
    res.render('500');
}
//设置模板引擎为mustache，这里使用了consolidate库
app.engine("html", cons.mustache);
//设置模板路径
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.set('view options', {
    layout: false
})   
//静态图片服务 

//获取authorize url
app.get("/auth",function(req, res,next) {
    var api = new wb(opts);
    var auth_url = api.oauth.authorize({});
    res.redirect(auth_url);
   // res.end(auth_url);
})
//获取accesstoken ,存储，并设置userid到cookie
app.get("/callback",function(req, res, query_info) {
    var code = req.query.code;
    if(!code) {
        res.redirect('/?error=授权失败，请重试！（code获取失败）');
        return;
    }; 
    var api = new wb(opts);
    api.oauth.accesstoken(code,function(error,data) { 
        console.log(data)
        var access_token=data.access_token;
        var uid=data.uid;
        //{"access_token":"2.00wVkPsB0kPDjGcb5104c462mM_CpC","remind_in":"157679999","expires_in":157679999,"uid":"1717808700"}
    //获取用户完整信息
    //  req.session.oauthUser=JSON.parse(data)
    res.cookie('token',access_token);
       console.log(data)
       res.redirect("/oauth")
    }
    );
//  res.end()
})
app.get("/oauth",function(req,res){
console.log(req.cookies.token)
var api = new wb({
    app_key       :  '1022947355' ,
    app_secret    :  '1655077069f3b4458e625906e4404d20' ,
    redirect_uri :  'http://www.coolbird.net:8000/callback'
});
api.statuses.upload({
    access_token:req.cookies.token,
    status:"test,",
    pic:path.join(__dirname, "/test.jpg")
},function(error,data){
    console.log(data)
})
res.render("oauth.html")
})
//首页代码
app.get('/', function(req, res){
    res.render('index.html',{
        data:{
            error:req.query.error
        }
    });
});

app.listen(800, function() {
    console.log('app starting');
    console.log('Express server listening on port 800');
});