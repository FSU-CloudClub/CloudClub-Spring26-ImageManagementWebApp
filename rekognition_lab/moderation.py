#This file simulates safe logging for image 

import logging

def moderation_results(logger, request_id, flagged, categories, debug = False):     #how results get logged
    logger.info(f"RequestID: {request_id} | Flagged: {flagged} | Categories: {categories}")

    if debug:           #simulates etra info 
        logger.info(f"[DEBUG] data -> RequestID: {request_id}, Categories: {categories}")

def main() -> None:             #what happens and when

    debug = False

    logger = logging.getLogger(__name__)  
    logger.setLevel(logging.INFO) 

    handler = logging.StreamHandler()
    if not logger.hasHandlers():        #prevent duplicate handlers
        logger.addHandler(handler) 
    
    request_id = "12345"                #placeholder 

    # case1
    categories = ["Bad Content"]    #possible placeholders
    flagged = len(categories) > 0                      #possible placeholders
    moderation_results(logger, request_id, flagged, categories, debug)    
    #log

    # case2
    categories = []
    flagged = len(categories) > 0                     #possible placeholders
    moderation_results(logger, request_id, flagged, categories, debug)
    #log
    
    
if __name__ == "__main__":          #run trigger
        
        main()

