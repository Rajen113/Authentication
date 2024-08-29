const express= require('express')
const app=express()
const userModel=require("./model/userModel")
const path = require('path')
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const cookieparser=require("cookie-parser")

app.set('view engine','ejs')
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,'public')))
app.use(cookieparser())

app.get('/',(req,res)=>{
    res.render('index')
})

app.get('/find', async(req,res)=>{
    let user= await userModel.find()
    res.send(user)
})

app.post('/create', (req,res)=>{
    const{username,email,password}=req.body
    bcrypt.genSalt(10,(err,salt)=>{
        if(err) res.send('something is wrong')
        bcrypt.hash(password,salt,async(err,hash)=>{
            let user= await userModel.create({
                username,
                email,
                password:hash,
            })
            res.send(user)
            console.log(user)
        })

        let token= jwt.sign({email},'shhhhhhh')
        res.cookie("token",token)
    })
})

app.get('/logout',(req,res)=>{
    res.cookie('token',"")
    res.redirect('/')
})
app.get('/login', (req,res)=>{
    res.render('login')
})

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await userModel.findOne({ email: email });
        if (!user) {
            return res.status(400).send('User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            let token = jwt.sign({ email }, 'shhhhhhh', { expiresIn: '1m' });
            res.cookie("token", token);
            res.send('Logged in');
        } else {
            res.status(400).send("Incorrect password");
        }
    } catch (err) {
        res.status(500).send('Error logging in');
    }
});

app.listen(3000)