#!/bin/bash

echo "-- Minimizing Files"
gulp

echo "-- Copying to S3"
aws s3 sync ./dist/ s3://trackmymood.online --acl=public-read --profile=gtri --region=us-east-1

echo "-- Invalidating index.html"
aws cloudfront create-invalidation --profile gtri --distribution-id E2BNQW5A4Q5IS4 --invalidation-batch file://invbatch.json
