import { Injectable } from '@angular/core';
import CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  constructor() { }

  secretKey: string = "SwxBnHRjrtuIi3RFecViAlH39N5j6gBK";

  encrypt(value : string) : string{
    const key = "SwxBnHRjrtuIi3RFecViAlH39N5j6gBK";
    return CryptoJS.AES.encrypt(JSON.stringify(value), key).toString();
  }

  decrypt(textToDecrypt : string){
    return CryptoJS.AES.decrypt(textToDecrypt, this.secretKey.trim()).toString(CryptoJS.enc.Utf8);
  }

}
