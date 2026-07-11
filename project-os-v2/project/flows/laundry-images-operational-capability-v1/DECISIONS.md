# Laundry Images Operational Capability V1 Decisions

Status: APPROVED

- Cloudinary is the binary storage provider; credentials come from backend environment variables.
- Multer memory storage accepts one JPEG, PNG, or WebP file up to 10 MB.
- A failed DB persistence triggers Cloudinary compensating delete.
- Existing soft delete contract destroys Cloudinary storage before committing the DB soft delete.
- No schema, category, Issue relation, annotation, or approval workflow is added.
