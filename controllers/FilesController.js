import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { ObjectId } from 'mongodb';

class FilesController {
    static async postUpload(req, res) {
        const token = req.header('X-Token');
        const userId = await redisClient.get(`auth_${token}`);

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { name, type, parentId = 0, isPublic = false, data } = req.body;

        if (!name) return res.status(400).json({ error: 'Missing name' });
        if (!type || !['folder', 'file', 'image'].includes(type)) return res.status(400).json({ error: 'Missing type' });
        if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });

        if (parentId !== 0) {
            const parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
            if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
            if (parentFile.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
        }

        const file = {
            userId: ObjectId(userId),
            name,
            type,
            parentId: parentId === 0 ? 0 : ObjectId(parentId),
            isPublic,
            createdAt: new Date(),
        };

        if (type !== 'folder') {
            const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
            if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

            const fileName = `${uuidv4()}`;
            const filePath = `${folderPath}/${fileName}`;
            await fs.promises.writeFile(filePath, Buffer.from(data, 'base64'));

            file.localPath = filePath;
        }

        const insertedFile = await dbClient.db.collection('files').insertOne(file);
        res.status(201).json({
            id: insertedFile.insertedId,
            userId,
            name,
            type,
            isPublic,
            parentId,
        });
    }
}

export default FilesController;
