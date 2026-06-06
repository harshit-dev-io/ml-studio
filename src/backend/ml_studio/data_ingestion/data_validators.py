# this file will include test / validation steps for processing data 
# before pushing any data to ready / production bucket the following tests/steps should be taken

"""
1.  check datatyes of files and verify file type :
    in file name and metadata of file (content-type) should be same as file type retrived from bytes of file
"""

"""
2.  if file is compressed / zip :
    check for zip bombing by decompressing ratio 

"""
"""
3. check for malware :
    1. if file is a zip file decompress in chunks and then run a malware scan and send data in chunks to production bucket if everything is fine 
    2. bring chunks from qurantine bucket and check for malware scan and push to production / ready bucket

"""