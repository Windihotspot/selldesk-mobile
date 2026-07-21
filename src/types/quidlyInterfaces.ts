
export interface IMerchantUser {
    merchantid: string;
    accountid: string;
    quidlyuserid: string;
}

export interface IAppUser {
    accountid: string;
    quidlyuserid: string;
    fname: string;
    lname: string;
    email: string;
    merchantids: string[],
    bvn: string;
    nin: string;
    kyc_status: number,
    verifyentrydt: string;
    id_status: number;
    proofofaddress_status: number;
    isadmin: number;
}

export interface IMerchant {
    accountid: string;
    merchantname: string;
    companyregno: string;
    companytypeid: string;
    entrydt: string;
    quidlyuserid: string;
    status: number;
    merchantid: string;
}

export interface ICardData {
    nameOnCard: string;
    cardNumber: string;
    expirationMonth: string;
    expirationYear: string;
    cvv: string;
    expiryDate: string;
}

export interface IApiKeyData {
    p_accountid: string;
    p_merchantid: string;
    p_businessadminid: string;
    p_apikeyname: string;
    expirydt: string; // Using string because it's in ISO string format
    status?: number;  // Using number for status because it's an integer
}

export interface IApiKeyData2 {
    accountid: string;
    apikey: string;
    apikeyname: string;
    businessadminid: string;
    entrydt: string;  // Using string because it's in ISO string format
    expirydt: string; // Same as above
    id: number;
    merchantid: string;
    status?: number;  // Using number for status because it's an integer
}

export interface IProfileDetails {
    // accountid: string;
    // merchantid: string;
    fullname: string;
    // lname: string;
    email: string;
    isadmin: number;
    address_line1: string;
    address_line2: string;
    city: string;
    postcode: string;
    stateid: string;
    bvn: string;
    nin: string;
    kyc_status: number;
}

export interface INewUser {
    adminaccountid: string;
    merchantid: string;
    adminuserid: string;
    adminemail: string;
    firstname: string;
    lastname: string;
    useremail: string;
    userpassword: string;

}

export interface IBank {
    accountid: string,
    merchantid: string,
    subaccountid: string,
    bankid: string,
    bankaccountno: string,
    bankaccountname: string,
    banksortcode: string,
    quidlyuserid: string,
    entrydt: string,
    status: number

}
