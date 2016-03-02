-- REM status table
CREATE TABLE public.rem_status
(
  rw bigint NOT NULL,
  state integer,
  last_updated timestamp with time zone DEFAULT now(),
  CONSTRAINT rw_pkey PRIMARY KEY (rw),
  CONSTRAINT rem_status_rw_fkey FOREIGN KEY (rw)
      REFERENCES public.jkt_rw_boundary (pkey) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);

COMMENT ON TABLE rem_status IS 'Flooded state of each RW region';
COMMENT ON COLUMN rem_status.rw IS '{bigint} [Primary Key] RW region ID';
COMMENT ON COLUMN rem_status.state IS '{integer} Integer state of flooding; 0=none, 1-4 are BPBD levels';
COMMENT ON COLUMN rem_status.last_updated IS '{timestamp with time zone} Time this entry was updated';

-- REM change logs
CREATE SEQUENCE public.rem_status_log_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
  
CREATE TABLE public.rem_status_log
(
  rw bigint,
  state integer,
  changed timestamp with time zone DEFAULT now(),
  id bigint NOT NULL DEFAULT nextval('rem_status_log_id_seq'::regclass),
  username character varying,
  CONSTRAINT rem_status_log_id_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE rem_status_log IS 'Log of flooded state changes';
COMMENT ON COLUMN rem_status_log.rw IS '{bigint} RW region ID';
COMMENT ON COLUMN rem_status_log.state IS '{integer} Integer state of flooding; 0=none, 1-4 are BPBD levels';
COMMENT ON COLUMN rem_status_log.changed IS '{timestamp with time zone} Time this entry was changed';
COMMENT ON COLUMN rem_status_log.id IS '{bigint} [Primary Key] Unique ID for row';
COMMENT ON COLUMN rem_status_log.username IS '{character varying} Username who changed the entry';


-- Users table
CREATE SEQUENCE public.users_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;
  
CREATE TABLE public.users
(
  id bigint NOT NULL DEFAULT nextval('users_id_seq'::regclass),
  username character varying,
  password character varying,
  editor boolean,
  admin boolean,
  CONSTRAINT users_id_pkey PRIMARY KEY (id)
);

COMMENT ON TABLE users IS 'Authorised users';
COMMENT ON COLUMN users.id IS '{bigint} [Primary Key] Unique ID for row';
COMMENT ON COLUMN users.username IS '{character varying} Username of user account';
COMMENT ON COLUMN users.password IS '{character varying} Password PBKDF2 delimited string';
COMMENT ON COLUMN users.editor IS '{boolean} If true this user can change flooded states';
COMMENT ON COLUMN users.admin IS '{boolean} If true this user can manage user accounts';

CREATE INDEX users_username_index
  ON public.users
  USING btree
  (username COLLATE pg_catalog."default");
  
COMMENT ON INDEX users_username_index IS 'Index for looking up users by username';

-- Bootstrap default user
INSERT INTO users
	(username, password, editor, admin)
	VALUES ('demo', 'xUJZbu+Sj2WD::j/Dem/dpIh/lqgtFROAVfS78n48uD4EbRjEKMm2V::30::10000', true, false);
INSERT INTO users
	(username, password, editor, admin)
	VALUES ('admin', '+J2mLl2CNgHa::hTRjkI7zga4lPOFYpJIJRYNE0MC9yxz2GeSvfS5d::30::10000', true, true);
INSERT INTO users
	(username, password, editor, admin)
	VALUES ('user', 'Rtq6gGWZbleh::oWLcmqNewMBjifOJKdqT39AMxNZSZ+P78BjKalwo::30::10000', false, false);