// Require the packages
var express = require("express");
var bodyParser = require("body-parser");
var path = require('path');
var expressValidator = require('express-validator')
const { check, validationResult } = require('express-validator/check')
var mongojs = require('mongojs')
// Initialise Database with table
var db = mongojs('customerapp', ['users']);
var ObjectId = mongojs.ObjectId;
var app =  express();

// View Engine
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'))

//Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//Set static path
app.use(express.static(path.join(__dirname,'public')));

//GLobal Vars
app.use(function(req,res,next){
    res.locals.errors = null;
    res.locals.old = null;
    next();
});
// Set Routes
// Add user to db with validation
app.post('/users/add', [
    
    check('first_name').isAlpha(),
    check('last_name').isAlpha(),
    check('email').isEmail().withMessage('Please enter valid email address')
    
],function(req,res){
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(res);
        db.users.find(function (err, users) {
            return res.render('index', { old: req.body, title: 'Customers', users: users, errors: errors.array() });
        })
        
    }
        
    var newUser =  {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email
    }
    //Db Insert    
    db.users.insert(newUser, function(err,result){
        if(err){
            console.log(err);
        }
        res.redirect('/');
    });

});
//Route Set with delete
app.delete('/users/delete/:id',function(req,res){
    db.users.remove({ _id: ObjectId(req.params.id)},function(err,result){
        if(err){
            console.log(err);
        }
        res.redirect('/')
    })
})
//Initial Route
app.get('/',function(req,res){
    db.users.find(function (err, users) {
        res.render('index', {
            title: 'Customers',
            users: users
        });
    })
    
});

app.listen(3000,function(){
    console.log('Server Started on Port 3000');
})