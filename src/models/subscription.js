import mongoose, { Schema }  from "mongoose";

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

export const Subscription = mongoose.model("Subscription", subscriptionSchema);