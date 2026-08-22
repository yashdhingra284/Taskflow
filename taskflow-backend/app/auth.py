# ṬHIS FILE WOULD CONTAIN EVERYTHING RELATED TO JWT
from fastapi import HTTPException, status
from datetime import datetime, timedelta, UTC
from jose import jwt, JWTError
from app.config import settings
# Its main job is to automatically look for, extract, and handle a "Bearer Token" from the incoming request's
# Authorization header.
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends

# we created this object 'oauth2_scheme' for the pre-built fast-api class OAuth2PasswordBearer()
# tokenUrl = "login" is an argument for the constructror of the class OAuth2PasswordBearer() and this class reads 'bearer'
# tokens from requests
oauth2_scheme = OAuth2PasswordBearer(tokenUrl = "loginuser")



def create_access_token(data:dict):
    to_encode = data.copy()
    expiry = datetime.now(UTC) + timedelta(
        minutes = settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode["exp"] = expiry

    # three attributes of the function below : claims, key and algorithm.
    encoded_jwt = jwt.encode(
        to_encode,
        key = settings.SECRET_KEY,
        algorithm = settings.ALGORITHM
    )

    return encoded_jwt

# Depends is a Dependency Injection tool this tells FastAPI before you run this end-point's function you 
# need to run this function/class/object inside these brackets and what this object will do it will read the Bearer token 
# from the header that comes with the request 

def verify_access_token(token: str = Depends(oauth2_scheme)):
    try:
        # this is the function which verifies the jwt token that came with the request and it gives error if the token is not valid
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms = [settings.ALGORITHM]
        )

        # we extract user_id to know that which user made this request.
        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code = status.HTTP_401_UNAUTHORIZED,
                details = "Could not validate credentials"
            )
        return user_id

    except JWTError as e:
        print("JWT-ERROR:",e)
        raise HTTPException(
        status_code = status.HTTP_401_UNAUTHORIZED,
        detail = "Could not validate credentials"
        )
    
