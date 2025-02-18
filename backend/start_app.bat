@echo off
REM Set multiple environment variables
set proj_jwtPrivateKey=mySecureKey
set db_host=localhost
set db_user=somar
set db_password=somar
set db_database=test1
set db_timeout=60000

REM Display the environment variables for verification
echo proj_jwtPrivateKey=%proj_jwtPrivateKey%
echo db_host=%db_host%
echo db_user=%db_user%
echo db_database=%db_database%

node app.js
