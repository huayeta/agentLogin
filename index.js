'use strict';

const fetch=require('node-fetch');
const koa=require('koa');
const FormData=require('form-data');
const async=require('async');
const app=koa();
const http=require('http');
const fs=require('fs');
const thunkify=require('thunkify');

app.use(function* (next){

    var headers={
        "Content-Type":"application/x-www-form-urlencoded; charset=UTF-8",
        'X-Requested-With':'XMLHttpRequest',
        "Accept":"text/html, application/xhtml+xml, */*",
        "Accept-Language":"zh-CN",
        "Cache-Control":"no-cache",
        "Connection":"Keep-Alive",
        "User-Agent":"Mozilla/5.0 (compatible; MSIE 9.2; Windows NT 6.1; Trident/5.0; BOIE9;ZHCN)"
    }

    yield fetch('http://login.shikee.com/check/?_1452847083679',{
        method:'POST',
        body:'username=huayeta&password=1c5d1091545b49bde228a16b88ff6c1cdd497aa55ed7f9bb9702107814c01f00cb10a24072e17abd3939471c7dda666f9a1aedf6d4704144423e4fa0beae551758e446f17bacdfcac5af731449f441b87f41ba4533960d81139edd4ebf0a9e75a0070905a4ca511934cb9e5bb968c3041f16821a0200142116907f29277d6e20',
        headers:headers
    }).then(function(res){
        var cookies=res.headers._headers['set-cookie'];
        headers.Cookie=cookies;
        return res.text();
    }).then(function(res){
        console.log(res);
    })

    // yield fetch('http://yst.lqper.com/?m=member&c=index&a=getinfo',{
    //     method:'GET',
    //     headers:headers
    // }).then((res) => {
    //     return res.text();
    // }).then((res) => {
    //     console.log(res);
    // })

    this.body=yield thunkify(fs.readFile)('./index.htm','utf-8');
})

const server=http.createServer(app.callback());
const io=require('socket.io')(server);

io.on('connection',function(socket){
    // 链接成功
    socket.on('message',function(data){
        console.log(data);
    })
    socket.on('disconnect',function(){
        // 用户离开

    })
})

io.of('chat').on('connection',function(socket){
    // 链接成功
    socket.on('message',function(data){
        console.log(data+' chat');
    })
    socket.broadcast.emit('message','欢迎!');
    socket.on('disconnect',function(){
        // 用户离开

    })
})

server.listen('2831');
