from celery import shared_task
from core.storage_client import get_storage_client
import os
from dotenv import load_dotenv
import logging
from .models import DataSet

logger = logging.getLogger(__name__)

load_dotenv()

@shared_task
def Qurantine_to_Ready_Bucket(id , key , data_type):
    if not key or not data_type:
        return {
            "status": "FAILED",
            "error": f"key or datatype not provided"
        }
    
    # TODO : implement different pipelines accoding to data_type(csv , images , audio)
    # TODO : implement all data_validation test as explained in data_validators.py

    # for prototype we are directly pushing all files from our quarantine bucket to main bucket

    try : 
        s3_client = get_storage_client()

        if data_type:
            source_bucket = os.getenv("MINIO_QURANTINE_BUCKET_NAME")
            dest_bucket = os.getenv("MINIO_READY_BUCKET_NAME")
    
            copy_source = {
                'Bucket' : source_bucket,
                'Key' : key
            }

            s3_client.copy(
                CopySource = copy_source,
                Bucket = dest_bucket,
                Key = key
            )

            s3_client.delete_object(
                Bucket = source_bucket ,
                Key = key
            )

            data = DataSet.objects.filter(id = id).update(status = "ready")

            return {
            "status": "SUCCESS",
            "moved_file": key,
            "origin": source_bucket,
            "destination": dest_bucket,
        }
    except Exception as e:
        logger.error(f"error while transfering files from qurantine bucket to ready bucket {e}")
        return {
            "status": "FAILED",
            "error": f"pipeline execution breakdown while transfering from quarantine to ready bucket : {str(e)}"
        }
            

        