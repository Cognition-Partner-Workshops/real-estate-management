import { User } from "../../models/user.js";

export const getMe = async function (req, res) {
    const user_id = req.user.id;

    try {
        const user = await User.findOne({ user_id }).select("-password -__v");
        if (!user) {
            return res.status(404).send({ message: "Error: User not found." });
        }
        return res.send({ data: user });
    } catch (error) {
        return res.status(500).send({ message: "Error: Something went wrong." });
    }
};
