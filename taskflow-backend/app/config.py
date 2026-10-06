# THIS FILE WOULD BE STORING EVERYTHING THAT WOULD BE ACCESSING .env FILE SO ANYTHING THAT NEEDS TO ACCESS
# ANYTHING FROM .env FILE WOULD BE DONE FROM HERE SO WE ARE MOVING THE SETTINGS CLASS OF DATABASE.PY TO HERE

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # database
    DATABASE_HOST:str
    DATABASE_PORT:int
    DATABASE_NAME:str
    DATABASE_USER:str
    DATABASE_PASSWORD:str

    # jwt
    SECRET_KEY:str
    ALGORITHM:str
    ACCESS_TOKEN_EXPIRE_MINUTES:int

    # email-notification
    smtp_host: str
    smtp_port: int
    smtp_user: str
    smtp_password: str
    smtp_from: str
    
    # this modelconfig tells where to load the environment var from
    model_config = SettingsConfigDict(env_file = ".env")

settings = Settings()