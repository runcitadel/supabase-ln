# Lightning node login for supabase

This is our backend tool to allow users to create an account on supabase using a lightning node instead of an email address.
It works by giving the user a fake email address pubkey@usernodes.runcitadel.space, and then manually adding the user to the database.

Any action which normally requires an email will be emulated by instead creating the link that would be sent via email and simply return it instead if the user has a valid signature.

