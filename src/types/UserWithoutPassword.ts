import { ObjectId } from 'mongodb';

interface UserWithoutPassword {
    _id: ObjectId;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
}

export default UserWithoutPassword;