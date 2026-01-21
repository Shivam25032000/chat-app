
@echo off
echo Starting Chat Application...




echo Starting Infrastructure (Docker)...
docker-compose up -d
echo Waiting for Infrastructure to be ready...
timeout /t 20

echo Starting Discovery Server...
start "Discovery Server" cmd /k "cd discovery-server && mvn spring-boot:run"

echo Waiting for Discovery Server to warm up...
timeout /t 15

echo Starting API Gateway...
start "API Gateway" cmd /k "cd api-gateway && mvn spring-boot:run"

echo Starting Auth Service...
start "Auth Service" cmd /k "cd auth-service && mvn spring-boot:run"


echo Starting Chat Service...
start "Chat Service" cmd /k "cd chat-service && mvn spring-boot:run"

echo Starting AI Service...
start "AI Service" cmd /k "cd ai-service && mvn spring-boot:run"


echo Starting Frontend...
start "Chat Frontend" cmd /k "cd chat-frontend && ng serve"

echo All services launched in separate windows!
echo Access Frontend at http://localhost:4200
echo Access Eureka at http://localhost:8761
pause
