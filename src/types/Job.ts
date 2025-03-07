import { ObjectId } from "mongodb";

export type Job = {
    _id: ObjectId;
    title: string;
    company: ObjectId;
    location: undefined; // TODO: add location types
    salary: number;
    category: undefined; // TODO: add category types
    remote: boolean;
    start_date: Date;
    end_date: Date;
    required_skills: undefined[]; // TODO: add skill types
    description: string;
    
};
