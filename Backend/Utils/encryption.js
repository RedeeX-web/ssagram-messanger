const CryptoJS = require('crypto-js');

const SECRET_KEY = process.env.ENCRYPTION_KEY;

const encrypt = (text) => {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

const decrypt = (cipherText) => {
    try {
        const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (err) {
        return cipherText;
    }
};

module.exports = { encrypt, decrypt };