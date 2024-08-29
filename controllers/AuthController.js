import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';

class AuthController {
    static async getConnect(req, res) {
        const authHeader = req.header('Authorization');
        const base64Credentials = authHeader.split(' ')[1];
        const [email, password] = Buffer.from(base64Credentials, 'base64').toString('ascii').split(':');

        const hashedPassword = sha1(password);
        const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });

        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const token = uuidv4();
        await redisClient.set(`auth_${token}`, user._id.toString(), 24 * 3600);

        res.status(200).json({ token });
    }

    static async getDisconnect(req, res) {
        const token = req.header('X-Token');
        const userId = await redisClient.get(`auth_${token}`);

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        await redisClient.del(`auth_${token}`);
        res.status(204).send();
    }
}

export default AuthController;
