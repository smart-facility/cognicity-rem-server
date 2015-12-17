CREATE TABLE public.rem_status
(
  rw bigint NOT NULL,
  state integer,
  CONSTRAINT rw_pkey PRIMARY KEY (rw),
  CONSTRAINT rem_status_rw_fkey FOREIGN KEY (rw)
      REFERENCES public.jkt_rw_boundary (pkey) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);

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
  CONSTRAINT id_pkey PRIMARY KEY (id)
);