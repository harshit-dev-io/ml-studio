from core.storage_client import get_storage_client
from dotenv import load_dotenv
import os
import requests
import logging
import io

logger = logging.getLogger(__name__)

CHUNK_SIZE = 5*1024*1024 # hardcoded 5 mb chunk size 
# implement a dynamic chunk size based on file size or subscription based model 

class Base_Ingestion():
    def __init__(self , id ,tenant_id ,filename ):
        self.id = id 
        self.s3_client = get_storage_client()
        self.bucket_name = os.getenv("MINIO_QURANTINE_BUCKET_NAME")
        self.tenant_id = tenant_id
        self.filename = filename

    def get_object_key(self):
        if self.filename:
            return f"tenant_{self.tenant_id}/qurantine/{self.id}/{self.filename}"
    
    def initalize_multi_part(self , key):
        mpu = self.s3_client.create_multipart_upload(
            Bucket = self.bucket_name , Key = key
        )
        return mpu["UploadId"]
    
class kaggle_Ingestion_Handler(Base_Ingestion):
    def __init__(self ,id,tenant_id , url , kaggle_username , kaggle_api_key , filename = None ):
        super().__init__(id=id , tenant_id=tenant_id , filename=filename)
        self.url = url
        self.kaggle_username = kaggle_username
        self.kaggle_api_key = kaggle_api_key

    def process(self):
        key = self.get_object_key()
        mpu_id = self.initalize_multi_part(key=key)
        parts = []

        url_parts = self.url.split(" ")

        if url_parts[1] == "competitions" :
            self.url = f"https://www.kaggle.com/api/v1/competitions/data/download-all/{url_parts[-1]}"
        elif url_parts[1] == "datasets" :
            self.url = f"https://www.kaggle.com/api/v1/datasets/download/{url_parts[-1]}"
        else:
            return None
        try:
            part_number = 1

            buffer = io.BytesIO() # get a buffer space in memory
            with requests.get(self.url, auth=(self.kaggle_username, self.kaggle_api_key), stream=True) as response:
            
                response.raise_for_status()

                for chunk in response.iter_content(chunk_size= 128 * 1024): # get data in 128kb chunks 
                    if chunk : 

                        buffer.write(chunk) # write data in buffer memory

                        if buffer.tell() >= CHUNK_SIZE: 
                            buffer.seek(0)
                            part = self.s3_client.upload_part(
                                Bucket = self.bucket_name,
                                Key = key,
                                UploadId = mpu_id,
                                PartNumber = part_number,
                                Body = buffer.read(),
                            )
                            parts.append({"PartNumber":part_number , "ETag" : part["ETag"]})
                            part_number += 1

                            buffer.seek(0)
                            buffer.truncate(0)

                if buffer.tell() > 0:
                    buffer.seek(0)
                    part = self.s3_client.upload_part(
                        Bucket=self.bucket_name,
                        Key=key,
                        UploadId=mpu_id,
                        PartNumber=part_number,
                        Body=buffer.read(),
                    )
                    parts.append({"PartNumber": part_number, "ETag": part["ETag"]})
                    part_number += 1

                    buffer.seek(0)
                    buffer.truncate(0)
                
                self.s3_client.complete_multipart_upload(
                    Bucket = self.bucket_name , 
                    Key = key ,
                    UploadId = mpu_id , 
                    MultipartUpload = {"Parts" : parts}
                )

                return key 
                    
        except Exception as e:
            self.s3_client.abort_multipart_upload(
                Bucket = self.bucket_name,
                Key = key ,
                UploadId = mpu_id
            )
            logger.error(f"error while processing kaggle data {e}")
            return None 

class Local_Ingestion_Handler(Base_Ingestion):
    def __init__(self ,id ,  tenant_id , file , filename = None):
        super().__init__(id=id , tenant_id=tenant_id , filename=filename)
        self.file = file

    def process(self):
        key = self.get_object_key()
        mpu_id = self.initalize_multi_part(key=key)
        parts = []
        
        try: 
            part_number = 1
            for chunk in self.file.chunks(chunk_size = CHUNK_SIZE):
                if chunk :
                    part = self.s3_client.upload_part(
                            Bucket = self.bucket_name,
                            Key = key,
                            UploadId = mpu_id,
                            PartNumber = part_number,
                            Body = chunk,
                        )
                    parts.append({"PartNumber":part_number , "ETag" : part["ETag"]})
                    part_number += 1

            self.s3_client.complete_multipart_upload(
                    Bucket = self.bucket_name , 
                    Key = key ,
                    UploadId = mpu_id , 
                    MultipartUpload = {"Parts" : parts}
                )

            return key
        
        except Exception as e:
            self.s3_client.abort_multipart_upload(
                Bucket = self.bucket_name,
                Key = key ,
                UploadId = mpu_id
            )
            logger.error(f"error while processing uploaded data {e}")
            return None