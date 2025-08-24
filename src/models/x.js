import mongoose from "mongoose";

const tweetSchema = new mongoose.Schema({
    owner : { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content : { type: String, required: true},
});

export let Tweet = mongoose.model("Tweet", tweetSchema);