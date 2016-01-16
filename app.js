'use strict';

const fetch=require('node-fetch');
const app=require('koa')();
const router =require('koa-router')();
const render=require('koa-swig');
const cheerio=require('cheerio');
const serve=require('koa-static');
const bodyParser=require('koa-bodyparser');
const querystring=require('querystring')

// 解析post数据
app.use(bodyParser());

// 解析静态目录
app.use(serve('.'));

// 渲染方法
app.context.render=render({
    root:'./',
    autoescape:true,
    cache:false,
    ext:'htm'
});

// 请求头部信息
let headers={
    "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8",
    'X-Requested-With':'XMLHttpRequest',
    "Accept":"application/json, text/javascript, */*; q=0.01",
    "Accept-Language":"zh-CN,zh;q=0.8,en;q=0.6,ja;q=0.4,zh-TW;q=0.2",
    "Cache-Control":"max-age=0",
    "Connection":"Keep-Alive",
    "Accept-Encoding":"gzip, deflate, sdch",
    "User-Agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2526.111 Safari/537.36"
}

//域名
const HOST='http://www.shikee.com/';

router.get('/',function* (next){

    let loginHtml=yield fetch('http://login.shikee.com/',{
        method:'GET',
    }).then(function(res){
        return res.text();
    })

    // let $=cheerio.load(loginHtml);


    this.body=yield this.render('app');
})

router.post('/',function* (next){
    let body=this.request.body;

    let response=yield fetch('http://login.shikee.com/check/?_1452847083679',{
        method:'POST',
        body:querystring.stringify(body),
        headers:headers
    }).then(function(res){
        let cookies=res.headers._headers['set-cookie'];
        let result='';
        if(cookies){
            console.log(cookies);
            for(let i in cookies){
                let tmp=cookies[i];
                let tmpResult=/(.+?=.+?;)/.exec(tmp);
                if(tmpResult && tmpResult[1]){
                    result+=tmpResult[1];
                }
            }
        }
        headers.Cookie=result;
        return res.json();
    })

    this.body=response;
})

router.get('/app_member',function* (next){

    if(!headers.Cookie)return this.redirect('/');

    // let response=yield fetch(HOST+'home_new/get_sellerinfo',{
    //     method:'GET',
    //     headers:headers
    // }).then(function(res){
    //     return res.json();
    // })
    // console.log(response);

    this.body=yield this.render('app_member',{headers:headers});
})

router.get('/get_info',function* (next){
    let response=yield fetch(HOST+'home_new/get_sellerinfo',{
        method:'GET',
        headers:headers
    }).then(function(res){
        return res.json();
    })

    this.body=response;
})

app.use(router.routes());

app.listen(9090);
