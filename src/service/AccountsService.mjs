import { getError } from "../errors/error.mjs";
import MongoConnection from "../mongo/MongoConnection.mjs"
import bcrypt from 'bcrypt';
export default class AccountsService {
    #accounts
    #connection
    constructor(connection_str, db_name) {
        this.#connection = new MongoConnection(connection_str, db_name);
        this.#accounts = this.#connection.getCollection('accounts');
    }
    async insertAccount(account) {
        const accountDB = await this.#accounts.findOne({_id:account.username});
        if(accountDB) {
            throw getError(400, `account for ${account.username} already exists`);
        }
        const toInsertAccount = this.#toAccountDB(account);
        const result = await this.#accounts.insertOne(toInsertAccount);
        if (result.insertedId == account.username) {
            return toInsertAccount;
        }        
    }

    async getAccount(id)
    {
        const accountDB = await this.#accounts.findOne({_id:id});
        if(!accountDB) {
            throw getError(400, `account for ${id} not exists`);
        }
        return accountDB;
    }

    async updateAccountPassword(account) {
        const accountDB = await this.#accounts.findOne({_id:account.username});
        if(!accountDB) {
            throw getError(400, `account ${account.username} not exists`);
        }
        const isPasswordCorrect = bcrypt.compareSync(account.password, accountDB.hashPassword);
        if(!isPasswordCorrect)
        {
            throw getError(400, `password of account for ${id} is not correct`);
        }
        const hashPassword=bcrypt.hashSync(account.newpassword, 10);
        const passwordUpdated = await this.#accounts.updateOne(
            { _id: account.username },
            { $set: { hashPassword } },
            );
        if (!passwordUpdated)  {
            throw getError(404, `password for ${account.username} not update`);
        }  
        return passwordUpdated.modifiedCount;   
    }
    #toAccountDB(account) {
        const accountDB = {};
        accountDB._id = account.username;
        accountDB.email = account.email;
        accountDB.hashPassword = bcrypt.hashSync(account.password, 10);
        return accountDB;
    }

    async deleteAccount(id)
    {
        const accountDB = await this.#accounts.deleteOne({_id:id});
        if(!accountDB) {
            throw getError(400, `account for ${id} not exists`);
        }
        return accountDB;
    }
}