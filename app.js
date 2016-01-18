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
app.use(serve('./public/'));

// 渲染方法
app.context.render=render({
    root:'./views/',
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

// 请求cookie
let COOKIES;

//域名
const HOST='http://www.shikee.com/';

// 首页
router.get('/',function* (next){

    this.body=yield this.render('app');
})

// 登陆
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
            // console.log(cookies);
            for(let i in cookies){
                let tmp=cookies[i];
                let tmpResult=/(.+?=.+?;)/.exec(tmp);
                if(tmpResult && tmpResult[1]){
                    result+=tmpResult[1];
                }
            }
        }
        COOKIES=result;
        headers.Cookie=result;
        return res.json();
    })

    this.body=response;
})

router.get('/app_member',function* (next){

    if(!headers.Cookie)return this.redirect('/');

    let response=yield fetch('http://list.shikee.com/list-1.html?type=1',{
        method:'GET',
        headers:headers
    }).then(function(res){
        return res.text();
    })
    const $=cheerio.load(response);
    let $items=$('.maxPicList .item');
    let pageMax=$('#J_page .go-page').text().match(/\d+/)[0];
    let items=[];
    $items.each(function(i,item){
        let $a=$(this).find('h4 a');
        let url=$a.attr('href');
        let title=$a.text();
        items.push({url:url,title:title})
    })

    this.body=yield this.render('app_member',{headers:headers,items:items,pageMax:pageMax});
})

router.get('/apply/:id',function* (next){
    let id=this.params.id;
    if(!id)return this.body={success:false,info:{data:'id不存在'}};

    yield fetch('http://platinum.shikee.com/'+id+'.html',{
        method:'GET',
        headers:headers
    }).then(function(res){
        return res.text();
    });
    //获取是否申请过
    let info=yield fetch('http://platinum.shikee.com/data/'+id,{
        method:'GET',
        headers:headers
    }).then(function(res){
        return res.text();
    });
    info=JSON.parse(info.match(/\{.*\}/)[0]);
    let nowDate=parseInt(info.now);
    let tmpCookies=COOKIES+'Hm_lpvt_f5b004b0742ab157215b881269b4a6fa='+nowDate+';Hm_lvt_f5b004b0742ab157215b881269b4a6fa=1453078633,1453080255,1453080257,1453080333';
    let tmpHeaders=Object.assign({},headers,{Cookie:tmpCookies});
    if(info.is_apply==true){return this.body={success:false,info:{data:'已经申请过'}};}
    // yield new Promise(function(resolve,reject){
    //     setTimeout(()=>{resolve();},10000)
    // })
    // 申请
    let response=yield fetch('http://detail.shikee.com/detail/apply/'+id,{
        method:'POST',
        headers:tmpHeaders,
        body:{cache_key:id}
    }).then(function(res){
        return res.text();
    });

    this.body=response;
})

//获得会员的信息
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
