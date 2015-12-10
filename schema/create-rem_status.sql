CREATE TABLE public.rem_status
(
  village integer NOT NULL,
  state integer,
  CONSTRAINT village_pkey PRIMARY KEY (village),
  CONSTRAINT rem_status_village_fkey FOREIGN KEY (village)
      REFERENCES public.jkt_village_boundary (pkey) MATCH SIMPLE
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
  village integer,
  state integer,
  changed timestamp with time zone DEFAULT now(),
  id bigint NOT NULL DEFAULT nextval('rem_status_log_id_seq'::regclass),
  username character varying,
  CONSTRAINT id_pkey PRIMARY KEY (id)
);