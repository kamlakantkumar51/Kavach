import { response } from "express";
import { prisma } from "../config/db.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import moment from "moment"; 
import { formatUser } from "../utils/formatUser.js";
import { exec } from "child_process";


export const getCurrentUser = async (req,res)=>{
    try {
        const userId = req.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });
        if(!user){
            return res.status(400).json({message:"user not found"})
        }
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(formatUser(userWithoutPassword));
    }catch(error){
        console.error("getCurrentUser error:", error.message);
        return res.status(400).json({message:"get current user error"}) 
    }
}

export const updateAssistant = async(req,res)=>{
    try{
        const{assistantName, imageUrl} = req.body;
        let assistantImage;
        if(req.file){
            assistantImage=await uploadOnCloudinary(req.file.path)
        }else{
            assistantImage=imageUrl
        }
        const user = await prisma.user.update({
            where: { id: req.userId },
            data: { assistantName, assistantImage }
        });
        const { password, ...userWithoutPassword } = user;
        return res.status(200).json(formatUser(userWithoutPassword));
    }catch(error){
        console.error("updateAssistant error:", error.message);
        return res.status(400).json({message:"update assistant error"})
    }
}

export const askToAssistant = async(req,res)=>{
    try{
        // support both `command` and legacy `userInput` from client
        const {command, userInput} = req.body;
        const query = command || userInput;

        // validate input early so we can return a helpful message
        if (!query || typeof query !== 'string' || query.trim() === '') {
            console.log("askToAssistant received empty query", { command, userInput });
            return res.status(400).json({ response: "empty command" });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.userId }
        });
        if (!user) {
            return res.status(404).json({ response: "user not found" });
        }

        // Deserialize existing history, append query, and save
        let history = [];
        try {
            history = JSON.parse(user.history || '[]');
        } catch {
            history = [];
        }
        history.push(query);

        await prisma.user.update({
            where: { id: req.userId },
            data: { history: JSON.stringify(history) }
        });

        const userName = user.name;
        const assistantName = user.assistantName || "Assistant";

        console.log("askToAssistant query:", query);
        const result = await geminiResponse(query, assistantName, userName);
        console.log("assistant raw result:", result);

        if(!result){
            console.warn("Gemini returned no text for query, sending fallback response.");
            // respond with a generic message instead of a 400 error so frontend doesn't crash
            return res.json({
              type: "general",
              userInput: query,
              response: "I'm having trouble contacting the assistant right now. Please try again later."
            });
        }

        const jsonMatch = result?.match(/{[\s\S]*}/)

        if(!jsonMatch){
            return res.json({
                type:"general",
                userInput:command,
                response:"Hello! How can I help you?"
            })
        }
        let gemResult;

        try{
            gemResult = JSON.parse(jsonMatch[0]);
        }catch(err){
            console.log("JSON parse error:", err);
            return res.status(400).json({response:"AI returned invalid format"});
        }
        const type=gemResult.type

        switch(type){
            case "get_date":
                return res.json({
                    type,
                    userInput:gemResult.userInput,
                    response:`current date is ${moment().format("YYYY-MM-DD")}`
                });

            case "get_time":
                return res.json({
                    type,
                    userInput:gemResult.userInput,
                    response:`current time is ${moment().format("HH:mm:A")}`
                });

            case "get_day":
                return res.json({
                    type,
                    userInput:gemResult.userInput,
                    response:`today is ${moment().format("dddd")}`
                });

            case "get_month":
                return res.json({
                    type,
                    userInput:gemResult.userInput,
                    response:`current month is ${moment().format("MMMM")}`
                });
            case "open_vscode":
                exec("code", (err) => {
                    if (err) {
                        console.log("Failed to open VS Code via CLI 'code':", err);
                        exec("start code", (err2) => {
                            if (err2) {
                                console.log("Failed to open VS Code via 'start code':", err2);
                            }
                        });
                    }
                });
                return res.json({
                    type,
                    userInput: gemResult.userInput,
                    response: gemResult.response || "Opening Visual Studio Code for you."
                });
            case "google_search":
            case "youtube_search":
            case "youtube_play":
            case "general":
            case "calculator_open":
            case "instagram_open":
            case "facebook_open":
            case "weather_show":
                return res.json({
                    type,
                    userInput:gemResult.userInput,
                    response:gemResult.response
                });
            default:
                return res.status(400).json({response:"sorry, i couldn't understand that command"})
        }
    }catch(error){
        console.log("Assistant Error:", error);
        return res.status(500).json({response:"ask to assistant error"})
    }
}
