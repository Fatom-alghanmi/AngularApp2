## Features Tested

- [x] Add reservation with image upload.
- [x] Duplicate reservation prevention (based on name, date, time, guests).
- [x] Duplicate image name prevention (excluding placeholder image).
- [x] Full name validation (first and last name required).
- [x] Success and error messages shown clearly in UI.
- [x] Update reservation with image replacement and old image deletion.
- [x] Booked status toggle from reservation list updates database correctly.
- [x] Placeholder image used when no image uploaded.
- [x] Cancel button returns to reservation list without adding/updating.

## Areas Needing More Testing

- [ ] Backend file permission errors during image upload.
- [ ] Handling very large image files.
- [ ] Concurrent reservation updates.
- [ ] Form handling under slow network conditions.
- [ ] SQL injection and backend security checks.
- [ ] UI/UX on mobile devices.
- [ ] Detailed performance testing under load.
