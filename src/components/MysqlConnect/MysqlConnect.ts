'use server'
import mysql,{ ConnectionOptions } from 'mysql2/promise';
const executeQuery = async(query:string,data : string[])=>{
    try {
        const access: ConnectionOptions = {
            host:process.env.MYSQL_HOST,
            port:3306,
            database:process.env.MYSQL_DATABASE,
            user:process.env.MYSQL_USERNAME,
            password:process.env.MYSQL_PASSWORD
          };
        const db = await mysql.createConnection(access);
        const [result] = await db.execute(query,data);
        db.end();
        return  JSON.parse(JSON.stringify(result));
    }
    catch(error){
        return null;
    }
}

export default executeQuery;