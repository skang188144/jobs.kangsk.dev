import { ObjectId } from "mongodb";
import { Job } from "./Job";

export type User = {
    _id: string;
    contact: {
        first_name: string;
        last_name: string;
        birth_date: Date;
        gender: undefined; // TODO: add gender types
        email: string;
        phone?: string;
        location: undefined; // TODO: add location types
    };
    about: {
        work_experience: {
            company: string;
            position: string;
            level: undefined; // TODO: add level types
            location: undefined; // TODO: add location types
            start_date: Date;
            end_date: Date;
            description: string;
        }[];
        education: {
            school: undefined; // TODO: add school types
            degree: undefined; // TODO: add degree types
            major: undefined; // TODO: add major types
            gpa: number;
            start_date: Date;
            end_date: Date;
            description: string;
        }[];
        projects: {
            name: string;
            position: string;
            location: undefined; // TODO: add location types
            start_date: Date;
            end_date: Date;
            description: string;
            link: string;
        }[];
        socials: {
            type: undefined; // TODO: add social types
            link: string;
        }[];
        skills: undefined[]; // TODO: add skill types
        languages: undefined[]; // TODO: add language types
    };
    jobs: {
        applied: string[];
        screen: string[];
        interview: string[];
        offer: string[];
        accepted: string[];
        rejected: string[];
        withdrawn: string[];
    };
    total_applications: number;
} | null;
