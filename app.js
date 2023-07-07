//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const _ = require('lodash');


const app = express();

const mongoose = require("mongoose");
const { result } = require("lodash");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://lakshittiwari22:Lucky%40123@cluster0.c7xc0mt.mongodb.net/todolistDB");

//defina mongooseSchema and model for 'items' collection-------------------------------------------
const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemSchema);

const item_1 = new Item({
  name: "Welcome to your todolist!",
});

const item_2 = new Item({
  name: "Hit the + button to aff a new item.",
});

const item_3 = new Item({
  name: "<-- Hit this to delete an item.",
});

//-------------------------------------------------------------------------------

//defining schema and model for 'lists' collection-------------------------------

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema], //embedding items in lists ie extablishing relationship
});

const List = mongoose.model("List", listSchema);

const defaultItems = [item_1, item_2, item_3];
//----------------------------------------------------------------------------------

//get request for home route--------------------------------------------------------

app.get("/", function (req, res) {
  //checking if the todolist is empty or not
  Item.find()
    .then(function (items) {
      if (items.length === 0) {
        Item.insertMany(defaultItems);
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: items });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

//------------------------------------------------------------------------------------

//get route for custom lists----------------------------------------------------------

app.get("/:customListParam", function (req, res) {

  const customListName = _.capitalize(req.params.customListParam); 

  List.findOne({ name: customListName })
    .then((result) => {
      if (result.name === customListName) {
        
        res.render("list", { listTitle: result.name, newListItems: result.items });
      }
    })
    .catch((err) => {
      
      const list = new List({
        name: customListName,
        items: defaultItems,
      });

      list.save();

      res.redirect("/" + customListName);
      
    });
});

//post route for default list and custom list---------------------------------------

app.post("/", function (req, res) {

  const buttonValue = req.body.listButton;

  console.log(buttonValue);

  const item = new Item({
    name: req.body.newItem
  });
  
//checking if the post request is from default list or custom list-------------------------
  if(buttonValue === "Today"){
    item.save();
    res.redirect("/");
  
  }else{
    List.findOne({name: buttonValue})
    .then(result =>{
      result.items.push(item);
      result.save();
      res.redirect("/" + buttonValue);
    });
  }

 
  
    
  });
//----------------------------------------------------------------------------------------

  
 //post route for deleting  list items-------------------------------------------------------

app.post("/delete", function (req, res) {
  const item_id = req.body.checkbox;    //g  etting value from checkbox
  
  const currentListTitle = req.body.currentList; //getting value from hidden input 
  console.log(currentListTitle);

// checking if the delete request came from default list or custom list
  if(currentListTitle === "Today"){

    Item.deleteOne({ _id: item_id })
    .then((result) => {
      console.log("sucessfully deleted checked item!");
    })
    .catch((err) => {
      console.log(err);
    });
  res.redirect("/");

  }else{
   
  List.findOneAndUpdate({name:currentListTitle },{$pull:{items:{_id: item_id}}}) //using $pull to delete an item from an array
  .then(result =>{
    res.redirect("/" + currentListTitle);

  }).catch(err =>{
    console.log(err);
  })
  }

  
});

//---------------------------------------------------------

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
