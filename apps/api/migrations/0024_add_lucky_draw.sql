-- Lucky draw settings stored in invitation
ALTER TABLE invitations ADD COLUMN lucky_draw_settings TEXT DEFAULT '{}';
