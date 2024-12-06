import { ObjectId } from 'mongodb';

interface UserWithoutPassword {
    _id: ObjectId;
    email: string;
    username: string;
}

export default UserWithoutPassword;