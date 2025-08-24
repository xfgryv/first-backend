import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
    name : {
        type: String,
        required: true
    },
    description : {
        type : String,
        required : true
    },
    videos : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    }],
    owner : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });

export let Like = mongoose.model("Like", likeSchema);