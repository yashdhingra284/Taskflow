
import smtplib

from email.message import EmailMessage

from apscheduler.schedulers.background import BackgroundScheduler

from app.database import getConnection
from app.config import settings

scheduler = BackgroundScheduler()


def send_email(recipient, subject, message):
    smtp_host = settings.smtp_host
    smtp_port = settings.smtp_port
    smtp_user = settings.smtp_user
    smtp_password = settings.smtp_password
    smtp_from = settings.smtp_from

    if not all([
        smtp_host,
        smtp_user,
        smtp_password,
        smtp_from
    ]):
        raise RuntimeError("SMTP configuration is missing.")

    email = EmailMessage()

    email["From"] = smtp_from
    email["To"] = recipient
    email["Subject"] = subject

    email.set_content(message)

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.send_message(email)


def get_email_subject(notification_type):
    subjects = {
        "DUE_TOMORROW": "TaskFlow Reminder: Task Due Tomorrow",
        "DUE_SOON": "TaskFlow Reminder: Task Due in 1 Hour",
        "DUE_NOW": "TaskFlow Reminder: Task Due Now",
        "OVERDUE": "TaskFlow Reminder: Task Overdue",
    }

    return subjects.get(
        notification_type,
        "TaskFlow Task Notification"
    )


def create_overdue_notifications(cursor):
    cursor.execute(
        """
        INSERT INTO notifications
        (
            user_id,
            task_id,
            type,
            message,
            scheduled_at
        )
        SELECT
            t.user_id,
            t.task_id,
            'OVERDUE',
            '"' || t.title || '" is overdue.',
            CURRENT_TIMESTAMP
        FROM tasks t
        WHERE t.due_date IS NOT NULL
        AND t.due_date <= CURRENT_TIMESTAMP
        AND t.status != 'done'
        AND NOT EXISTS
        (
            SELECT 1
            FROM notifications n
            WHERE n.task_id = t.task_id
            AND n.type = 'OVERDUE'
        )
        """
    )


def check_notifications():
    conn = None
    cursor = None

    try:
        conn = getConnection()
        cursor = conn.cursor()

        # Create overdue notifications for incomplete tasks
        create_overdue_notifications(cursor)

        conn.commit()

        # Find notifications whose scheduled time has arrived
        cursor.execute(
            """
            SELECT
                n.notification_id,
                n.task_id,
                n.type,
                n.message,
                u.email
            FROM notifications n
            JOIN users u
                ON n.user_id = u.user_id
            WHERE n.scheduled_at <= CURRENT_TIMESTAMP
            AND n.sent_at IS NULL
            ORDER BY n.scheduled_at
            """
        )

        notifications = cursor.fetchall()

        for notification in notifications:

            notification_id = notification[0]
            task_id = notification[1]
            notification_type = notification[2]
            message = notification[3]
            recipient_email = notification[4]

            subject = get_email_subject(notification_type)

            try:

                send_email(
                    recipient_email,
                    subject,
                    message
                )

                cursor.execute(
                    """
                    UPDATE notifications
                    SET sent_at = CURRENT_TIMESTAMP
                    WHERE notification_id = %s
                    AND sent_at IS NULL
                    """,
                    (notification_id,)
                )

                conn.commit()

                print(
                    f"[Scheduler] Email sent successfully: "
                    f"Notification={notification_id}, "
                    f"Task={task_id}, "
                    f"Type={notification_type}, "
                    f"To={recipient_email}"
                )

            except Exception as email_error:

                conn.rollback()

                print(
                    f"[Scheduler] Failed to send notification "
                    f"{notification_id}: {email_error}"
                )

    except Exception as e:

        if conn:
            conn.rollback()

        print(f"[Scheduler] Error: {e}")

    finally:

        if cursor:
            cursor.close()

        if conn:
            conn.close()


scheduler.add_job(
    check_notifications,
    "interval",
    minutes=1
)