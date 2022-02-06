--
-- PostgreSQL database dump
--

-- Dumped from database version 14.1
-- Dumped by pg_dump version 14.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: attendance_constraint(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.attendance_constraint() RETURNS trigger
    LANGUAGE plpgsql
    AS $$BEGIN
   -- the deleted row is already gone in an AFTER trigger
   IF (SELECT capacity FROM venue
       WHERE venue_id = NEW.venue_id
      ) < NEW.attendance
   THEN
      RAISE EXCEPTION 'Capacity constraint violated';
   END IF;
 
   RETURN NEW;
END;$$;


ALTER FUNCTION public.attendance_constraint() OWNER TO postgres;

--
-- Name: attendance_constraint(integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.attendance_constraint(attendance integer, vid integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN attendance < (SELECT capacity FROM venue
        WHERE venue_id = vid
        );
END;
$$;


ALTER FUNCTION public.attendance_constraint(attendance integer, vid integer) OWNER TO postgres;

--
-- Name: attendance_constraint_match(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.attendance_constraint_match() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (SELECT capacity FROM venue WHERE venue_id = NEW.venue_id) < NEW.attendance
    THEN
        RAISE EXCEPTION 'Capacity constraint violated (match)';
    END IF;
    
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.attendance_constraint_match() OWNER TO postgres;

--
-- Name: attendance_constraint_venue(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.attendance_constraint_venue() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF EXISTS (SELECT * FROM match WHERE venue_id = NEW.venue_id AND attendance > NEW.capacity)
    THEN
        RAISE EXCEPTION 'Capacity constraint violated (venue)';
    END IF;
    
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.attendance_constraint_venue() OWNER TO postgres;

--
-- Name: stake_constraint(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.stake_constraint() RETURNS trigger
    LANGUAGE plpgsql
    AS $$BEGIN
   IF NOT ((SELECT SUM(stake) FROM owner
       WHERE team_id = NEW.team_id
      ) BETWEEN 1 AND 100)
   THEN
      RAISE EXCEPTION 'Stake constraint violated';
   END IF;
 
   RETURN NEW;
END;$$;


ALTER FUNCTION public.stake_constraint() OWNER TO postgres;

--
-- Name: stake_constraint_owner(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.stake_constraint_owner() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'UPDATE' OR TG_OP = 'INSERT'
    THEN
        IF NOT ((SELECT COALESCE(SUM(stake),0) FROM owner WHERE team_id = NEW.team_id) BETWEEN 1 AND 100)
        THEN
            RAISE EXCEPTION 'Stake constraint violated (owner)';
        END IF;
    END IF;

    IF TG_OP = 'UPDATE' OR TG_OP = 'DELETE'
    THEN
        IF (OLD.team_id IN (SELECT team_id from team)) AND NOT ((SELECT COALESCE(SUM(stake),0) FROM owner WHERE team_id = OLD.team_id) BETWEEN 1 AND 100)
        THEN
            RAISE EXCEPTION 'Stake constraint violated (owner)';
        END IF;
    END IF;
 
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.stake_constraint_owner() OWNER TO postgres;

--
-- Name: stake_constraint_team(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.stake_constraint_team() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NOT ((SELECT COALESCE(SUM(stake),0) FROM owner WHERE team_id = NEW.team_id) BETWEEN 1 AND 100)
    THEN
        RAISE EXCEPTION 'Stake constraint violated (team)';
    END IF;
    
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.stake_constraint_team() OWNER TO postgres;

--
-- Name: umpire_constraint(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.umpire_constraint() RETURNS trigger
    LANGUAGE plpgsql
    AS $$BEGIN
   IF NOT ((SELECT COUNT(*) FROM umpire_match
       WHERE match_id = NEW.match_id AND role_desc = 'Third'
      ) <= 1 AND (SELECT COUNT(*) FROM umpire_match
       WHERE match_id = NEW.match_id AND role_desc = 'Field'
      ) <= 2)
   THEN
      RAISE EXCEPTION 'Umpire constraint violated';
   END IF;
 
   RETURN NEW;
END;$$;


ALTER FUNCTION public.umpire_constraint() OWNER TO postgres;

--
-- Name: umpire_constraint_match(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.umpire_constraint_match() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NOT ((SELECT COALESCE(COUNT(*),0) FROM umpire_match WHERE match_id = NEW.match_id AND role_desc = 'Third') <= 1 
            AND 
            (SELECT COALESCE(COUNT(*),0) FROM umpire_match WHERE match_id = NEW.match_id AND role_desc = 'Field') <= 2)
    THEN
        RAISE EXCEPTION 'Umpire constraint violated (match)';
    END IF;
 
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.umpire_constraint_match() OWNER TO postgres;

--
-- Name: umpire_constraint_umatch(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.umpire_constraint_umatch() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NOT ((SELECT COALESCE(COUNT(*),0) FROM umpire_match WHERE match_id = NEW.match_id AND role_desc = 'Third') <= 1 
            AND 
            (SELECT COALESCE(COUNT(*),0) FROM umpire_match WHERE match_id = NEW.match_id AND role_desc = 'Field') <= 2)
    THEN
        RAISE EXCEPTION 'Umpire constraint violated (umpire_match)';
    END IF;
 
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.umpire_constraint_umatch() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: ball_by_ball; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ball_by_ball (
    match_id integer NOT NULL,
    innings_no integer NOT NULL,
    over_id integer NOT NULL,
    ball_id integer NOT NULL,
    runs_scored integer,
    extra_runs integer,
    out_type text,
    striker integer,
    non_striker integer,
    bowler integer,
    CONSTRAINT ball_by_ball_innings_no_check CHECK ((innings_no = ANY (ARRAY[1, 2]))),
    CONSTRAINT ball_by_ball_out_type_check CHECK (((out_type = ANY (ARRAY['caught'::text, 'caught and bowled'::text, 'bowled'::text, 'stumped'::text, 'retired hurt'::text, 'keeper catch'::text, 'lbw'::text, 'run out'::text, 'hit wicket'::text])) OR (out_type IS NULL))),
    CONSTRAINT ball_by_ball_runs_scored_check CHECK (((runs_scored >= 0) AND (runs_scored <= 6)))
);


ALTER TABLE public.ball_by_ball OWNER TO postgres;

--
-- Name: match; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.match (
    match_id integer NOT NULL,
    season_year integer,
    team1 integer,
    team2 integer,
    venue_id integer,
    toss_winner integer,
    match_winner integer,
    toss_name text,
    win_type text,
    man_of_match integer,
    win_margin integer,
    attendance integer,
    CONSTRAINT match_toss_name_check CHECK ((toss_name = ANY (ARRAY['field'::text, 'bat'::text]))),
    CONSTRAINT match_win_type_check CHECK (((win_type = ANY (ARRAY['wickets'::text, 'runs'::text])) OR (win_type IS NULL)))
);


ALTER TABLE public.match OWNER TO postgres;

--
-- Name: owner; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.owner (
    owner_id integer NOT NULL,
    owner_name text,
    owner_type text,
    team_id integer,
    stake integer,
    CONSTRAINT owner_stake_check CHECK (((stake >= 1) AND (stake <= 100)))
);


ALTER TABLE public.owner OWNER TO postgres;

--
-- Name: player; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player (
    player_id integer NOT NULL,
    player_name text,
    dob date,
    batting_hand text,
    bowling_skill text,
    country_name text
);


ALTER TABLE public.player OWNER TO postgres;

--
-- Name: player_match; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player_match (
    playermatch_key bigint NOT NULL,
    match_id integer,
    player_id integer,
    role_desc text,
    team_id integer,
    CONSTRAINT player_match_role_desc_check CHECK ((role_desc = ANY (ARRAY['Player'::text, 'Keeper'::text, 'CaptainKeeper'::text, 'Captain'::text])))
);


ALTER TABLE public.player_match OWNER TO postgres;

--
-- Name: team; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team (
    team_id integer NOT NULL,
    team_name text
);


ALTER TABLE public.team OWNER TO postgres;

--
-- Name: umpire; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.umpire (
    umpire_id integer NOT NULL,
    umpire_name text,
    country_name text
);


ALTER TABLE public.umpire OWNER TO postgres;

--
-- Name: umpire_match; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.umpire_match (
    umpirematch_key bigint NOT NULL,
    match_id integer,
    umpire_id integer,
    role_desc text,
    CONSTRAINT umpire_match_role_desc_check CHECK ((role_desc = ANY (ARRAY['Field'::text, 'Third'::text])))
);


ALTER TABLE public.umpire_match OWNER TO postgres;

--
-- Name: venue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.venue_id_seq
    START WITH 100
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.venue_id_seq OWNER TO postgres;

--
-- Name: venue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.venue (
    venue_id integer DEFAULT nextval('public.venue_id_seq'::regclass) NOT NULL,
    venue_name text,
    city_name text,
    country_name text,
    capacity integer
);


ALTER TABLE public.venue OWNER TO postgres;

--
-- Name: ball_by_ball ball_by_ball_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ball_by_ball
    ADD CONSTRAINT ball_by_ball_pkey PRIMARY KEY (match_id, innings_no, over_id, ball_id);


--
-- Name: match match_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_pkey PRIMARY KEY (match_id);


--
-- Name: owner owner_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.owner
    ADD CONSTRAINT owner_pkey PRIMARY KEY (owner_id);


--
-- Name: player_match player_match_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_match
    ADD CONSTRAINT player_match_pkey PRIMARY KEY (playermatch_key);


--
-- Name: player player_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player
    ADD CONSTRAINT player_pkey PRIMARY KEY (player_id);


--
-- Name: team team_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team
    ADD CONSTRAINT team_pkey PRIMARY KEY (team_id);


--
-- Name: umpire_match umpire_match_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.umpire_match
    ADD CONSTRAINT umpire_match_pkey PRIMARY KEY (umpirematch_key);


--
-- Name: umpire umpire_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.umpire
    ADD CONSTRAINT umpire_pkey PRIMARY KEY (umpire_id);


--
-- Name: venue venue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.venue
    ADD CONSTRAINT venue_pkey PRIMARY KEY (venue_id);


--
-- Name: match attendance_constraint_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE CONSTRAINT TRIGGER attendance_constraint_trig AFTER INSERT OR UPDATE ON public.match NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.attendance_constraint_match();


--
-- Name: venue attendance_constraint_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE CONSTRAINT TRIGGER attendance_constraint_trig AFTER INSERT OR UPDATE ON public.venue NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.attendance_constraint_venue();


--
-- Name: owner stake_constraint_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE CONSTRAINT TRIGGER stake_constraint_trig AFTER INSERT OR DELETE OR UPDATE ON public.owner DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.stake_constraint_owner();


--
-- Name: team stake_constraint_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE CONSTRAINT TRIGGER stake_constraint_trig AFTER INSERT OR UPDATE ON public.team DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION public.stake_constraint_team();


--
-- Name: match umpire_constraint_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE CONSTRAINT TRIGGER umpire_constraint_trig AFTER INSERT OR UPDATE ON public.match NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.umpire_constraint_match();


--
-- Name: umpire_match umpire_constraint_trig; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE CONSTRAINT TRIGGER umpire_constraint_trig AFTER INSERT OR UPDATE ON public.umpire_match NOT DEFERRABLE INITIALLY IMMEDIATE FOR EACH ROW EXECUTE FUNCTION public.umpire_constraint_umatch();


--
-- Name: ball_by_ball ball_by_ball_bowler_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ball_by_ball
    ADD CONSTRAINT ball_by_ball_bowler_fkey FOREIGN KEY (bowler) REFERENCES public.player(player_id) ON DELETE CASCADE;


--
-- Name: ball_by_ball ball_by_ball_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ball_by_ball
    ADD CONSTRAINT ball_by_ball_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.match(match_id) ON DELETE CASCADE;


--
-- Name: ball_by_ball ball_by_ball_non_striker_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ball_by_ball
    ADD CONSTRAINT ball_by_ball_non_striker_fkey FOREIGN KEY (non_striker) REFERENCES public.player(player_id) ON DELETE CASCADE;


--
-- Name: ball_by_ball ball_by_ball_striker_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ball_by_ball
    ADD CONSTRAINT ball_by_ball_striker_fkey FOREIGN KEY (striker) REFERENCES public.player(player_id) ON DELETE CASCADE;


--
-- Name: match match_man_of_match_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_man_of_match_fkey FOREIGN KEY (man_of_match) REFERENCES public.player(player_id) ON DELETE CASCADE;


--
-- Name: match match_match_winner_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_match_winner_fkey FOREIGN KEY (match_winner) REFERENCES public.team(team_id) ON DELETE CASCADE;


--
-- Name: match match_team1_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_team1_fkey FOREIGN KEY (team1) REFERENCES public.team(team_id) ON DELETE CASCADE;


--
-- Name: match match_team2_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_team2_fkey FOREIGN KEY (team2) REFERENCES public.team(team_id) ON DELETE CASCADE;


--
-- Name: match match_toss_winner_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_toss_winner_fkey FOREIGN KEY (toss_winner) REFERENCES public.team(team_id) ON DELETE CASCADE;


--
-- Name: match match_venue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_venue_id_fkey FOREIGN KEY (venue_id) REFERENCES public.venue(venue_id) ON DELETE CASCADE;


--
-- Name: owner owner_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.owner
    ADD CONSTRAINT owner_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.team(team_id) ON DELETE CASCADE;


--
-- Name: player_match player_match_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_match
    ADD CONSTRAINT player_match_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.match(match_id) ON DELETE CASCADE;


--
-- Name: player_match player_match_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_match
    ADD CONSTRAINT player_match_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.player(player_id) ON DELETE CASCADE;


--
-- Name: player_match player_match_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player_match
    ADD CONSTRAINT player_match_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.team(team_id) ON DELETE CASCADE;


--
-- Name: umpire_match umpire_match_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.umpire_match
    ADD CONSTRAINT umpire_match_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.match(match_id) ON DELETE CASCADE;


--
-- Name: umpire_match umpire_match_umpire_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.umpire_match
    ADD CONSTRAINT umpire_match_umpire_id_fkey FOREIGN KEY (umpire_id) REFERENCES public.umpire(umpire_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

