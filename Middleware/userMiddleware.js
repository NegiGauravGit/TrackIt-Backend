import jwt from 'jsonwebtoken'
import express from 'express'
export default function authentication(req,res,next){
    const token = req.cookies.token; 

    if(!token){
        res.status(401).json({
            message: "the user is not signed in please sign in first "
        })
    }
    try{
        jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
            if(err){
                res.status(404).json({
                    message:"error hai",
                    error: err
                })
            }else{
                req.userId = decoded.id
                next()
            }
        })
    }
    catch(err){
        console.error(err)
        res.status(401).json({error:"Invaild Token"})
    }
}

