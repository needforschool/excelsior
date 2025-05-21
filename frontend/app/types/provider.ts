import IUser from "./user";
// {"created_at": "2025-05-20T15:33:57.274033", "id": 9, "id_user": 16, "latitude": -44.3241235, "longitude": 54.690558, "type": "moving", "updated_at": "2025-05-20T15:33:57.274033", "user": {"email": "zduncan@example.net",
//     "firstName": "Evan", "id": 16, "lastName": "Mcintosh"}}
export default interface IProvider {
    id: number;
    id_user: number;
    latitude: number;
    longitude: number;
    type: string;
    created_at: string;
    updated_at: string;
    user: IUser;

}