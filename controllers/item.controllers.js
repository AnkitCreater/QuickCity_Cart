import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const addItem = async (req, res) => {
    try {
        const { name, category, foodType, price, description } = req.body
        let image;
        if (req.file) {
            image = await uploadOnCloudinary(req.file.path)
        }
        const shop = await Shop.findOne({ owner: req.userId })
        if (!shop) {
            return res.status(400).json({ message: "shop not found" })
        }
        const item = await Item.create({
            name, category, description, foodType: foodType || "none", price, image, shop: shop._id
        })

        shop.items.push(item._id)
        await shop.save()
        await shop.populate("owner")
        await shop.populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        return res.status(201).json(shop)

    } catch (error) {
        return res.status(500).json({ message: `add item error ${error}` })
    }
}

export const editItem = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const { name, category, foodType, price, description } = req.body
        let updateData = { name, category, foodType, price, description };

        if (req.file) {
            updateData.image = await uploadOnCloudinary(req.file.path)
        }
        
        const item = await Item.findByIdAndUpdate(itemId, updateData, { new: true })
        if (!item) {
            return res.status(400).json({ message: "item not found" })
        }
        const shop = await Shop.findOne({ owner: req.userId }).populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        return res.status(200).json(shop)

    } catch (error) {
        return res.status(500).json({ message: `edit item error ${error}` })
    }
}

export const getItemById = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const item = await Item.findById(itemId)
        if (!item) return res.status(400).json({ message: "item not found" })
        return res.status(200).json(item)
    } catch (error) {
        return res.status(500).json({ message: `get item error ${error}` })
    }
}

export const deleteItem = async (req, res) => {
    try {
        const itemId = req.params.itemId
        const item = await Item.findByIdAndDelete(itemId)
        if (!item) return res.status(400).json({ message: "item not found" })
        
        const shop = await Shop.findOne({ owner: req.userId })
        shop.items = shop.items.filter(i => i.toString() !== itemId)
        await shop.save()
        await shop.populate({
            path: "items",
            options: { sort: { updatedAt: -1 } }
        })
        return res.status(200).json(shop)
    } catch (error) {
        return res.status(500).json({ message: `delete item error ${error}` })
    }
}

export const getItemByCity = async (req, res) => {
    try {
        const { city } = req.params
        const shops = await Shop.find({ city: { $regex: new RegExp(`^${city}$`, "i") } })
        const shopIds = shops.map(shop => shop._id)
        const items = await Item.find({ shop: { $in: shopIds } }).populate("shop", "name image")
        return res.status(200).json(items)
    } catch (error) {
        return res.status(500).json({ message: `get by city error ${error}` })
    }
}

export const getItemsByShop = async (req, res) => {
    try {
        const { shopId } = req.params
        const shop = await Shop.findById(shopId).populate("items")
        if (!shop) return res.status(400).json("shop not found")
        return res.status(200).json({ shop, items: shop.items })
    } catch (error) {
        return res.status(500).json({ message: `get by shop error ${error}` })
    }
}

export const searchItems = async (req, res) => {
    try {
        const { query, city } = req.query
        if (!query || !city) return res.status(400).json("Query and city required")
        
        const shops = await Shop.find({ city: { $regex: new RegExp(`^${city}$`, "i") } })
        const shopIds = shops.map(s => s._id)
        const items = await Item.find({
            shop: { $in: shopIds },
            $or: [
                { name: { $regex: query, $options: "i" } },
                { category: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } }
            ]
        }).populate("shop", "name image")
        return res.status(200).json(items)
    } catch (error) {
        return res.status(500).json({ message: `search error ${error}` })
    }
}

export const rating = async (req, res) => {
    try {
        const { itemId, rating } = req.body
        const item = await Item.findById(itemId)
        if (!item) return res.status(400).json("Item not found")

        const newCount = item.rating.count + 1
        const newAverage = (item.rating.average * item.rating.count + rating) / newCount
        item.rating.count = newCount
        item.rating.average = newAverage
        await item.save()
        return res.status(200).json({ rating: item.rating })
    } catch (error) {
        return res.status(500).json({ message: `rating error ${error}` })
    }
}