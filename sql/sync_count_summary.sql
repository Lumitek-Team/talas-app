CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into count_summary with a generated ULID
    INSERT INTO count_summary (id, id_user)
    VALUES (ulid_generate(), NEW.id); -- Generate a ULID for the `id` field
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
