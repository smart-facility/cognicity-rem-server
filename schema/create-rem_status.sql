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

CREATE INDEX users_username_index
  ON public.users
  USING btree
  (username COLLATE pg_catalog."default");

-- Bootstrap default user
INSERT INTO users
	(username, password, editor, admin)
	VALUES ('admin', 'xUJZbu+Sj2WD::j/Dem/dpIh/lqgtFROAVfS78n48uD4EbRjEKMm2V::30::10000', true, true);