import { API_URL } from "@/constants/config";
import axios from "axios";

interface ImageUploadResponse {
    sucess: boolean;
    data: {
        url: string;
        key: string;
        size: number;
        contentType: string;
    };
}


export default function ImageUploadService({token}: {token: string}) {
    const client = axios.create({
        baseURL: API_URL,
        headers: {
           Authorization: `Bearer ${token}`,
           'Content-Type': 'multipart/form-data',
        },
    });

    async function uploadImage(formData: FormData): Promise<string> {
        try {
        const response = await client.post<ImageUploadResponse>("/images", formData);
        return response.data.data.url;
        } catch (error) {
            throw new Error(`Error uploading image: ${(error as Error).message}`);
        }


}
    return {        uploadImage,
    };
}