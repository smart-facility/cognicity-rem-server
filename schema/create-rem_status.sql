CREATE TABLE public.rem_status
(
  village integer NOT NULL,
  flooded boolean,
  CONSTRAINT village_pkey PRIMARY KEY (village),
  CONSTRAINT rem_status_village_fkey FOREIGN KEY (village)
      REFERENCES public.jkt_village_boundary (pkey) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)