import random
import time
# *IMPORTANT* parameters may change based on integration (currently placeholders)

class RekogTransientError(Exception):
    def __init__(self, message = "Rekog failure!!! Retries exhausted", error_code = "OUT_OF_RETRIES"):
        super().__init__(message)
        self.error_code = error_code
    
    # Custom exception representing a temporary Rekognition failure after retries are exhausted

# what counts for retry
RETRYABLE_ERRORS = {"ProvisionedThroughputExceededException", "ThrottlingException", "RequestLimitExceeded", "ServiceUnavailableException"}

# pull out norm info from exception for logs and retry decisions
def extract_error_details(error):
    error_code = "UNKNOWN_ERROR"    #default fallback
    status_code = None
    message = str(error)

    if hasattr(error, "response"):          #check if error has a respone attribute
        response = error.response
        
        if "Error" in response:             #extract error_code + message
            error_code = response["Error"].get("Code", error_code)
            message = response["Error"].get("Message", message)
        
        if "ResponseMetadata" in response:  #extract status_code
            status_code = response["ResponseMetadata"].get("HTTPStatusCode", status_code)
    return{
        "error_code": error_code,
        "status_code": status_code,
        "message": message
    }

# Decide whether the caught error is temp
def is_retryable_rekog_error(error_dets):

    error_code = error_dets["error_code"]
    status_code = error_dets["status_code"]

    if error_code in RETRYABLE_ERRORS:  #check retryable named AWS erros
        return True
    if status_code is not None and 500 <= status_code <= 599:    #check generic HTTP 5xx
        return True
    return False

# Return jittered wait time
def compute_retry_delay(attempt_nums):
    #take the attempt number
    max_delay = attempt_nums
    delay = random.uniform(0, max_delay)    #return random value 0 - max delay
    return delay

# Rekog call safely
def call_rekog_with_retries(client, bucket, key, request_id, logger):
    for attempt in range(1, 4):     #loop 3 attmepts 1 original 2 retries
        try:
            response = client.detect_labels(        #"actual" AWS calls
                Image={
                    "S3Object":{
                        "Bucket": bucket,
                        "Name": key
                    }
                }
            )
            return response     #if successful return results
        
        except Exception as error:      
            error_dets = extract_error_details(error)           #extract useful info error
            retryable = is_retryable_rekog_error(error_dets)    #check if error is retryable
            
            logger.info(        #log failure info
                f"RequestID: {request_id} | S3Key: {key} | Attempt: {attempt} | "
                f"ErrorCode: {error_dets['error_code']} | Retryable: {retryable}"
            )
            if not retryable:       #if not retryable stop
                raise 
            if attempt == 3:        #if las attempt and stil failes raise custom error
                raise RekogTransientError() from error
            if attempt < 3:
                delay = compute_retry_delay(attempt)        #otherwise retry: calc delay/wait
                logger.info(
                    f"RequestID: {request_id} | S3Key: {key} | Attempt: {attempt} | "
                    f"Retrying in {delay:.2f} seconds"
                )
                time.sleep(delay)
                

# placeholder until backend content is done
def handle_rekog_failure(error, request_id, key, logger):
    error_dets = extract_error_details(error)       #extract details

    logger.error(f"RequestID: {request_id} | S3Key: {key} | "        #log final failure
                 f"ErrorCode: {error_dets['error_code']} | Message: {error_dets['message']}")
    
    return{     #*PLACEHOLDER* respnsce till backend
        "error": "rekognition_failure",
        "retryable": isinstance(error, RekogTransientError),
        "request_id": request_id
    }