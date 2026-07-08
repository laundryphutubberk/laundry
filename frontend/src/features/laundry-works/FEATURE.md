# Laundry Works Feature

Status: FE-01 Skeleton
Owner: Frontend Architecture
Reference: Scanner Architecture

## Purpose

Own Laundry Work runtime, work list, work detail, timeline, current action panel, and work status transitions.

## Source of Truth

- Business Blueprint
- Prisma LaundryWork model
- Backend Laundry Work API contract

## Runtime

Laundry Work is the operational center of the frontend.

## State Ownership

Feature-local UI state belongs in `stores/`. Server state must follow API/cache strategy when introduced.

## Forbidden

Do not place Laundry Work workflow rules inside visual components.
