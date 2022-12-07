@echo off

set OPENSSL_CONF=%~dp0..\conf\openssl.cnf

..\bin\openssl req -x509 -sha256 -newkey rsa:2048 -nodes -days 999999 -keyout rootCA.key -out rootCA.crt -subj "/CN=rafik.ru/"

..\bin\openssl req -newkey rsa:2048 -nodes -days 999999 -keyout server.key -out server.csr -subj "/CN=rafik.ru/"

..\bin\openssl x509 -req -sha256 -days 999999 -in server.csr -extfile v3.txt -CA rootCA.crt -CAkey rootCA.key -CAcreateserial -out server.crt

..\bin\openssl dhparam -out dhparam.pem 2048