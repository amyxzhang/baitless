import logging
import logging.handlers
import cloghandler


LOG_LEVEL = logging.INFO

LOG_PATH = '/var/opt/spoilbait/logs/'

formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(process)d - %(message)s')
logger = logging.getLogger('spoilbait')

filehandler = cloghandler.ConcurrentRotatingFileHandler(''.join([LOG_PATH, 'spoilbait.log']), mode='a', maxBytes=10*2**20, backupCount=3)
filehandler.setLevel(LOG_LEVEL)
filehandler.setFormatter(formatter)
logger.addHandler(filehandler)

handler = logging.StreamHandler()
handler.setLevel(LOG_LEVEL)
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.setLevel(LOG_LEVEL)