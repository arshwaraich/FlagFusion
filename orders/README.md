# Flag Orders

This space holds code and content to support ordering a flag print from the flag fusion website.

Stripe - Payments  
Resend - Emails   
Supabase - PostgreSQL + Edge functions
Printful - Manual/API orders

The basic flow will involve a user creating a flag as they see fit, then clicking the shopping cart next to the download button.

This will call an API to send an image via email to me in Supabase + Resend with an identifier (order_id?).
Obviously, this API should be secure and rate limited.

Once stripe confirm's payment + shipping info, a Stripe webhook will call a Supabase edge function to:
- Shoot an email using Resend
  - To the customer, confiriming their order
  - To operations, with order details received from the hook (including order_id, to connect this data to the image).

Manual prints -> The edge function will also shoot me an email to remind me to place an order on Printful.

Automatic prints -> The edge function will call an API to fulfill the order.

## Misc

This folder also contains email templates for order confirmation, shipped and maybe delivery.

Shipping UI will also contain a contact email.