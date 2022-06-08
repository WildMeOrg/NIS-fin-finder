const { BlobServiceClient } = require('@azure/storage-blob');
const multipart = require('parse-multipart');
const axios = require('axios');
const models = require('../models');

const uploadObservationImage = (req) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const fileDetail = {};
            // Create the BlobServiceClient object which will be used to create a container client
            const blobServiceClient = BlobServiceClient.fromConnectionString(AppConstant.C.blobConnectionString);
            // Get a reference to a container
            const containerClient = blobServiceClient.getContainerClient('observation-images');
            var bodyBuffer = Buffer.from(req.body);
            var boundary = multipart.getBoundary(req.headers['content-type']);
            var parts = multipart.Parse(bodyBuffer, boundary);
            const blobName = `${Date.now()}_${parts[0].filename}`;
            fileDetail.storage_file_name = blobName;
            fileDetail.display_file_name = parts[0].filename;
            fileDetail.file_type = parts[0].type;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);
            fileDetail.storage_file_url = blockBlobClient.url;
            const uploadblobResponse = await blockBlobClient.upload(parts[0].data, parts[0].data.length);
            fileDetail.request_id = uploadblobResponse.requestId;
            resolve(fileDetail);
        } catch (error) {
            console.log("error=======",error);
            reject("Issue in upload file, Please try latar!!!");
        } 
    });
}
const getJobId = (req,fileDetail) => {
    return new Promise( async (resolve,reject)=>{
        try {
            var data = JSON.stringify({
            "input": {
                "start_detect": "/api/engine/detect/cnn/lightnet/",
                "Labeler_model_tag": "fins_vl",
                "model_tag": "fins_vl_dorsal",
                "labeler_algo": "densenet",
                "sensitivity": 0.53,
                "use_labeler_species": true,
                "nms_aware": "byclass",
                "nms_thresh": 0.6
            },
            "image_uuid_list": [
                fileDetail.storage_file_url  //"https://www.flukebook.org/wildbook_data_dir/0/3/03546226-3cc9-4c19-928f-d6cd85ac282a/3271.JPG"
            ]
            });

            var config = {
            method: 'post',
            url: 'https://tier2.dyn.wildme.io:5017/api/engine/detect/cnn/lightnet/',
            headers: { 
                'Content-Type': 'application/json'
            },
            data : data
            };

            axios(config)
            .then(function (response) {
                resolve(response.data);
            })
            .catch(function (error) {
                console.log("error in fetch job ID ===== ",error);
                throw error;
            });

        } catch (error) {
            console.log("Issue in fetch job id=======",error);
            reject(`Issue in fetch job id ==  ${error}`);
        } 
    });
}

const getJobIdResult = (req,fileDetail) => {
    return new Promise( async (resolve,reject)=>{
        try {
            var config = {
            method: 'get',
            url: `https://tier2.dyn.wildme.io:5017/api/engine/job/result/?jobid=${fileDetail.job_id}&__format__=false`
            };

            axios(config)
            .then(function (response) {
                resolve(response.data);
            })
            .catch(function (error) {
                throw error;
            });


        } catch (error) {
            console.log("Issue in fetch job id Result =======",error);
            reject(`Issue in fetch job id result ==  ${error}`);
        } 
    });
}

const saveFileDetail = (req,fileDetail) => {
    return new Promise( async (resolve,reject)=>{
        try {
            const data = await models.observationModel.create(fileDetail);
            resolve(data);
        } catch (error) {
            console.log("Error in save file detail =======",error);
            reject(`Error in save file detail`);
        } 
    });
}

module.exports = {uploadObservationImage,getJobId,getJobIdResult,saveFileDetail};
