# THIS FILE CONNECT TO POSTGRESQL USIGN psycopg AND RETURN
# A CONNECTION OBJECT SO THAT OTHER PARTS OF THE APPLICATION CAN USE IT.

# BASICALLY THIS MAINTAINS THE COMMUNICATION BETWEEN DATABSE AND PYTHON USING THE CREDENTIALS WRITTEN IN .env

import psycopg
from app.config import settings


# this function brings the connection from the database to the backend so that any API call can use it
def getConnection():
    conn = psycopg.connect(
        host = settings.DATABASE_HOST,
        port = settings.DATABASE_PORT,
        dbname = settings.DATABASE_NAME,
        user = settings.DATABASE_USER,
        password = settings.DATABASE_PASSWORD
    )
    return conn

# every time we call this function a new connection is created.