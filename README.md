# Cloud-Native Healthcare Reference Architecture (IaC)
**Architect:** Ahsan Uddin  
**Status:** Scrubbed Reference Architecture (C2PA Authenticated)

## Overview
This repository demonstrates a production-grade, secure, and scalable infrastructure blueprint for healthcare applications on Google Cloud Platform (GCP). It focuses on interoperability (FHIR), high availability, and DevSecOps best practices.

## Key Architectural Pillars
- **Security & Compliance**: Zero-trust networking, Secret Management, and automated audit logging.
- **Interoperability**: Standardized FHIR R4 integration patterns using OAuth 2.0.
- **Scalability**: Containerized workloads on Cloud Run with managed PostgreSQL (Cloud SQL).
- **Observability**: Centralized logging sinks and monitoring dashboards.

## Repository Structure
```text
.
├── infrastructure/          # Terraform (IaC)
│   ├── modules/             # Reusable resource modules
│   │   ├── security/        # Secret Manager, KMS, IAM
│   │   ├── logging/         # Log Sinks, Monitoring
│   │   └── networking/      # VPC, Load Balancing
│   ├── main.tf              # Root configuration
│   ├── variables.tf         # Parameterized inputs
│   └── backend.tf           # Remote state configuration
├── docs/                    # Architecture & API Specs
│   ├── architecture.md      # System design overview
│   └── openapi.yaml         # FHIR-compliant API specification
└── .pre-commit-config.yaml  # Security & linting hooks
```

## Core Concepts Demonstrated
1. **Parameterization**: No hardcoded Project IDs or secrets. Everything is driven by variables.
2. **Modular Design**: Resources are grouped by function, not by arbitrary IDs.
3. **Security First**: Integrated TruffleHog and Checkov for static analysis.