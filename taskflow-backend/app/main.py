from fastapi import FastAPI, HTTPException, status
from app.database import getConnection
from app.models import userRegistration
from app.models import userLogin
from app.models import createTask
from app.models import PasswordUpdate
from app.auth import create_access_token
from app.auth import verify_access_token
from fastapi import Depends
import bcrypt

import logging
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Query
# this is a  core library that implements jose(javascript object signing and encryption) standard.
# it handles logic for structuring, formatting and reading web-tokens.

# [cryptography] is an extra installation which forces python to adopt better C based security library for 
# python



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://taskflow-frontend-vi25.onrender.com",
                   "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/test_db")
def testdb():
    conn = getConnection()
    conn.close()
    return {"Message":"Database-Connected"}

# ZEROTH ENDPOINT
@app.get("/users/me")
def get_current_user(user_id:int = Depends(verify_access_token)):
    try:
        conn = getConnection()
        cursor = conn.cursor()
        cursor.execute("SELECT user_id,name,email,created_at FROM users WHERE user_id = %s",(user_id,))

        response = cursor.fetchone()

        if not response:
            raise HTTPException(
                status_code = status.HTTP_404_NOT_FOUND,
                detail = "User Not Found"
            )

        task_response = {
            "user_id":response[0],
            "name":response[1],
            "email":response[2],
            "created_at":response[3]
        }

        return task_response

    except HTTPException:
        raise

    except Exception as e:
        print(e)
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = "Internal Server Error"
        )

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# FIRST ENDPOINT
@app.post("/registeruser")
# this is a function taking input "user" which is of type "userRegistration object".
def newregistration(user : userRegistration):

    try:
        # we established a connection to the db
        conn = getConnection()
        # after connection we need A cursor is used to execute SQL queries and fetch their results.
        cursor = conn.cursor()
        cursor.execute(
            "SELECT name FROM users WHERE email = %s",
            (user.email,)
        )
        existing_user = cursor.fetchone()
        if existing_user:
            raise HTTPException(
                status_code = 400,
                detail = "Email already registered"
            )
        password_bytes = user.password.encode("utf-8")

        # bytes to string decode
        hashed_password = bcrypt.hashpw(
                password_bytes,
                bcrypt.gensalt()
        ).decode("utf-8")

        cursor.execute(
                "INSERT INTO users(name, email, password) VALUES (%s, %s, %s) RETURNING user_id",
                (
                    user.name,
                    user.email,
                    hashed_password
                )
            )
        new_user_id = cursor.fetchone()[0]
        # the entry have not been made permanently in the db yet so we do this
        conn.commit()
        token = create_access_token({"user_id": new_user_id})
        return {
            "access_token": token,
            "token_type": "bearer"
        }
    except HTTPException:
        raise

    except Exception as e:
        print(e)
        if conn:
            conn.rollback()

        raise HTTPException(
            status_code = 500,
            detail = "Internal Server Error"
        )
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


#SECOND ENDPOINT
@app.post("/loginuser")
def userlogin(user: userLogin):
    try:
        # Connection
        conn = getConnection()

        # create cursor:: this will execute the SQL queries
        cursor = conn.cursor()
        # check if exists 

        # we will also require the stored password from the database to check if the user has entered correct password so we get it in this query only
        # to avoid hitting the database twice and optimizing.


        cursor.execute("SELECT name, password, user_id FROM users WHERE email = %s",
                    (user.email,))
        
        # execute always just executes the query and does not return anything so we need to fetch it seperately and store it in a variable
        existing_user = cursor.fetchone()

        if not existing_user:
            raise HTTPException(
                status_code = 400,
                detail = "User not registered"
            )

        # convert string to bytes = encode
        password_stored_in_db = existing_user[1].encode("utf-8")

        #  convert string to bytes = encode
        entered_password_bytes = user.password.encode("utf-8")
        does_pass_match = bcrypt.checkpw(entered_password_bytes,password_stored_in_db)

        if not does_pass_match:
            raise HTTPException(
                status_code = 400,
                detail = "Incorrect Password"
            )

        data = {
            "user_id":existing_user[2]
        }

        token = create_access_token(data)
        return {
            "access_token": token,
            "token_type": "bearer"
        }

    except HTTPException:
        raise

    except Exception as e:
        if conn:
            conn.rollback()
        print(e)
        raise HTTPException(
            status_code = 500,
            detail = "Internal Server Error"
        )

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()


# THIRD ENDPOINT
@app.post("/createTask")
def create_new_task(taskobject:createTask,
    user_id:int = Depends(verify_access_token)
):
    try:
        conn = getConnection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO tasks (title, description, priority, due_date, status, user_id, cat_id) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                    (taskobject.title, taskobject.description, taskobject.priority, taskobject.due_date, taskobject.status, user_id, taskobject.cat_id))
        conn.commit()
        return {
            "message":"Task Created Successfully"
        }
    except HTTPException:
        raise

    except Exception as e:
        if conn:
            conn.rollback()
        
        print(e)
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = "Internal Server Error"
        )
    
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# FOURTH ENDPOINT
@app.get("/gettask")
def get_user_task(
    # for pagination we add page and offset
    page: int = 1,
    limit:int = 10,
    sort: str = "newest",
    status: str = "all",
    priority: str = "all",
    due: str = "all",
    user_id:int = Depends(verify_access_token)):
    try:
        conn = getConnection()
        cursor = conn.cursor()
        # modify what you get from the query according to requirements in frontend
        # this limit and offset is for pagination
        offset = (page - 1) * limit
        if sort == "newest":
            order_by = "t.task_id DESC"

        elif sort == "oldest":
            order_by = "t.task_id ASC"

        elif sort == "due_date":
            order_by = "t.due_date ASC"

        elif sort == "priority":
            order_by = """
                CASE t.priority
                    WHEN 'Most Imp' THEN 1
                    WHEN 'Imp' THEN 2
                    WHEN 'Least Imp' THEN 3
                END ASC
            """

        elif sort == "title":
            order_by = "t.title ASC"

        else:
            order_by = "t.task_id DESC"

        conditions = ["t.user_id = %s"]
        values = [user_id]

        if status != "all":
            conditions.append("t.status = %s")
            values.append(status)

        if priority != "all":
            conditions.append("t.priority = %s")
            values.append(priority)


        if due == "overdue":
            conditions.append("t.due_date < CURRENT_DATE")
            conditions.append("t.status != 'done'")

        elif due == "within_7_days":
            conditions.append(
        "       t.due_date >= CURRENT_DATE AND t.due_date <= CURRENT_DATE + INTERVAL '7 days'"
            )

        elif due == "no_due_date":
            conditions.append("t.due_date IS NULL")

        where_clause = " AND ".join(conditions)

        cursor.execute(f"""
            SELECT COUNT(*)
            FROM tasks t
            WHERE {where_clause}
            """, tuple(values))

        total = cursor.fetchone()[0]   

        

        cursor.execute(f"""
            SELECT
                t.title,
                t.description,
                t.priority,
                t.due_date,
                t.status,
                c.cat_name,
                t.task_id,
                t.cat_id,
                t.created_at,
                t.updated_at
            FROM tasks t
            LEFT JOIN categories c
            ON t.cat_id = c.cat_id
            WHERE {where_clause}
            ORDER BY {order_by}
            LIMIT %s OFFSET %s
            """, (*values, limit, offset))

        tasks = cursor.fetchall()
        # if not tasks:
        #     raise HTTPException(
        #             status_code=status.HTTP_404_NOT_FOUND,
        #             detail="No tasks found"
        #         )

        task_responses = []
        if tasks:
            counter = 1
            for task in tasks:
                task_dict = {
                    "User_id":user_id,
                    "Task no":counter,
                    "Title":task[0],
                    "Description":task[1],
                    "Priority":task[2],
                    "Due_Date":task[3],
                    "Status":task[4],
                    "Category":task[5],
                    "task_id":task[6],
                     "cat_id": task[7],
                     "created_at": task[8],
                     "updated_at": task[9]
                }
                task_responses.append(task_dict)
                counter = counter + 1
        
        return {
            "items": task_responses,
            "total": total
        }
        
            


    except HTTPException:
        raise

    except Exception as e:
        if conn:
            # conn.rollback()
            print(e)
            raise HTTPException(
                status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail = "Internal Server Error"
            )
    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()

# FIFTH ENDPOINT
@app.get("/tasks/{task_id}")
def get_task_by_id(task_id:int, user_id:int = Depends(verify_access_token)):
    try:
        conn = getConnection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                t.task_id,
                t.title,
                t.description,
                t.priority,
                t.due_date,
                t.status,
                c.cat_name,
                t.cat_id,
                t.created_at,
                t.updated_at
            FROM tasks t
            LEFT JOIN categories c
            ON t.cat_id = c.cat_id
            WHERE t.task_id = %s
            AND t.user_id = %s
            """, (task_id, user_id))
        
        response = cursor.fetchone()

        if not response:
            raise HTTPException(
                status_code = status.HTTP_404_NOT_FOUND,
                detail = "Task Not Found"
            )

        task_response = {
            "task_id":response[0],
            "title":response[1],
            "description":response[2],
            "priority":response[3],
            "due_date":response[4],
            "status":response[5],
            "cat_name":response[6],
            "cat_id":response[7],
            "created_at":response[8],
            "updated_at":response[9]
        }

        return task_response


    except HTTPException:
        raise

    except Exception as e:
        print(e)
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = "Internal Server Error"
        )

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# SIXTH ENDPOINT
@app.put("/update_task/{task_id}")
def update_task_by_id(task_id: int, update_Task: createTask, user_id:int = Depends(verify_access_token)):
    try:
        conn = getConnection()
        cursor = conn.cursor()
        cursor.execute("""UPDATE tasks
                    SET
                    title = %s,
                    description = %s,
                    priority = %s,
                    due_date = %s,
                    status = %s,
                    cat_id = %s,
                    updated_at = CURRENT_TIMESTAMP
                    WHERE task_id = %s
                    AND
                    user_id = %s""", (update_Task.title, update_Task.description, update_Task.priority, update_Task.due_date, update_Task.status, update_Task.cat_id, task_id,user_id,)
                    )
        
        # what if the task_id does not exist in previous endpoint we came to know about this by fetchone() not having
        # any response but here there is no fetchone() so to know if something is updated or not we use 'rowcount' 

        # rowcount tells us how many rows were altered by the update query if no row was altered then it means id does
        # not exists and we can raise 404 error.
        if cursor.rowcount == 0:
            raise HTTPException(
                status_code = status.HTTP_404_NOT_FOUND,
                detail = "Task ID Not Found"
            )
        conn.commit()

        cursor.execute(""" SELECT
                            t.task_id,
                            t.title,
                            t.description,
                            t.priority,
                            t.due_date,
                            t.status,
                            c.cat_name,
                            t.cat_id,
                            t.created_at,
                            t.updated_at
                            FROM tasks t
                            LEFT JOIN categories c
                            ON t.cat_id = c.cat_id
                            WHERE t.task_id = %s
                            AND t.user_id = %s
                            """,(task_id,user_id))
        response = cursor.fetchone()
        frontend_response = {
            "task_id": response[0],
            "title": response[1],
            "description": response[2],
            "priority": response[3],
            "due_date": response[4],
            "status": response[5],
            "cat_name": response[6],
            "cat_id":response[7],
            "created_at": response[8],
            "updated_at": response[9]
        }

        return frontend_response
    except HTTPException:
        raise
    except Exception as e:
        if conn:
            conn.rollback()
        print(e)
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = "Internal Server Error"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# SEVENTH ENDPOINT
@app.delete("/delete_task/{task_id}")
def delete_by_task_id(task_id:int, user_id:int = Depends(verify_access_token)):
    try:
        conn = getConnection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tasks WHERE task_id = %s AND user_id = %s",
                    (task_id,user_id))
        if cursor.rowcount == 0:
            raise HTTPException(
                status_code = status.HTTP_404_NOT_FOUND,
                detail = "Task Not Found"
            )
        conn.commit()
        return {
            "message":"Task Deletd"
        }
    
    except HTTPException:
        raise

    except Exception as e:
        if conn:
            conn.rollback()
        print(e)
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = "Internal Server Error"
        )

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()

# EIGHTH ENDPOINT
@app.get("/search_task")
def search_task(
    query: str,
    page: int = 1,
    limit: int = 10,
    task_status: str = Query("all", alias="status"),
    priority: str = "all",
    due: str = "all",
    user_id: int = Depends(verify_access_token)
):
    
    try:    
        conn = getConnection()
        cursor = conn.cursor()
        search = "%" + query + "%"
        offset = (page - 1) * limit
        conditions = [
            "t.user_id = %s",
            "(t.title ILIKE %s OR t.description ILIKE %s)"
        ]

        values = [user_id, search, search]

        if task_status != "all":
            conditions.append("t.status = %s")
            values.append(task_status)

        if priority != "all":
            conditions.append("t.priority = %s")
            values.append(priority)

        if due == "overdue":
            conditions.append("t.due_date < CURRENT_DATE")
            conditions.append("t.status != 'done'")

        elif due == "within_7_days":
            conditions.append(
            "t.due_date >= CURRENT_DATE "
            "AND t.due_date <= CURRENT_DATE + INTERVAL '7 days'"
        )

        elif due == "no_due_date":
            conditions.append("t.due_date IS NULL")

        where_clause = " AND ".join(conditions)

        cursor.execute(f"""
            SELECT COUNT(*)
            FROM tasks t
            WHERE {where_clause}
        """, tuple(values))

        total = cursor.fetchone()[0]

        cursor.execute(f"""
            SELECT
            t.task_id,
            t.title,
            t.description,
            t.priority,
            t.due_date,
            t.status,
            c.cat_name,
            t.cat_id,
            t.created_at,
            t.updated_at
            FROM tasks t
            LEFT JOIN categories c
            ON t.cat_id = c.cat_id
            WHERE {where_clause}
            LIMIT %s OFFSET %s
            """, (*values, limit, offset))

        response = cursor.fetchall()

        # if not response:
        #     raise HTTPException(
        #         status_code = status.HTTP_404_NOT_FOUND,
        #         detail = "Task Not Found"
        #     )
        search_results = []

        for task in response:
            search_results.append({
            "task_id": task[0],
            "title": task[1],
            "description": task[2],
            "priority": task[3],
            "due_date": task[4],
            "status": task[5],
            "cat_name": task[6],
            "cat_id": task[7],
            "created_at": task[8],
            "updated_at": task[9]
        })
        return {
            "items": search_results,
            "total": total
        }
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = "Internal Server Error"
        )
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# GET CATEGORIES END POINT
@app.get("/get_category")
def get_category():
    conn = None
    cursor = None
    try:
        conn = getConnection()
        cursor = conn.cursor()

        cursor.execute("SELECT cat_id, cat_name from categories")

        response = cursor.fetchall()

        if not response:
            raise HTTPException(
                status_code = status.HTTP_404_NOT_FOUND,
                detail = "No Categories"
            )

        cat_response = []
        for resp in response:
            cat_dict = {
                "cat_id":resp[0],
                "cat_name":resp[1]
            }

            cat_response.append(cat_dict)

        return cat_response

    except HTTPException:
        raise

    except Exception as e:
        print(e)

        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = "Internal Server Error"
        )

    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()
    


# UPDATE-PASSWORD ENDPOINT
@app.put("/update_password")
def update_pass(password:PasswordUpdate,
                user_id:int = Depends(verify_access_token)):
    conn = None
    cursor = None
    try:
        conn = getConnection()
        cursor = conn.cursor()

        cursor.execute("""
                        SELECT password
                        FROM users
                        WHERE user_id = %s""",
                        (user_id,))

        oldpass = cursor.fetchone()
        if not oldpass:
            raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
            )

        
        #because oldpass is a tuple ("$2b$12$abcdef...",) 
        storedpass = oldpass[0].encode("utf-8")


        currentpass = password.current_password.encode("utf-8")

        if not bcrypt.checkpw(currentpass,storedpass):
            raise HTTPException(
                status_code = status.HTTP_400_BAD_REQUEST,
                detail = "Current password is incorrect"
            )


        newpass = password.new_password.encode("utf-8")
        # bytes to string decode
        hashed_password = bcrypt.hashpw(
                newpass,
                bcrypt.gensalt()
        ).decode("utf-8")

        cursor.execute("""UPDATE users
                        SET password = %s
                        WHERE user_id = %s
                        """,
                        (hashed_password,
                         user_id))

        conn.commit()
        return{
            "message":"Password updated successfully"
        }

    except HTTPException:
        conn.rollback()
        raise

    except Exception as e:
        if conn:
            conn.rollback()
        print(e)
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = "Internal Server Error"
        )

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# DELETE ENDPOINT
@app.delete('/delete_user')
def deleteuser(user_id:int = Depends(verify_access_token)):
    conn = None
    cursor = None

    try:
        conn = getConnection()
        cursor = conn.cursor()

        cursor.execute("""
            DELETE FROM notifications
            WHERE user_id = %s
            OR task_id IN (
            SELECT task_id
            FROM tasks
            WHERE user_id = %s
            )
            """, (user_id, user_id))
        
        cursor.execute("DELETE FROM tasks WHERE user_id = %s",(user_id,))
        cursor.execute("DELETE FROM users WHERE user_id = %s",(user_id,))

        conn.commit()

    except HTTPException:
        if conn:
            conn.rollback()
        raise

    except Exception as e:
        if conn:
            conn.rollback()
        print(e)
        raise HTTPException(
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail = "Internal Server Error"
        )
    finally:
        if cursor:
            cursor.close()

        if conn:
            conn.close()
    