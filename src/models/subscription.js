import { timeStamp } from "console";
import { channel } from "diagnostics_channel";
import mongoose, { Schema } from "mongoose";
import { type } from "os";
import { ref } from "process";

let subscriptionSchema = new mongoose({
    Subscriber:{
        type : mongoose.Schema.Types.ObjectId,//the one who is subscribing the channel
        ref : "User"
    },
    channel : {
        type : mongoose.Schema.Types.ObjectId,//the one to who subscriber is subscribing
        ref : "User"
    }
},{timeStamps : true});

export let Subscription = mongoose.model("Subscription", subscriptionSchema);