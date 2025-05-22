export default interface IUser {
    id: number;
    lastName: string;
    firstName: string;
    phone: string;
    email: string;
    role: 'client' | 'prestataire';
    created_at: string;
    updated_at: string;
}