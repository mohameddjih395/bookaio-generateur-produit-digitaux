import { uploadToCloudinary } from '../../services/cloudinaryService';
import { saveToHistory } from '../../services/webhookService';

export const persistAndLog = async (
    userId: string,
    blob: Blob,
    title: string,
    type: 'ebook' | 'cover' | 'mockup' | 'ad' | 'video',
    filename: string
) => {
    const file = new File([blob], filename, { type: blob.type });
    const url = await uploadToCloudinary(file);
    saveToHistory(userId, { title, type, url });
    return url;
};
