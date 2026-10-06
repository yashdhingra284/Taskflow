from pydantic import BaseModel
from datetime import datetime

# we only write models for the requests which have a request body that is why we did not write any for getting task by id or all.

# we wrote this before the API so that API call (endpoint) would know what data to expect from the client
class userRegistration(BaseModel):
    name:str
    email:str
    password:str

# we wrote this before the API so that API call (endpoint) would know what data to expect from the client
class userLogin(BaseModel):
    email:str
    password:str

# we wrote this before the API so that API call (endpoint) would know what data to expect from the client
class createTask(BaseModel):
    title:str
    description:str | None = None
    priority:str = "Imp"
    due_date:datetime | None = None
    status:str = "todo"
    cat_id:int


# UPDATE_PASSWORD_MODEL
class PasswordUpdate(BaseModel):
    current_password:str
    new_password:str