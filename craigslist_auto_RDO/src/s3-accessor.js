const AWS = require('aws-sdk');
const s3 = new AWS.S3();

module.exports = {
    deleteFiles,
    getFileContent,
    saveFile,
    listFiles,
    emptyFolder
}

async function deleteFiles (Bucket, Files) {
    
    var params = { 
        Bucket: Bucket, 
        Delete: { 
            Objects: Files.map(x => {
                return { Key: x };
            })
        } 
    };
    
    return s3.deleteObjects(params, function(err, data) {
        if (err) return;
    }).promise();
}

async function getFileContent (Bucket, Key) {
    
    var content;

    await s3.getObject({ Bucket: Bucket, Key: Key }, function (err, data) {
        if (err) return;
        console.log(JSON.stringify(data));
        // content = data.Body.toString('ascii');
    }).promise();

    return content;
}

async function saveFile (Bucket, DKey, content) {
    await s3.putObject({ Bucket: Bucket, Key: DKey, Body: content }, (res) => {
        console.log(`line 23: Successfully uploaded!`);
    }).promise();
}

async function listFiles (Bucket, Prefix) {
    var files = [];

    await s3.listObjects({ Bucket: Bucket, Prefix: Prefix }, function(err, data) {
        if (err) return;

        data.Contents.forEach(function(content) {
            files.push(content.Key);
        });

    }).promise();
    
    return files;
}

async function emptyFolder (Bucket, Prefix) {
    var files = await listFiles(Bucket, Prefix);
    await deleteFiles(Bucket, files);
}