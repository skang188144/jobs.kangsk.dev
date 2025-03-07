import { ObjectId } from "mongodb";
import { ApplicationStatus } from "./ApplicationStatus";

export type Application = {
    _id: ObjectId;
    user_id: ObjectId;
    job_id: ObjectId;
    status_history: {
        applied: Date;
        screen: Date | null;
        interview: Date | null;
        offer: Date | null;
    };
    final_status: {
        status: ApplicationStatus;
        date: Date;
    } | null;
};