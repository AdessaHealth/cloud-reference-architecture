# Adessa Health - Architecture Overview

**Version:** 1.0.0
**Last Updated:** 2026-01-11

## 1. Introduction

Adessa Health is a modern healthcare platform designed to streamline and automate critical financial and administrative workflows. By integrating directly with Electronic Health Record (EHR) systems via the FHIR standard, our application provides powerful tools for **Financial Patient Assistance Reporting (FPAR)** and **Revenue Cycle Management (RCM)**.

This document provides a high-level overview of the system architecture, technology stack, and key data flows.

## 2. High-Level Architecture

The system is built on a modern, cloud-native architecture that separates concerns between the frontend client, the backend API, and external services. This design ensures scalability, maintainability, and security.

```mermaid
graph TD
    subgraph "User's Browser"
        A[React Frontend]
    end

    subgraph "Google Cloud Platform (GCP)"
        B[Cloud Load Balancer]
        C["Backend API (NestJS on Cloud Run)"]
        D[Cloud SQL (PostgreSQL)]
        E[Secret Manager]
    end

    subgraph "External Services"
        F[Epic FHIR API]
        G[Other EHR/FHIR APIs]
        H[Slack Webhook]
    end

    A --> B
    B --> C
    C -- CRUD Operations --> D
    C -- Reads Secrets --> E
    C -- OAuth 2.0 & FHIR API Calls --> F
    C -- (Future) --> G
    C -- Sends Notifications --> H
```

### Components

*   **Frontend:** A single-page application (SPA) built with React, responsible for all user interactions and presentation logic.
*   **Backend API:** A Node.js application built with the NestJS framework. It serves as the core business logic engine, handling API requests, data processing, and integration with all external services. It is deployed as a containerized service on **Google Cloud Run**.
*   **Database:** A managed **Cloud SQL for PostgreSQL** instance used for persistent storage of application data, user information, and cached/processed EHR data.
*   **Secret Manager:** All sensitive credentials, such as API keys and database passwords, are securely stored in **Google Cloud Secret Manager**.
*   **External EHR APIs:** The system is designed for interoperability, with the primary integration being the **Epic FHIR R4 API**.

## 3. Technology Stack

*   **Backend:** Node.js, TypeScript, NestJS, TypeORM
*   **Frontend:** React, TypeScript, Redux
*   **Database:** PostgreSQL
*   **Infrastructure:** Google Cloud Platform (GCP)
    *   **Compute:** Cloud Run
    *   **Database:** Cloud SQL
    *   **Secrets:** Secret Manager
    *   **Container Registry:** Artifact Registry
*   **Infrastructure as Code (IaC):** Terraform
*   **CI/CD:** Google Cloud Build

## 4. Key Features & Data Flows

### 4.1. EHR Interoperability (Epic FHIR Integration)

Secure access to patient data is achieved via the industry-standard **OAuth 2.0 Authorization Code Flow**.

1.  **Initiation:** A user in our application triggers an action that requires EHR data (e.g., generating an FPAR report).
2.  **Redirect:** The backend redirects the user to the Epic authorization endpoint (`/integrations/epic/auth`).
3.  **User Consent:** The user logs into their Epic portal and grants our application permission to access specific data scopes (e.g., `patient/*.read`).
4.  **Callback:** Epic redirects the user back to our application's callback URL (`/integrations/epic/auth/callback`) with a temporary authorization `code`.
5.  **Token Exchange:** Our backend securely exchanges this `code` (along with its client credentials) for an **access token**.
6.  **API Calls:** The backend can now use this access token to make secure API calls to the Epic FHIR endpoints (e.g., `/Patient`, `/Coverage`, `/ExplanationOfBenefit`) to retrieve the necessary data.

> **For a detailed technical specification of our integration endpoints, please see the openapi.yaml file.**

### 4.2. Financial Patient Assistance Reporting (FPAR)

This feature automates the generation of reports for patient assistance programs.

*   **Data Aggregation:** The system uses the FHIR access token to fetch patient demographic, insurance coverage (`Coverage`), and billing (`ExplanationOfBenefit`) resources from the EHR.
*   **Logic Engine:** The backend processes this data, applying business rules to determine eligibility and calculate assistance amounts based on predefined program criteria.
*   **Report Generation:** A formatted report (e.g., PDF or CSV) is generated and stored, and the user is notified.

### 4.3. Revenue Cycle Management (RCM)

This feature helps optimize the billing and collections process.

*   **Claim Status Monitoring:** The backend can be configured to periodically query the `ExplanationOfBenefit` FHIR resource for a list of patients to track the status of insurance claims.
*   **Denial Analysis:** When a claim is denied, the system retrieves the details and uses pattern matching or rule-based logic to categorize the reason for denial.
*   **Automated Alerting:** Based on the denial reason, automated alerts can be sent to the appropriate work queue or personnel via a Slack notification for timely follow-up.

## 5. Infrastructure and Deployment

The entire cloud infrastructure is defined declaratively using **Terraform**. This enables consistent, repeatable, and version-controlled environment provisioning.

The CI/CD pipeline is managed by **Google Cloud Build**. On every push to the `main` branch of our private repository:

1.  Tests are executed.
2.  The application is bundled into a Docker container.
3.  The container image is pushed to **Artifact Registry**.
4.  A new revision of the **Cloud Run** service is deployed automatically with the new image.

This setup provides a fully automated, secure, and scalable deployment process.