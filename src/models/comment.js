import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new mongoose.Schema({
    comment : { type: String, required: true },
    video : { type: mongoose.Schema.Types.ObjectId, ref: "Video", required: true },
    owner : {type : mongoose.Schema.Types.ObjectId, ref : "User", required: true },
}, { timestamps: true});

commentSchema.plugin(mongooseAggregatePaginate);
export let Comment = mongoose.model("Comment", commentSchema);