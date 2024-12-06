import { ObjectId } from 'mongodb';

interface UserWithPassword {
    _id: ObjectId;
    email: string;
    username: string;
    password: string;
}

export default UserWithPassword;