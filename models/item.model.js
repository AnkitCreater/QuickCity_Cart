import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    description: { type: String, default: "" },
    category: {
        type: String,
        enum: [
            "Grocery", "Electronics", "Fashion", "Pharmacy", 
            "Stationery", "Home Decor", "Fresh Produce", 
            "Bakery", "Automotive", "Food & Beverages", "Others"
        ],
        required: true
    },
    price: { type: Number, min: 0, required: true },
    foodType: {
        type: String,
        enum: ["veg", "non veg", "none"], 
        default: "none" 
    },
    stock: { type: Boolean, default: true },
    rating: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    }
}, { timestamps: true });

const Item = mongoose.model("Item", itemSchema);
export default Item;