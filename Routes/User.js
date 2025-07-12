import express from "express";
import { Router } from "express";
import userModel from "../DataBase/userDb.js";
import todoModel from "../DataBase/todosDb.js";
import bcrypt, { hash } from "bcrypt";
import authentication from "../Middleware/userMiddleware.js";
import { userSchema,userSignUpSchema } from "../Schema/authSchema.js";
import jwt from 'jsonwebtoken'
const userRouter = Router();

userRouter.post("/Auth/signUp", async function (req, res) {
  const validateData = userSignUpSchema.safeParse(req.body)

  if(validateData.success === false){
    res.json({
      error: validateData.error
    })
  }
  const { firstName, lastName, email, password } = validateData.data;
  console.log(firstName,lastName,email,password)
  if (!firstName || !lastName || !email || !password) {
    res.status(404).json({
      message: "The data is not found field is missing",
    });
  }

  const userExists = await userModel.findOne({email})

  if (!userExists) {
    const hashPassword = await bcrypt.hash(password, 5);
    const newUser = await userModel.create({
      firstName,
      lastName,
      email,
      password: hashPassword,
    });

    res.status(200).json({
      message: "user signed Up successfully",
      newuser: newUser,
    });
  } else {
    res.status(409).json({
      message: "user already exists",
    });
  }
});

userRouter.post('/Auth/signIn',async function(req,res){
  try{
    const validateData = userSchema.safeParse(req.body)

    if(validateData.success === false){
    res.json({
      error: validateData.error
    })
  }
    const {email,password} = validateData.data
  
    if(!email || !password){
      res.status(404).json({
        message: "The data is not found field is missing",
      });
    }
    
    const findUser = await userModel.findOne({email})
  
    if(!findUser){
      res.status(404).json({
        message: "he user is not found please sign Up first"
      })
    }
  
    const comparePassword = await bcrypt.compare(password, findUser.password)
    if(comparePassword){
      const token = jwt.sign({id:findUser._id},process.env.JWT_SECRET)
      
      res.cookie('token', token, {
        httpOnly: true,          // JavaScript can't access
        secure: false,           // Set to true in production (HTTPS)
        sameSite: 'lax',         // Or 'strict' or 'none'
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      res.status(200).json({
        message:"user logged in succesfully",
        token:token
      })   

    }else{
      res.status(400).json({
        message:"Incorrect credential"
      })
    }

  }catch(error){
    console.log(error)
    res.status(400).json({
      message:"internal server error"
    })
  } 

})

userRouter.post("/createTodo",authentication,async function(req,res){
  const userId = req.userId
  const {category,title,description,status,startDate,endDate} = req.body


  if(!title || !description || !status || !category || !startDate || !endDate){
    return res.status(404).json({
      message:"Invalid data or field is missing"
    })
  }
    
    const newTodo = await todoModel.create({
      category,
      title,
      description,
      status,
      startDate,
      endDate,
      creatorId: userId
    })
  
    res.status(200).json({
      message:"todo created successfully",
      todo:newTodo
    })
  
})

userRouter.put("/updateTodo",authentication,async function(req,res){
  const {updatedTitle,updatedDes,updatedCompleted,todoId} =  req.body

  if(!updatedTitle || !updatedDes || updatedCompleted === undefined){
    res.status(404).json({
      message:"the data is misisng"
    })
  }
  const findTodo = await todoModel.findById(todoId.trim())

  if(!findTodo){
    res.status(404).json({
      message:"the todo does not exists"
    })
  }

  console.log(findTodo)

  if(updatedTitle || updatedDes || updatedCompleted !== undefined ){
    findTodo.title = updatedTitle,
    findTodo.description = updatedDes,
    findTodo.completed = updatedCompleted

    await findTodo.save()
  }
   console.log(findTodo)
  
   res.status(200).json({
    message: "todo updated successfully",
    todo: JSON.stringify(findTodo)
  })
})

userRouter.delete('/deleteTodo',authentication,async function(req,res){
  const {todoId} = req.body

  if(!todoId){
    res.status(404).json({
      message:"the Todo id is missing"
    })
  }

  const findTodo = await todoModel.findById(todoId.trim())

  if(!findTodo){
    res.status(404).json({
      message:"the todo does not exists"
    })
  }

  await findTodo.deleteOne()

  res.status(200).json({
    message:"the todo is deleted successfully"
  })

})

userRouter.get('/getAllTodos',authentication,async function(req,res){
  const userId = req.userId
  const findAllTodo = await todoModel.find({creatorId:userId})

  const todoWithFormattedDates = findAllTodo.map((todo) => ({
    ...todo._doc,
    startDate: todo.startDate ? todo.startDate.toDateString() : null,
    endDate: todo.endDate ? todo.endDate.toDateString() : null
  }))
  res.status(200).json({
    allTodos: todoWithFormattedDates
  })
})

userRouter.get('/verifyUser',authentication,async function(req,res){
  try{
    const userId = req.userId
  
    const findUser = await userModel.findById(userId).select('-password')
  
    if(!findUser){
      return res.status(404).json({
        message:"the user is not found"
      })
    }
    res.status(200).json({
     message:"the user is verified",
     user:findUser
   })

  }catch(error){
    console.log(error)
    res.status(500).json({
      message:"internal server error"
    })
  }

})

export default userRouter
