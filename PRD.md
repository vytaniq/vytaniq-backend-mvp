
VYTANIQ – PRODUCT REQUIREMENTS DOCUMENT (PRD)
MVP VERSION

====================================
1. PRODUCT OVERVIEW
====================================

Product Name: Vytaniq
Tagline: Your Health, Understood

Vytaniq is a health technology product that helps people understand their wearable health data in clear, human language. Instead of overwhelming users with charts and raw numbers, Vytaniq compares recent data against a personal baseline and explains what has changed in simple terms.

The MVP focuses strictly on:
- Google Fit integration
- Heart Rate, SpO₂, and Sleep data
- Daily summaries and baseline comparisons

This document defines the exact MVP scope for designers and developers. No additional features should be added.

====================================
2. PROBLEM STATEMENT
====================================

Wearable devices generate large volumes of health data, but:

- Users see numbers without understanding what they mean
- Changes over time are hard to interpret
- Clinicians lack pre-visit context and trends
- Valuable health information is ignored due to complexity

The issue is not lack of data, but lack of human-readable interpretation.

====================================
3. SOLUTION
====================================

Vytaniq translates wearable data into clear daily health summaries by:

- Comparing recent data to a personal baseline
- Highlighting changes using non-medical language
- Avoiding charts and clinical terminology
- Showing only what matters today

Example language:
- “Your resting heart rate has been higher than usual for the past 3 days.”
- “Your sleep duration is within your normal range.”

====================================
4. TARGET USERS
====================================

Primary Users:
- Wearable users who want simple, understandable health feedback

Secondary Users (future):
- Clinicians reviewing patient trends (not included in MVP)

====================================
5. MVP SCOPE (STRICT)
====================================

Supported Device:
- Google Fit only

Metrics:
- Heart Rate
- SpO₂
- Sleep

Core Screens (Max 4):
1. Connect Data
2. Dashboard (Today)
3. Daily Summary
4. Baseline Comparison (implicit within summaries)

NOT included:
- Apple Watch (shown as “coming soon based on demand”)
- Medical diagnosis
- Alerts or notifications
- Payments
- Charts or graphs
- Emergency services
- Clinician accounts

====================================
6. USER FLOW
====================================

1. User lands on /product
2. User connects Google Fit account
3. User grants consent
4. Data is synced in background
5. Baseline is calculated
6. User sees today’s dashboard
7. User reads daily health summary

====================================
7. CORE FEATURES
====================================

7.1 Google Fit Integration
- OAuth-based authentication
- Pull historical and daily data
- Background sync

7.2 Baseline Calculation
- Rolling 14-day average per metric
- User-specific (no global thresholds)
- Recalculated on each sync

7.3 Daily Summary
- Plain-language explanation of changes
- Baseline vs recent comparison
- No medical claims

7.4 Dashboard
- Today’s overview
- Simple cards per metric
- Minimal UI surface

====================================
8. API ENDPOINTS
====================================

Auth:
POST /auth/google

Google Fit:
POST /integrations/google-fit/connect
POST /integrations/google-fit/sync

Baseline:
POST /baseline/recalculate

Dashboard:
GET /dashboard/today

Summary:
GET /summary/daily

User Data:
DELETE /user/data

====================================
9. NON-FUNCTIONAL REQUIREMENTS
====================================

- Secure handling of user data
- Clear consent explanation
- GDPR-aware data deletion
- Fast API responses
- Scalable architecture

====================================
10. TECHNOLOGY STACK
====================================

Backend:
- Python 3.9+
- FastAPI
- PostgreSQL
- SQLAlchemy
- Pydantic
- JWT Authentication

Infrastructure:
- Cloud-hosted (provider-agnostic)
- Environment-based configuration

====================================
11. SUCCESS METRICS (MVP)
====================================

- Users successfully connect Google Fit
- Users understand daily summaries without explanation
- Positive qualitative feedback from interviews
- Low confusion / support requests

====================================
12. NOTES FOR DESIGNERS & DEVELOPERS
====================================

Design Principles:
- Calm, clear, minimal
- No charts overload
- Human language first

Development Principles:
- Keep logic simple
- No overengineering
- Build for iteration

====================================
END OF DOCUMENT