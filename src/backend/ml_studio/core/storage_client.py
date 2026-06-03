from dotenv import load_dotenv
import boto3
load_dotenv
import os
import logging

logger = logging.getLogger(__name__)


def get_storage_client():
    try:
        client = boto3.client(
            "s3",
            endpoint_url = os.getenv("MINIO_ENDPOINT_URL"),
            aws_access_key_id = os.getenv("MINIO_ACCESS_KEY") ,
            aws_secret_key_id = os.getenv("MINIO_SECRET_KEY"),
            region_name = os.getenv("MINIO_REGION_NAME")
        )
    except Exception as e :
        logger.error("storage_client fail : " , e)
        raise # stop the server 

    return client
