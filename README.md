Reservation Manager Features

🚀 Features Planned for Implementation

 Search Reservations: Filter reservations by name (case-insensitive).

 Filter by Location: Dynamically filter reservations using a location dropdown populated from data.

 Filtered List Display: Show reservations based on active search and filter criteria.

 Delete Confirmation: Prompt user before deleting a reservation.

 Toggle Booked Status: Allow toggling reservation booked status with UI and backend sync.

 Auto-hide Notifications: Display success and error messages that auto-hide after a short duration.

 Auto Refresh on Navigation: Reload reservations when navigating back to the reservations page.

 Navigation Controls: Navigate easily to Add, Edit, About, and Logout pages.

✅ Features Implemented
✅ Search by Name: Real-time search input filtering reservations by name.

✅ Dynamic Location Filter: Location dropdown generated dynamically from loaded reservation data.

✅ Filtered Results Display: Reservation list updates based on search and location filters.

✅ Delete with Confirmation: Confirm deletion before removing reservation, updates list without page reload.

✅ Booked Status Toggle: Checkbox toggles booked status optimistically; reverts if backend update fails.

✅ Timed Success & Error Messages: Feedback messages appear and disappear automatically.

✅ Auto Refresh on Navigation: Subscribed to router events to refresh reservations when returning to the page.

✅ Page Navigation: Buttons linked to Add, Edit, About, and Logout pages.

🛠️ Actions Taken
Added searchTerm and filterLocation state variables for filtering logic.

Extracted unique locations dynamically from reservations for the filter dropdown.

Implemented applyFilters() method to filter reservations by search term and location.

Updated template with search input and location dropdown bound to filtering logic.

Switched reservation list rendering to use filtered data.

Improved delete logic to update UI immediately without a full reload.

Maintained existing UX flows and success/error handling.

Kept changes minimal and non-breaking, integrating seamlessly with existing code.

