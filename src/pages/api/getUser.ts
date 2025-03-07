import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/db";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    try {
        const client = await clientPromise;
        const db = client.db("users");
        
        // Get the first (and only) user from the database
        const user = await db.collection("all").findOne({});
        
        if (!user) {
            return res.status(404).json({ error: "No user found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error in getUser API:", error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
}
