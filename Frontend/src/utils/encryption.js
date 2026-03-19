import CryptoJS from 'crypto-js';

const SECRET_KEY = '12345678901234567890123456789012'; // Должен совпадать с бэкендом!

export const encrypt = (text) => {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decrypt = (cipherText) => {
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        const decoded = bytes.toString(CryptoJS.enc.Utf8);
        return decoded || cipherText;
    } catch (err) {
        return cipherText;
    }
};