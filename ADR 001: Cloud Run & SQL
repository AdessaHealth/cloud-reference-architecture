# ADR 001: Selection of Cloud Run and Cloud SQL (PostgreSQL)
**Date:** 2024-05-20  
**Status:** Accepted  

## Context
The platform requires a scalable, secure, and cost-effective compute and data storage layer. We need to support HIPAA compliance and rapid deployment cycles.

## Decision
We will use **Google Cloud Run** for compute and **Cloud SQL for PostgreSQL** for data storage.

## Rationale
1. **Managed Services**: Both are fully managed by GCP, reducing operational overhead (no patching OS, no manual backups).
2. **Scalability**: Cloud Run scales to zero (cost savings) and handles traffic spikes automatically.
3. **Security**: Integrated with GCP IAM, VPC Service Controls, and Secret Manager.
4. **Ecosystem**: Native integration with Cloud Logging and Cloud Monitoring (Observability).

## Consequences
- **Positive**: Faster time-to-market, lower DevOps burden, built-in compliance features.
- **Negative**: Vendor lock-in to GCP (mitigated by using standard Docker containers and standard PostgreSQL).