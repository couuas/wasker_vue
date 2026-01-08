import os
import sys
import ftplib
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_env_var(name):
    val = os.environ.get(name)
    if not val:
        logger.error(f"Environment variable {name} is not set.")
        sys.exit(1)
    return val

def delete_recursive(ftp, path):
    """
    Recursively delete everything at the given path.
    """
    try:
        ftp.cwd(path)
        current_path = ftp.pwd()
        logger.info(f"Cleaning directory: {current_path}")
        
        # Get list of files/dirs in current directory
        # mlsd is better but nlst/dir is more standard across old servers
        # We'll use nlst first
        try:
            items = ftp.nlst()
        except ftplib.error_perm:
            # Empty directory or permissions issue
            items = []

        for item in items:
            if item in ('.', '..'):
                continue
            
            try:
                # Try to delete as file first
                ftp.delete(item)
                logger.info(f"Deleted file: {item}")
            except ftplib.error_perm:
                # If it fails, assume it's a directory (or protected file)
                try:
                    delete_recursive(ftp, item) # Recurse
                    ftp.rmd(item) # Remove the now empty directory
                    logger.info(f"Deleted directory: {item}")
                except ftplib.error_perm as e:
                    logger.warning(f"Could not delete {item}: {e}")

        # Go back up
        ftp.cwd('..')
    except Exception as e:
        logger.error(f"Error cleaning path {path}: {e}")
        raise


def upload_directory_contents(ftp, local_dir):
    """
    Uploads the *contents* of local_dir to the *current* remote directory.
    """
    for item in os.listdir(local_dir):
        full_local_path = os.path.join(local_dir, item)
        
        if os.path.isfile(full_local_path):
            logger.info(f"Uploading {item}")
            with open(full_local_path, 'rb') as f:
                ftp.storbinary(f'STOR {item}', f)
        elif os.path.isdir(full_local_path):
            logger.info(f"Creating remote directory {item}")
            try:
                ftp.mkd(item)
            except ftplib.error_perm:
                pass # Directory likely exists
            
            ftp.cwd(item)
            upload_directory_contents(ftp, full_local_path)
            ftp.cwd('..')

def main():
    FTP_HOST = get_env_var('FTP_HOST')
    FTP_USER = get_env_var('FTP_USERNAME')
    FTP_PASS = get_env_var('FTP_PASSWORD')
    
    LOCAL_DIST_DIR = 'dist'
    REMOTE_TARGET_DIR = '/wwwroot'

    if not os.path.exists(LOCAL_DIST_DIR):
        logger.error(f"Local distribution directory '{LOCAL_DIST_DIR}' not found.")
        sys.exit(1)

    try:
        logger.info(f"Connecting to FTP: {FTP_HOST}")
        # Use gbk encoding to handle Chinese Windows FTP servers
        ftp = ftplib.FTP()
        ftp.encoding = 'gbk'
        ftp.connect(FTP_HOST)
        ftp.login(FTP_USER, FTP_PASS)
        logger.info("Login successful")

        # Navigate to target
        try:
            ftp.cwd(REMOTE_TARGET_DIR)
        except ftplib.error_perm:
             logger.error(f"Remote directory {REMOTE_TARGET_DIR} does not exist or unaccessible.")
             sys.exit(1)
        
        # 1. Clear Remote Directory
        logger.info("Starting cleanup of remote directory...")
        # To avoid deleting the /wwwroot folder itself (which might be disallowed), 
        # we list items and delete them.
        try:
            items = ftp.nlst()
            for item in items:
                if item in ('.', '..'): continue
                try:
                    ftp.delete(item)
                    logger.info(f"Deleted {item}")
                except ftplib.error_perm:
                    # Likely a directory
                    delete_recursive(ftp, item)
                    try:
                        ftp.rmd(item)
                        logger.info(f"Deleted directory {item}")
                    except ftplib.error_perm as e:
                        logger.warning(f"Failed to remove directory {item}: {e}")
        except Exception as e:
            logger.error(f"Error during cleanup: {e}")
            # Depending on policy, we might want to continue or exit.
            # We'll continue but warn.
            logger.warning("Continuing with upload despite cleanup errors...")

        # 2. Upload Files
        logger.info("Starting upload...")
        upload_directory_contents(ftp, LOCAL_DIST_DIR)
        
        # 3. Special handling for 404.html -> /wwwroot/_HttpErrors/
        local_404 = os.path.join(LOCAL_DIST_DIR, '404.html')
        remote_error_dir = '/wwwroot/_HttpErrors'
        
        if os.path.exists(local_404):
            logger.info(f"Deploying 404.html to {remote_error_dir}...")
            try:
                # Try to navigate to error dir, create if not exists
                # Reset to root context first just in case
                ftp.cwd('/') 
                
                # Check if _HttpErrors exists, we can try to cwd directly
                try:
                    ftp.cwd(remote_error_dir)
                except ftplib.error_perm:
                    logger.info(f"Remote directory {remote_error_dir} not found. Attempting to create.")
                    # We might need to create it. Assuming /wwwroot exists since we were just there.
                    ftp.cwd(REMOTE_TARGET_DIR)
                    try:
                        ftp.mkd('_HttpErrors')
                    except ftplib.error_perm:
                        pass # Might exist but blocked, or other issue
                    ftp.cwd('_HttpErrors')

                # Upload 404.html
                with open(local_404, 'rb') as f:
                    ftp.storbinary('STOR 404.html', f)
                logger.info("Successfully uploaded 404.html to _HttpErrors")
                
            except Exception as e:
                logger.warning(f"Failed to deploy custom error page to {remote_error_dir}: {e}")
        
        logger.info("Deployment complete.")
        ftp.quit()

    except Exception as e:
        logger.error(f"FTP Deployment failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
