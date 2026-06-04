import uuid
from .models import DataSet
from django.http import HttpResponseForbidden
from .ingestion import kaggle_Ingestion_Handler , Local_Ingestion_Handler
import logging

logger = logging.getLogger(__name__)

def save_Kaggle_data(*,organization , url , kaggleusername , kaggle_api_key , filename = None):
    if not organization :
        return HttpResponseForbidden("invalid creds")
    
    id = uuid.uuid4()
    
    filename = url.split(" ")[-1].split("/")[-1] # get dataset name 

    if not filename:
        return None 

    handler = kaggle_Ingestion_Handler(id=id , tenant_id = organization.id , url=url , kaggle_username=kaggleusername , kaggle_api_key=kaggle_api_key , filename=filename)

    key = handler.process()
    
    if not key:
        return None
    
    try: 
        dataset = DataSet.objects.create(
            id = id ,
            organization = organization, 
            name = filename ,
            file_path = key,
            source_type = "kaggle",
            status = "qurantine"
        )
        # currently data is in qurantine bucket it will be checked first then placed in ready / production bucket 
        # add logic for celery / background worker to check and update status for data 
        
        return 1
    except Exception as e : 
        logger.error("error while creating a dataset instance in database : " , e)
        return None
        
def save_Local_data(*,organization , file , filename = None):
    if not organization :
        return HttpResponseForbidden("invalid creds")
    
    id = uuid.uuid4()
    
    filename = getattr(file , "name" , None)

    if not filename:
        return None

    handler = Local_Ingestion_Handler(id=id , tenant_id = organization.id , file=file , filename=filename)

    key = handler.process()
    
    if not key:
        return None
    
    try: 
        dataset = DataSet.objects.create(
            id = id , 
            name = filename ,
            file_path = key,
            source_type = "local",
            status = "qurantine"
        )
        # currently data is in qurantine bucket it will be checked first then placed in ready / production bucket 
        # add logic for celery / background worker to check and update status for data 

        return 1
    except Exception as e : 
        logger.error(f"error while creating a dataset instance in database : {e}")
        return None
    

