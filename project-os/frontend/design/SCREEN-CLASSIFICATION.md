# SCREEN-CLASSIFICATION.md

Status: Active  
Owner: Frontend Architect

## Purpose

Classifies frontend screens before FE execution.

## Screen Types

| Type | Meaning |
|---|---|
| Aggregate Screen | Main screen around a business aggregate |
| Workflow Screen | Step/task-oriented operational screen |
| Read Model Screen | Dashboard/list/summary projection |
| Form Screen | Data entry or edit surface |
| Dialog / Sheet | Focused subtask surface |
| Admin / Master Data | Configuration/reference management |

## Laundry Screen Matrix

| Screen | Type | Primary Domain | Notes |
|---|---|---|---|
| Laundry Dashboard | Read Model Screen | LaundryWork | Work queues, issues, ready-to-return |
| Work List | Read Model Screen | LaundryWork | Search/filter works |
| Work Detail | Aggregate Screen | LaundryWork | Main operational surface |
| Receive Bag | Workflow Screen | LaundryBag | Add bag under work |
| Count Linen | Workflow Screen | LaundryCountLine | Count real items after opening bag |
| Report Issue | Workflow Screen / Dialog | IssueReport | Damaged/lost/mismatch |
| Inventory Summary | Read Model Screen | LinenInventorySummary | Resort linen visibility |
| Machine Planning | Workflow Screen | WashLoadPlan | Machine load planning |
| Resort Workspace | Read Model Screen | Resort | Resort-specific visibility |
| Master Data | Admin / Master Data | LaundryItemType / Machine | Reference setup |

## Rule

Do not create a page simply because an API exists. Create screens from user workflow and business value.
