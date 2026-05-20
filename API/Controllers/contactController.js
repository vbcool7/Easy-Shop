
import Contact from "../Models/contactModelSchema.js";

export const contactForm = async (req, res) => {
    try {
        const { firstName, lastName, email, contact, category, subCategory, orderId, message } = req.body;

        if (!firstName || !lastName || !email || !contact || !category || !message) {
            return res.status(400).json({
                status: false,
                message: "All fields are required"
            });
        }

        if (category === "Refund & Returns" && !orderId) {
            return res.status(400).json({
                status: false,
                message: "Please enter Order ID"
            });
        }

        const contactData = await Contact.create({
            firstName,
            lastName,
            email,
            contact,
            category,
            subCategory,
            orderId,
            message
        });

        res.status(201).json({
            status: true,
            message: "Your message successfully saved",
            data: contactData
        });

    } catch (err) {
        console.log("Error :", err);
        return res.status(500).json({
            status: false,
            message: "Server Error Occur"
        });
    }
};