'use strict';
var mongoose =require('mongoose');

var tschema=new mongoose.Schema({
    name:{type:String},
    age:{type:Number,default:18},
    gender:{type:Boolean,default:true}
});

//实例方法
tschema.method('say',function(){
    console.log('say');
})

//追加方法
tschema.method.speak=function(){
    console.log('speak');
}

//静态方法
tschema.static('findByName',function(name,cb){
    return this.find({name:name},cb);
})

var db=mongoose.connect('mongodb://127.0.0.1:27017/test');

var TestModel=db.model('test',tschema);

var TestEntity=new TestModel({
    name:'Lenka',
    age:18,
    gender:true
});
console.log(TestEntity.name);

//Model保存方法
TestModel.create({name:'huayeta'},function(err,doc){});

//Entity保存方法
TestEntity.save(function(err,doc){});

//更新数据
TestModel.update({name:'huayeta'},{$set:{age:17}},function(err){});

//删除数据
TestModel.remove({name:'huayeta'},function(err){});

//查询方法
TestModel.find({age:28},function(err,docs){});

//查询条件
TestModel.find({},{name:1,_id:0},function(err,docs){})

//返回单个结果
TestModel.findone({name:'huayeta'},function(err,doc){})

//通过id查询单个结果
TestModel.findById('obj._id',function(err,doc){})

//大、小于
TestModel.find({age:{$gte:20,$lte:50}},function(err,docs){})

//不匹配 不等于
TestModel.find({name:{$ne:'test4'},age:{$lt:27}},function(err,docs){})

//包含 等于
TestModel.find({age:{$in:[24,25,27]}},function(err,docs){})

//或者
TestModel.find({$or:[{name:'test4'},{age:27}]},function(err,docs){})

//存在
TestModel.find({email:{$exists:true}},function(err,docs){})

//限制数量
TestModel.find({age:27},null,{limit:10},function(err,docs){})

//跳过数量
TestModel.find({age:27},null,{skip:4},function(err,docs){})

//排序
TestModel.find({},{name:1,age:1,_id:0},{sort:{age:1}},function(err,docs){})
