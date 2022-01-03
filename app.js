const express = require('express');
const app = express();

const request = require('request');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const _ = require("lodash");
const date = require(__dirname+"/date.js");


app.set('view-engine' , 'ejs');
app.use(bodyparser.urlencoded({extended:true}));

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{ useNewUrlParser: true,useUnifiedTopology: true }); 

const itemschema = new mongoose.Schema({
    itemname : String,
});

const Item = mongoose.model("Item",itemschema);

// const item = new Item(
//     {
//         itemname :  
//     }
// );
const listschema = new mongoose.Schema( {
    name: String,
    items : [itemschema]
});

const List = mongoose.model("List", listschema);

const i1 = new Item(
    {
        itemname : "Always try to wake up early!!"
    }
);

const i2 = new Item(
    {
        itemname : "Do your best!!"
    }
);


const defaultitems = [ i1, i2 ];

// let items=[];
let today ;
app.get("/",function(req,res)
{
    console.log("GET STATE RUNNING...");
    
    today = date.getDate();
    
    //console.log(today);
    //res.render("list.ejs",{kindofdate : today,newlistitems : items});

    Item.find({},function(err,items)
        {
            //console.log(items[0].itemname);
            if(items.length===0)
            {
                Item.insertMany(defaultitems, function (err)
                {
                    if(err)
                    console.log(err);
                    else
                    {
                        console.log("successfully inserted Default items in our todoList!!!");
                        res.redirect("/");
                       // res.render("list.ejs",{kindofdate : today,newlistitems : items });
                    }
                });
            }
            else
            {
               console.log("ejsfile  runnig ..... ");
               res.render("list.ejs",{kindofdate : today,newlistitems : items });
            }
           
        });
    
    
});

app.get("/:customListName",function(req,res)
{
    const customListName =  _.capitalize(req.params.customListName);
    console.log("get request of ____ route running.... ");
    List.findOne({name : customListName},function(err,foundlist)
    {
        if(!err)
        {
            if(!foundlist)
            {
                const list = new List ({
                    name : customListName,
                    items : defaultitems
               });
               console.log("succesfull inserted dta into list db");
               list.save();
               setTimeout(function(){ res.redirect("/"+customListName); }, 200);
               
            }
            else 
            {
                console.log("ejs again runnig .....");
                res.render("list.ejs",{kindofdate : foundlist.name,newlistitems : foundlist.items });
            } 
        }
    }); 
    
});

app.post( "/" , function(req,res){ 
     const itemmm = req.body.additems;
     const listname = req.body.list;
     console.log("PSOT REQUEST RUNNING ...... ");
     console.log(itemmm);
     console.log(listname);

        const item = new Item(
        {
            itemname :  itemmm
        });
        //listname = 'TODAY'
        if(listname === today)
        {
            item.save();
            console.log("sucessfully INSERTED new work \""+ item.itemname +"\" to our todoList!!"); 
            res.redirect("/"); 
         }
        else
        {
            console.log("hey i am ravi");
            console.log("list name "+listname);
            List.findOne({name: listname},function(err,foundlist){
                
                if(!err)
                {
                    console.log(foundlist.items);
                    foundlist.items.push(item);
                    console.log(foundlist.items);
                    foundlist.save();
                    setTimeout(function(){ res.redirect("/"+foundlist.name); }, 200);
                }
            });
        }
        
  //  res.send(item);
   // res.render("list.ejs",{kindofdate : today,newlistitems : items});
    
});

app.post( "/delete" , function(req,res){ 
    console.log("delete request is runnning ..........");
    const idd = req.body.deleteitem; 
    const lname = req.body.listname;
    console.log(lname); 
    console.log(idd);
    if(lname === today)
    { 
        Item.findByIdAndRemove(idd, function(err){
            if(err)
            console.log(err);
            else
            {
                console.log("Successfully removed item!!!");
                res.redirect("/");
            }
        }
        );
    }
    else
    {
        console.log("deleting items from route "+ lname);
        List.findOneAndUpdate({ name : lname },{ $pull : { items:{_id: idd} }  },
            function(err,foundlist)
            {
                if(!err)
                {
                    console.log("successfully delete item from db!!");
                    res.redirect("/"+lname );
                }
            });
        
    }
    
});


app.listen(3000,function(req,res)
{
     console.log("server started runing on port ....");
});