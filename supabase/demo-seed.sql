-- ============================================================================
-- SportsWeb One — DEMO CONTENT SEED
-- Populates the three demo clubs with realistic content so prospects (and your
-- screenshots) see a full, themed site rather than empty pages.
--
--   Northside Lions FC   (northside-lions)   AFL      → view with &variant=leaguefooty
--   Eastside United SC   (eastside-united)   Soccer   → view with &variant=pitch
--   Riverside Cricket Club (riverside-cricket) Cricket → view with &variant=scorecard
--
-- HOW TO VIEW after running this + deploying:
--   https://<your-site>/?club=northside-lions&variant=leaguefooty
--   https://<your-site>/?club=eastside-united&variant=pitch
--   https://<your-site>/?club=riverside-cricket&variant=scorecard
--   (add ?club=reset to go back to your own club)
--
-- SAFE TO RE-RUN: it deletes existing rows for these three demo clubs first,
-- then re-inserts. It never touches dookie-united or any real club.
-- Run the whole file in the Supabase SQL Editor (new query).
-- ============================================================================

-- 1) Clear any prior demo content for the three demo clubs only ---------------
delete from news    where club_id in (select id from clubs where slug in ('northside-lions','eastside-united','riverside-cricket'));
delete from events  where club_id in (select id from clubs where slug in ('northside-lions','eastside-united','riverside-cricket'));
delete from sponsors where club_id in (select id from clubs where slug in ('northside-lions','eastside-united','riverside-cricket'));
delete from teams   where club_id in (select id from clubs where slug in ('northside-lions','eastside-united','riverside-cricket'));
delete from matches where club_id in (select id from clubs where slug in ('northside-lions','eastside-united','riverside-cricket'));
delete from ladder  where club_id in (select id from clubs where slug in ('northside-lions','eastside-united','riverside-cricket'));

-- ===========================================================================
-- NORTHSIDE LIONS FC  (AFL)
-- ===========================================================================
with c as (select id from clubs where slug='northside-lions')
insert into news (club_id,status,title,slug,author,summary,content,published_at)
select c.id, v.* from c cross join (values
  ('published','Lions roar home in season opener','lions-roar-home','Match Committee','A four-goal final term sealed a stirring 18-point win to open the year.','<p>The Lions kicked away late to down their cross-town rivals in front of a big home crowd.</p>', now() - interval '2 days'),
  ('published','Women''s side names leadership group','womens-leadership','Club','Four players will steer the side in what shapes as a big season.','<p>The club is proud to announce its 2026 women''s leadership group.</p>', now() - interval '6 days'),
  ('published','Auskick registrations now open','auskick-open','Juniors','Friday-night Auskick is back — first session is free.','<p>Bring the kids down for a run. Registrations are open now.</p>', now() - interval '11 days')
) as v(status,title,slug,author,summary,content,published_at);

with c as (select id from clubs where slug='northside-lions')
insert into events (club_id,status,title,slug,event_date,location,description,featured)
select c.id, v.* from c cross join (values
  ('published','Season Launch & Sponsors'' Night','season-launch', now() + interval '9 days','Lions Clubrooms','Meet the squads and our 2026 partners over a few drinks.', true),
  ('published','Ladies'' Day','ladies-day', now() + interval '23 days','Northside Oval','Our biggest social day of the year.', false)
) as v(status,title,slug,event_date,location,description,featured);

with c as (select id from clubs where slug='northside-lions')
insert into sponsors (club_id,status,name,sponsor_level,blurb,display_order,in_carousel)
select c.id, v.* from c cross join (values
  ('published','Northside Toyota','platinum','Proud major partner of the Lions.',1,true),
  ('published','The Commercial Hotel','gold','Post-match home of the Lions faithful.',2,true)
) as v(status,name,sponsor_level,blurb,display_order,in_carousel);

with c as (select id from clubs where slug='northside-lions')
insert into teams (club_id,status,name,age_group,gender,grade,display_order)
select c.id, v.* from c cross join (values
  ('published','Seniors','Open','Men','Men''s',1),
  ('published','Women''s','Open','Women','Women''s',2),
  ('published','Under 18 Boys','U18','Men','Junior Boys',3),
  ('published','Under 16 Girls','U16','Women','Junior Girls',4)
) as v(status,name,age_group,gender,grade,display_order);

with c as (select id from clubs where slug='northside-lions')
insert into matches (club_id,status,grade,round,match_date,opponent,home_away,our_score,opponent_score)
select c.id, v.* from c cross join (values
  ('completed','Seniors','Round 1', now() - interval '2 days','Westvale Hawks','Home',96,78),
  ('scheduled','Seniors','Round 2', now() + interval '5 days','Riverbend Saints','Away',null,null),
  ('scheduled','Seniors','Round 3', now() + interval '12 days','Hillcrest Tigers','Home',null,null),
  ('scheduled','Seniors','Round 4', now() + interval '19 days','Eastlake Crows','Away',null,null)
) as v(status,grade,round,match_date,opponent,home_away,our_score,opponent_score);

with c as (select id from clubs where slug='northside-lions')
insert into ladder (club_id,grade,position,team,played,won,lost,drawn,points,percentage,is_own)
select c.id, v.* from c cross join (values
  ('Seniors',1,'Hillcrest Tigers',1,1,0,0,4,142.0,false),
  ('Seniors',2,'Northside Lions',1,1,0,0,4,123.1,true),
  ('Seniors',3,'Eastlake Crows',1,1,0,0,4,118.4,false),
  ('Seniors',4,'Riverbend Saints',1,0,1,0,0,84.5,false),
  ('Seniors',5,'Westvale Hawks',1,0,1,0,0,81.3,false)
) as v(grade,position,team,played,won,lost,drawn,points,percentage,is_own);

-- ===========================================================================
-- EASTSIDE UNITED SC  (Soccer)
-- ===========================================================================
with c as (select id from clubs where slug='eastside-united')
insert into news (club_id,status,title,slug,author,summary,content,published_at)
select c.id, v.* from c cross join (values
  ('published','United edge a five-goal thriller','united-thriller','Match Report','A stoppage-time winner sent the home end into raptures.','<p>What a way to start the campaign — 3-2 after a frantic finish.</p>', now() - interval '1 day'),
  ('published','New women''s coach appointed','womens-coach','Club','A vastly experienced head coach joins for the new season.','<p>We are delighted to welcome our new women''s first-team coach.</p>', now() - interval '5 days'),
  ('published','MiniRoos sign-on day this Saturday','miniroos-signon','Juniors','First touch of the ball for our youngest players.','<p>Bring the family down for a fun morning of football.</p>', now() - interval '9 days')
) as v(status,title,slug,author,summary,content,published_at);

with c as (select id from clubs where slug='eastside-united')
insert into events (club_id,status,title,slug,event_date,location,description,featured)
select c.id, v.* from c cross join (values
  ('published','Presentation Night','presentation-night', now() + interval '14 days','United Pavilion','Celebrate the season''s award winners.', true),
  ('published','Gala Day','gala-day', now() + interval '28 days','Eastside Reserve','A full day of football across all age groups.', false)
) as v(status,title,slug,event_date,location,description,featured);

with c as (select id from clubs where slug='eastside-united')
insert into sponsors (club_id,status,name,sponsor_level,blurb,display_order,in_carousel)
select c.id, v.* from c cross join (values
  ('published','Eastside Sports Physio','platinum','Keeping United on the park.',1,true),
  ('published','Corner Flag Cafe','gold','Match-day coffee partner.',2,true)
) as v(status,name,sponsor_level,blurb,display_order,in_carousel);

with c as (select id from clubs where slug='eastside-united')
insert into teams (club_id,status,name,age_group,gender,grade,display_order)
select c.id, v.* from c cross join (values
  ('published','Men''s First XI','Open','Men','Men''s',1),
  ('published','Women''s First XI','Open','Women','Women''s',2),
  ('published','Junior Boys','U13','Men','Junior Boys',3),
  ('published','Junior Girls','U13','Women','Junior Girls',4)
) as v(status,name,age_group,gender,grade,display_order);

with c as (select id from clubs where slug='eastside-united')
insert into matches (club_id,status,grade,round,match_date,opponent,home_away,our_score,opponent_score)
select c.id, v.* from c cross join (values
  ('completed','Men''s','Round 1', now() - interval '1 day','Harbour City FC','Home',3,2),
  ('scheduled','Men''s','Round 2', now() + interval '6 days','Parkside Rovers','Away',null,null),
  ('scheduled','Men''s','Round 3', now() + interval '13 days','Lakeside United','Home',null,null),
  ('scheduled','Men''s','Round 4', now() + interval '20 days','Marrick Athletic','Away',null,null)
) as v(status,grade,round,match_date,opponent,home_away,our_score,opponent_score);

with c as (select id from clubs where slug='eastside-united')
insert into ladder (club_id,grade,position,team,played,won,lost,drawn,points,percentage,is_own)
select c.id, v.* from c cross join (values
  ('Men''s',1,'Eastside United',1,1,0,0,3,3.0,true),
  ('Men''s',2,'Lakeside United',1,1,0,0,3,2.0,false),
  ('Men''s',3,'Parkside Rovers',1,1,0,0,3,1.0,false),
  ('Men''s',4,'Harbour City FC',1,0,1,0,0,-1.0,false),
  ('Men''s',5,'Marrick Athletic',1,0,1,0,0,-2.0,false)
) as v(grade,position,team,played,won,lost,drawn,points,percentage,is_own);

-- ===========================================================================
-- RIVERSIDE CRICKET CLUB  (Cricket)
-- ===========================================================================
with c as (select id from clubs where slug='riverside-cricket')
insert into news (club_id,status,title,slug,author,summary,content,published_at)
select c.id, v.* from c cross join (values
  ('published','First XI chase down 240 in the last over','first-xi-chase','Scorers','A captain''s knock of 96 not out got us home with a ball to spare.','<p>An all-time great run chase at Riverside Oval.</p>', now() - interval '2 days'),
  ('published','Junior Blasters program returns','junior-blasters','Juniors','Saturday-morning cricket for our youngest players is back.','<p>Registrations for the new season are open now.</p>', now() - interval '7 days'),
  ('published','Turf wicket upgrade complete','turf-upgrade','Ground Staff','The centre square has never looked better.','<p>Months of work have delivered a first-class playing surface.</p>', now() - interval '12 days')
) as v(status,title,slug,author,summary,content,published_at);

with c as (select id from clubs where slug='riverside-cricket')
insert into events (club_id,status,title,slug,event_date,location,description,featured)
select c.id, v.* from c cross join (values
  ('published','Season Opening BBQ','opening-bbq', now() + interval '7 days','Riverside Clubrooms','Fire up the season with a barbecue and a hit.', true),
  ('published','Presentation Day','presentation-day', now() + interval '30 days','Riverside Oval','Trophies, awards and a long lunch.', false)
) as v(status,title,slug,event_date,location,description,featured);

with c as (select id from clubs where slug='riverside-cricket')
insert into sponsors (club_id,status,name,sponsor_level,blurb,display_order,in_carousel)
select c.id, v.* from c cross join (values
  ('published','Riverside Hardware','platinum','Proudly backing local cricket.',1,true),
  ('published','The Boundary Bakehouse','gold','Fuelling the long days in the field.',2,true)
) as v(status,name,sponsor_level,blurb,display_order,in_carousel);

with c as (select id from clubs where slug='riverside-cricket')
insert into teams (club_id,status,name,age_group,gender,grade,display_order)
select c.id, v.* from c cross join (values
  ('published','First XI','Open','Men','Men''s',1),
  ('published','Women''s XI','Open','Women','Women''s',2),
  ('published','Under 16 Boys','U16','Men','Junior Boys',3),
  ('published','Under 14 Girls','U14','Women','Junior Girls',4)
) as v(status,name,age_group,gender,grade,display_order);

with c as (select id from clubs where slug='riverside-cricket')
insert into matches (club_id,status,grade,round,match_date,opponent,home_away,our_score,opponent_score)
select c.id, v.* from c cross join (values
  ('completed','First XI','Round 1', now() - interval '2 days','Glenmore CC','Home',241,238),
  ('scheduled','First XI','Round 2', now() + interval '5 days','Bayswater CC','Away',null,null),
  ('scheduled','First XI','Round 3', now() + interval '12 days','Oakridge CC','Home',null,null),
  ('scheduled','First XI','Round 4', now() + interval '19 days','Stonefield CC','Away',null,null)
) as v(status,grade,round,match_date,opponent,home_away,our_score,opponent_score);

with c as (select id from clubs where slug='riverside-cricket')
insert into ladder (club_id,grade,position,team,played,won,lost,drawn,points,percentage,is_own)
select c.id, v.* from c cross join (values
  ('First XI',1,'Riverside CC',1,1,0,0,6,1.03,true),
  ('First XI',2,'Oakridge CC',1,1,0,0,6,1.01,false),
  ('First XI',3,'Bayswater CC',1,1,0,0,6,1.00,false),
  ('First XI',4,'Glenmore CC',1,0,1,0,0,0.97,false),
  ('First XI',5,'Stonefield CC',1,0,1,0,0,0.95,false)
) as v(grade,position,team,played,won,lost,drawn,points,percentage,is_own);

-- Done. Reload the site with the ?club=...&variant=... links at the top.
