/**
 * A Lambda function that returns data read from JSON file on S3 bucket
 **/


const CfnLambda = require('cfn-lambda');
const AWS = require('aws-sdk');

Logic = {
    ReadS3Json: function (params, callback) {
        let bucket = params.Bucket,
            key = params.Key,
            s3 = new AWS.S3();

        if(params.Region){
            s3 = new AWS.S3({region: params.Region})
        }
        console.log(`Reading configuration from s3://${bucket}/${key}`);
        s3.getObject({Bucket: bucket, Key: key}, function (err, data) {
            if (err) {
                //return error
                callback(err, null);
            }
            else {
                //try parsing json file
                try {
                    let configurationObject = JSON.parse(data.Body.toString());
                    console.log(`Passing following configuration back to stack:\n${JSON.stringify(configurationObject,null,2)}`);
                    callback(null, configurationObject);
                } catch (err) {
                    callback(err, null)
                }
            }
        });
    }
};


// return json file properties
var Create = (cfnRequestParams, reply) => {
    Logic.ReadS3Json(cfnRequestParams, function (err, data) {
        if (err) {
            reply(err, `s3-${cfnRequestParams.Bucket}-${cfnRequestParams.Key}`)
        } else {
            reply(err, `s3-${cfnRequestParams.Bucket}-${cfnRequestParams.Key}`, data)
        }
    });
};

// return json file properties
var Update = (requestPhysicalID, cfnRequestParams, oldCfnRequestParams, reply) => {
    Logic.ReadS3Json(cfnRequestParams, function (err, data) {
        if (err) {
            reply(err, requestPhysicalID)
        } else {
            reply(err, requestPhysicalID, data)
        }
    });
};

// return json file properties
var Delete = (requestPhysicalID, cfnRequestParams, reply) => {
    Logic.ReadS3Json(cfnRequestParams, function (err, data) {
        if (err) {
            reply(err, requestPhysicalID)
        } else {
            reply(err, requestPhysicalID, data)
        }
    });
};

exports.handler = CfnLambda({
    Create: Create,
    Update: Update,
    Delete: Delete,
    TriggersReplacement: [],
    SchemaPath: [__dirname, 'schema.json']
});
