## Subscription Reminder Microservice Overview
The Subscription Reminder Microservice is a REST API designed in Node.js for tracking and sending subscription bill reminders, and uses the following packages: Express, SQLite 3, DotENV, Nodemailer. It  was made in and for Windows 10, and is intended to be run before the main program is started, but can feasibly be ran at any time and still function well. As of current, the microservice is ran on a local environment through: "http://localhost:5000"

## Database

Reminder data recieved and parsed by the microservice is stored locally on a SQLite 3 Database.

The schema for the 'reminders' database table is built like such:
```
Table 'reminders':
    id         = integer,     primary key for each reminder.
    email      = varchar(255), email address for reminder recipient.
    name       = varchar(255), name of reminder recipient.
    service    = varchar(255), subscription service name.
    billDate   = integer,     subscription service billing date. (IN MILLISECONDS)
    billPeriod = integer,     number of days between billing dates.
    remindDate = integer,     date of next reminder. (IN MILLISECONDS)
```
### ***NOTE: remindDate is calculated on the end of the microservice. On the requesting end, this will be replaced with remindPeriod, which is an integer representing the number of days out from the billing period that a reminder should be sent.***


## Emailing System
Emails are sent out through Nodemailer requests using a specified service and an associated account name and password.
As of current, the email's form is very basic for testing purposes. The service checks every 24 hours for the current day at midnight UTC. 
If a new day has been identified, it gets the current date (in milliseconds) and gathers all 'reminders' entries with an equal remindDate value.

## .env File Setup

The email service, email sender account, microservice port, and email template can all be configured from the .env file.
Documentation for nodemailer can be found at https://nodemailer.com, it is recommended to give it a read to understand how configuration will work, especially using a service like Gmail.

## Python Setup
HTTP requests in Python can be made using the 'requests' library, obtained through running 'pip install requests'. It is also reccommended to install 'calendar' via the same manner.
The example code that will be show for how to interact with the microservice over Python will be shown with the following libraries:
```
import requests, calendar, datetime
```
Here is a request template in Python:
```
URL = 'http://localhost:5000'                           # API URL
TYPE = '/[create|update|delete]Reminder'                # Route extention for specific function

#Replace year, month, day with a set date.
dt = datetime.date('year', 'month', 'day')              # get datetime date of a specific day
newDate = int(calendar.timegm(dt.timetuple())) * 1000   # date converted to milliseconds

DATA = {
    'email': 'REPLACE_WITH_EMAIL_ADDRESS',              # (string) email address for reminder recipient                used in [create, update, delete]
    'name': 'REPLACE_WITH_NAME',                        # (string) name of reminder recipient                          used in [create, update]
    'service': 'REPLACE_WITH_SERVICE_NAME',             # (string) subscription service name                           used in [create, update, delete]
    'billDate': (newDate),                              # (integer) next bill date, UTC, in milliseconds               used in [create, update]
    'billPeriod': 30,                                   # (integer) number of days between bill dates                  used in [create, update]
    'remindPeriod': 1                                   # (integer) number of days before bill date to send reminder   used in [create, update]
}

req = requests.[post|put|delete](URL + TYPE, json=DATA)   # Request call, captures response
print(req.status_code)                                    # Display recieved response
```
## /createReminder
The createReminder route takes a POST request with an associated JSON data packet containing:
email, name, service, billDate, billPeriod, and reminderPeriod.
From this data, it will create a reminder in the reminders database and calculate the date to send the next reminder.

**NOTE: Reminders should only be created with the intent to be sent at least a day out as of current.**

It returns a status code indicating success (200) or failiure (400).

## /updateReminder
The updateReminder route takes a PUT request with an associated JSON data packet containing:
email, name, service, billDate, billPeriod, and remindPeriod.
It will then update the billDate, billPeriod and remindDate of the entry containing email, name, service.
It returns a status code indicating success (200) or failiure (400).

## /deleteReminder
The deleteReminder route takes a DELETE request with an associated JSON data packet containing:
email, service.
It will then delete the associated entry in the database containing email, service.
It returns a status code indicating success (200) or failiure (400).

## UML Diagram
![MicroserviceUML (1)](https://github.com/user-attachments/assets/689323d1-0521-4ed9-9f81-dbf31c477b9f)

