
import { BlobServiceClient } from '@azure/storage-blob';
import path from 'path';
import { generateUid } from '../../utils/constant.js';

const connectString = process.env.AZURE_STORAGE_CONNECTION_STRING;

const uploadToAzure = async (containerName, folderPath, file,) => {
    try {
        // Create a BlobServiceClient instance
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectString);

        // Get a reference to the container
        const containerClient = blobServiceClient.getContainerClient(containerName);

        // Ensure the container exists
        await containerClient.createIfNotExists();
        await containerClient.setAccessPolicy('blob');
        const fileExtension = path.extname(file.originalname);

        const timestamp = Date.now();
        const uniqueId = generateUid()
        const blobName = `${folderPath}/${uniqueId}-${timestamp}${fileExtension}`
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // console.log(`Uploading ${blobName} to Azure Blob Storage...`);

        // Upload the file from memory buffer
        await blockBlobClient.uploadData(file.buffer, {
            blobHTTPHeaders: { blobContentType: file.mimetype },
        });

        const blobUrl = blockBlobClient.url;

        return { type: fileExtension, url: blobUrl };

    } catch (error) {
        console.log("🚀 ~ uploadToAzure ~ error:", error)
        return error;
    }
}

const extractBlobInfoFromUrl = (url) => {
    const { hostname, pathname } = new URL(url);
    const [containerName, ...blobNameParts] = pathname.split('/').slice(1);
    const blobName = blobNameParts.join('/');

    return { accountName: hostname.split('.')[0], containerName, blobName };
};

const deleteFromAzure = async (url) => {
    try {

        const { containerName, blobName } = extractBlobInfoFromUrl(url);

        const blobServiceClient = BlobServiceClient.fromConnectionString(connectString);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const options = { deleteSnapshots: 'include' };

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.deleteIfExists(options);

        console.log(`Deleted blob ${blobName}`);
    } catch (error) {
        console.log("🚀 ~ deleteFromAzure ~ error:", error)
        return error;
    }
}

export {
    uploadToAzure,
    deleteFromAzure
}