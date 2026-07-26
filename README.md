# 🗨️ Real-Time Distributed Chat Application

A high-concurrency, event-driven chat platform built with **Microservices**, **Spring Boot**, **Apache Kafka**, **Angular**, and **Google Gemini AI**.

![Status](https://img.shields.io/badge/Status-Completed-success)
![Java](https://img.shields.io/badge/Java-17-orange)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue)
![Kafka](https://img.shields.io/badge/Kafka-Event%20Driven-black)
![AI](https://img.shields.io/badge/AI-Gemini%202.5-purple)

## 🚀 Overview

This project implements a scalable messaging system where the frontend (Angular) and backend (Spring Boot) are fully decoupled. It uses **WebSockets (STOMP)** for real-time delivery and **Apache Kafka** as a distributed message broker to handle high throughput and ensure message durability.

It features a custom **AI Service** that acts as a "Ghost User" (`AI_BOT`) in the chat, listening to messages and replying using Google's generative models.

### ✨ Key Features
*   **Real-Time Messaging**: Instant delivery using WebSocket & SockJS.
*   **Event-Driven Architecture**: Uses Kafka to buffer and route messages asynchronously.
*   **AI Chatbot**:
    *   **Intelligent Replies**: Powered by **Google Gemini 2.5 Flash**.
    *   **Resilient Fallback**: gracefully handles offline states or quota limits.
*   **Microservices**:
    *   **Auth Service**: JWT-based identity management (Access/Refresh Tokens).
    *   **Chat Service**: Core messaging logic and persistence.
    *   **AI Service**: Smart chatbot integration (`AI_BOT`).
    *   **API Gateway**: Centralized routing and load balancing.
    *   **Discovery Server**: Eureka-based service registry.
*   **Security**:
    *   **Strict Session Isolation**: New tabs require fresh login (`sessionStorage`).
    *   **Auto-Logout**: Automatically terminates session after 5 minutes of inactivity.
    *   **Route Guards**: Angular AuthGuard protects private routes.
*   **Modern UI**: Built with Angular Material, featuring toast notifications, auto-scroll, and responsive layout.

---

## 🏗️ Architecture

### 1. System Component Overview

```mermaid
graph TD
    Client[Angular Frontend] -->|HTTPS / WSS| Gateway[API Gateway :8080]
    
    subgraph "Microservices"
        Gateway -->|/api/auth| Auth[Auth Service]
        Gateway -->|/ws| Chat[Chat Service :8082]
        AIService[AI Service]
    end

    subgraph "Service Discovery"
        Eureka[Discovery Server :8761 / Eureka]
        Gateway -.-> Eureka
        Auth -.-> Eureka
        Chat -.-> Eureka
        AIService -.-> Eureka
    end

    subgraph "Infrastructure & Persistence"
        DB[(PostgreSQL :5432)]
        Kafka[Apache Kafka Broker]
        Auth --> DB
        Chat --> DB
        Chat <-->|"Publish / Consume"| Kafka
        Kafka <-->|"Publish / Consume"| AIService
    end

    subgraph "External Services"
        Gemini[Google Gemini 2.5 API]
        AIService -->|"REST API"| Gemini
    end
```

---

### 2. End-to-End Request Flows

```mermaid
sequenceDiagram
    autonumber
    actor User as User (Angular)
    participant Gateway as API Gateway (:8080)
    participant Chat as Chat Service (:8082)
    participant Kafka as Apache Kafka
    participant AI as AI Service
    participant Gemini as Gemini 2.5 API

    rect rgb(240, 248, 255)
        Note over User, Chat: 👤 Human-to-Human Message Flow
        User->>Gateway: Send Message over WebSocket (STOMP)
        Gateway->>Chat: Forward STOMP Frame
        Chat->>Kafka: Publish Message Event
        Kafka->>Chat: Consume Event & Persist DB
        Chat->>User: Push Message to Recipient (WebSocket)
    end

    rect rgb(245, 240, 255)
        Note over User, Gemini: 🤖 Human-to-AI Message Flow (Recipient: AI_BOT)
        User->>Gateway: Send Message to AI_BOT (WebSocket)
        Gateway->>Chat: Forward STOMP Frame
        Chat->>Kafka: Publish Event (Topic: chat-topic)
        Kafka->>AI: Consume Event (Recipient == AI_BOT)
        AI->>Gemini: Call Gemini REST API with Prompt
        Gemini-->>AI: Return Generated Response
        AI->>Kafka: Publish AI Reply Event
        Kafka->>Chat: Consume AI Reply Event
        Chat->>User: Push AI Reply to User Screen (WebSocket)
    end
```

---

## 🛠️ Tech Stack

*   **Backend**: Java 17, Spring Boot 3, Spring Cloud (Gateway, Eureka)
*   **Frontend**: Angular 17, Angular Material, RxJS
*   **Messaging**: Apache Kafka, Zookeeper, STOMP, SockJS
*   **AI**: Google Gemini API (Model: `gemini-2.5-flash`)
*   **Database**: PostgreSQL
*   **Infrastructure**: Docker, Docker Compose

---

## ⚡ Getting Started

### Prerequisites
*   Docker Desktop (Running)
*   Java 17+
*   Node.js (LTS) & Angular CLI

### 1. Start Infrastructure
We provide a unified startup script for convenience:
```bash
./run-app.bat
```
*(This command launches Kafka, Eureka, Gateway, Auth, Chat, AI Service, and Frontend in separate terminals)*

**Alternative (Manual Start):**
```bash
# Infrastructure
docker-compose up -d

# Microservices (Run in separate terminals)
cd discovery-server && mvn spring-boot:run
cd api-gateway && mvn spring-boot:run
cd auth-service && mvn spring-boot:run
cd chat-service && mvn spring-boot:run
cd ai-service && mvn spring-boot:run

# Frontend
cd chat-frontend
npm install
ng serve
```

### 2. Access Application
Open your browser at **http://localhost:4200**.

---

## 📖 Usage Guide

1.  **Register**: Create a new account (e.g., `user1`).
2.  **Login**: Access the dashboard.
3.  **Chat**:
    *   **Human-to-Human**: Open an Incognito window, login as `user2`, and message `user1`.
    *   **AI-to-Human**: Send a message to the recipient **`AI_BOT`**. The AI will reply instantly!

---

## 🔧 Troubleshooting

*   **AI Not Replying?**: Check the `ai-service` terminal logs. If you see a `429` error, you can verify your API Key in `ai-service/src/main/resources/application.yml`.
*   **Kafka Exit Code 1**: Ensure you are using the pinned version `7.4.0` in `docker-compose.yml`.
*   **CORS Errors**: Verify API Gateway is running on port `8080`.
*   **Login Issues**: Clear your browser's `sessionStorage` if stuck.

---

## 👤 Author

Developed as a demonstration of robust Microservices Architecture.
