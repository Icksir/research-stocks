import logging
import os
from settings.env_config import env_settings

def setup_logging(file_path='logs/logs.log', log_level: str = None):
    # Get logger
    logger = logging.getLogger(__name__)
    
    # Clear any existing handlers to prevent duplication
    if logger.hasHandlers():
        logger.handlers.clear()
        
    # Check if log file exists, create directory if needed
    log_dir = os.path.dirname(os.path.abspath(file_path))
    if log_dir and not os.path.exists(log_dir):
        os.makedirs(log_dir, exist_ok=True)

    # Create the file if it doesn't exist
    if not os.path.exists(file_path):
        with open(file_path, 'w') as f:
            pass  # Create empty file

    # Configurar nivel según ambiente
    log_level = getattr(logging, env_settings.log_level.upper() if log_level is None else log_level.upper())
    
    # Create handlers
    c_handler = logging.StreamHandler()
    f_handler = logging.FileHandler(file_path)
    c_handler.setLevel(log_level)
    f_handler.setLevel(log_level)
    
    # Create formatters and add to handlers
    if env_settings.environment == "development":
        format_str = '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
    else:
        format_str = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        
    c_format = logging.Formatter(format_str)
    f_format = logging.Formatter(format_str)
    c_handler.setFormatter(c_format)
    f_handler.setFormatter(f_format)
    
    # Add handlers to the logger
    logger.setLevel(logging.DEBUG)
    logger.addHandler(c_handler)
    logger.addHandler(f_handler)
    
    return logger