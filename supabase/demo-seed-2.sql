-- ============================================================================
-- SportsWeb One — DEMO CLUBS (batch 2): one populated club per remaining template.
-- Creates the club (if missing) + seeds content. Safe to re-run.
-- sport_type is an ENUM: we look up a valid label and fall back to 'football'.
-- View each with:  /?club=<slug>&variant=<variant>   (?club=reset to exit)
--
--   Parkville Netball Club         /?club=parkville-netball&variant=courtside
--   Metro City Basketball          /?club=metro-city-basketball&variant=hardcourt
--   Bayside Lacrosse Club          /?club=bayside-lacrosse&variant=fastbreak
--   Brighton Rugby Union           /?club=brighton-rugby&variant=rugbyunion
--   Riverstone Rugby League        /?club=riverstone-rugby-league&variant=rugbyleague
--   Sunset Oztag                   /?club=sunset-oztag&variant=oztag
--   Coastal Touch                  /?club=coastal-touch&variant=touch
--   Westvale Junior Football Club  /?club=westvale-juniors&variant=juniors
--   Vintage Reds Masters           /?club=vintage-masters&variant=masters
--   Lakes United FNC               /?club=lakes-united-fnc&variant=fieldcourt
-- ============================================================================

-- Clear prior demo content (safe re-run) -------------------------------------
delete from news where club_id in (select id from clubs where slug in ('parkville-netball','metro-city-basketball','bayside-lacrosse','brighton-rugby','riverstone-rugby-league','sunset-oztag','coastal-touch','westvale-juniors','vintage-masters','lakes-united-fnc'));
delete from events where club_id in (select id from clubs where slug in ('parkville-netball','metro-city-basketball','bayside-lacrosse','brighton-rugby','riverstone-rugby-league','sunset-oztag','coastal-touch','westvale-juniors','vintage-masters','lakes-united-fnc'));
delete from sponsors where club_id in (select id from clubs where slug in ('parkville-netball','metro-city-basketball','bayside-lacrosse','brighton-rugby','riverstone-rugby-league','sunset-oztag','coastal-touch','westvale-juniors','vintage-masters','lakes-united-fnc'));
delete from teams where club_id in (select id from clubs where slug in ('parkville-netball','metro-city-basketball','bayside-lacrosse','brighton-rugby','riverstone-rugby-league','sunset-oztag','coastal-touch','westvale-juniors','vintage-masters','lakes-united-fnc'));
delete from matches where club_id in (select id from clubs where slug in ('parkville-netball','metro-city-basketball','bayside-lacrosse','brighton-rugby','riverstone-rugby-league','sunset-oztag','coastal-touch','westvale-juniors','vintage-masters','lakes-united-fnc'));
delete from ladder where club_id in (select id from clubs where slug in ('parkville-netball','metro-city-basketball','bayside-lacrosse','brighton-rugby','riverstone-rugby-league','sunset-oztag','coastal-touch','westvale-juniors','vintage-masters','lakes-united-fnc'));

-- Create the demo clubs if missing (sport_type resolved against the enum) ----
insert into clubs (name, slug, sport_type, primary_colour, secondary_colour, contact_email)
select 'Parkville Netball Club','parkville-netball',
  coalesce((select e.enumlabel::sport_type from pg_enum e join pg_type t on t.oid=e.enumtypid
            where t.typname='sport_type' and e.enumlabel = any(array['netball']) limit 1), 'football'::sport_type),
  '#0e7c7b','#ff6f61','info+parkville-netball@sportsweb.com.au'
where not exists (select 1 from clubs where slug='parkville-netball');
insert into clubs (name, slug, sport_type, primary_colour, secondary_colour, contact_email)
select 'Metro City Basketball','metro-city-basketball',
  coalesce((select e.enumlabel::sport_type from pg_enum e join pg_type t on t.oid=e.enumtypid
            where t.typname='sport_type' and e.enumlabel = any(array['basketball']) limit 1), 'football'::sport_type),
  '#ff6b1a','#0d0d10','info+metro-city-basketball@sportsweb.com.au'
where not exists (select 1 from clubs where slug='metro-city-basketball');
insert into clubs (name, slug, sport_type, primary_colour, secondary_colour, contact_email)
select 'Bayside Lacrosse Club','bayside-lacrosse',
  coalesce((select e.enumlabel::sport_type from pg_enum e join pg_type t on t.oid=e.enumtypid
            where t.typname='sport_type' and e.enumlabel = any(array['lacrosse']) limit 1), 'football'::sport_type),
  '#00c2b3','#2b1a55','info+bayside-lacrosse@sportsweb.com.au'
where not exists (select 1 from clubs where slug='bayside-lacrosse');
insert into clubs (name, slug, sport_type, primary_colour, secondary_colour, contact_email)
select 'Brighton Rugby Union','brighton-rugby',
  coalesce((select e.enumlabel::sport_type from pg_enum e join pg_type t on t.oid=e.enumtypid
            where t.typname='sport_type' and e.enumlabel = any(array['rugby_union','rugbyunion','rugby union','union']) limit 1), 'football'::sport_type),
  '#0b3d2e','#c9a227','info+brighton-rugby@sportsweb.com.au'
where not exists (select 1 from clubs where slug='brighton-rugby');
insert into clubs (name, slug, sport_type, primary_colour, secondary_colour, contact_email)
select 'Riverstone Rugby League','riverstone-rugby-league',
  coalesce((select e.enumlabel::sport_type from pg_enum e join pg_type t on t.oid=e.enumtypid
            where t.typname='sport_type' and e.enumlabel = any(array['rugby_league','rugbyleague','rugby league','league']) limit 1), 'football'::sport_type),
  '#d62828','#14110f','info+riverstone-rugby-league@sportsweb.com.au'
where not exists (select 1 from clubs where slug='riverstone-rugby-league');
insert into clubs (name, slug, sport_type, primary_colour, secondary_colour, contact_email)
select 'Sunset Oztag','sunset-oztag',
  coalesce((select e.enumlabel::sport_type from pg_enum e join pg_type t on t.oid=e.enumtypid
            where t.typname='sport_type' and e.enumlabel = any(array['oztag','oz_tag','oz tag']) limit 1), 'football'::sport_type),
  '#b5179e','#4cc9f0','info+sunset-oztag@sportsweb.com.au'
where not exists (select 1 from clubs where slug='sunset-oztag');
insert into clubs (name, slug, sport_type, primary_colour, secondary_colour, contact_email)
select 'Coastal Touch','coastal-touch',
  coalesce((select e.enumlabel::sport_type from pg_enum e join pg_type t on t.oid=e.enumtypid
            where t.typname='sport_type' and e.enumlabel = any(array['touch','touch_football','touch football']) limit 1), 'football'::sport_type),
  '#2ec4b6','#ff9f1c','info+coastal-touch@sportsweb.com.au'
where not exists (select 1 from clubs where slug='coastal-touch');
insert into clubs (name, slug, sport_type, primary_colour, secondary_colour, contact_email)
select 'Westvale Junior Football Club','westvale-juniors',
  coalesce((select e.enumlabel::sport_type from pg_enum e join pg_type t on t.oid=e.enumtypid
            where t.typname='sport_type' and e.enumlabel = any(array['football','afl','australian_football']) limit 1), 'football'::sport_type),
  '#2aa7ff','#ffc83d','info+westvale-juniors@sportsweb.com.au'
where not exists (select 1 from clubs where slug='westvale-juniors');
insert into clubs (name, slug, sport_type, primary_colour, secondary_colour, contact_email)
select 'Vintage Reds Masters','vintage-masters',
  coalesce((select e.enumlabel::sport_type from pg_enum e join pg_type t on t.oid=e.enumtypid
            where t.typname='sport_type' and e.enumlabel = any(array['football','afl']) limit 1), 'football'::sport_type),
  '#6e1f2a','#c79a3a','info+vintage-masters@sportsweb.com.au'
where not exists (select 1 from clubs where slug='vintage-masters');
insert into clubs (name, slug, sport_type, primary_colour, secondary_colour, contact_email)
select 'Lakes United FNC','lakes-united-fnc',
  coalesce((select e.enumlabel::sport_type from pg_enum e join pg_type t on t.oid=e.enumtypid
            where t.typname='sport_type' and e.enumlabel = any(array['football','afl_netball','football_netball']) limit 1), 'football'::sport_type),
  '#16284a','#e0533d','info+lakes-united-fnc@sportsweb.com.au'
where not exists (select 1 from clubs where slug='lakes-united-fnc');

with c as (select id from clubs where slug='parkville-netball')
insert into news (club_id,status,title,slug,author,summary,content,published_at)
select c.id, v.* from c cross join (values
  ('published','Stars edged in a thriller on the buzzer','stars-thriller','Coach','A one-goal win to open the season in front of a packed court.','<p>A one-goal win to open the season in front of a packed court.</p>', now() - interval '2 days'),
  ('published','NetSetGo sign-on this Saturday','netsetgo-signon','Juniors','First taste of netball for our youngest players.','<p>First taste of netball for our youngest players.</p>', now() - interval '6 days'),
  ('published','New A Grade coach announced','a-grade-coach','Club','An experienced mentor joins for the new campaign.','<p>An experienced mentor joins for the new campaign.</p>', now() - interval '10 days')
) as v(status,title,slug,author,summary,content,published_at);

with c as (select id from clubs where slug='parkville-netball')
insert into events (club_id,status,title,slug,event_date,location,description,featured)
select c.id, v.* from c cross join (values
  ('published','Season Launch Night','season-launch', now() + interval '8 days','Parkville Stadium','Join us at the club.', true),
  ('published','Club Awards Night','awards-night', now() + interval '26 days','Parkville Function Room','Join us at the club.', false)
) as v(status,title,slug,event_date,location,description,featured);

with c as (select id from clubs where slug='parkville-netball')
insert into sponsors (club_id,status,name,sponsor_level,blurb,display_order,in_carousel)
select c.id, v.* from c cross join (values
  ('published','Parkville Physio','platinum','Keeping our players on court.',1,true),
  ('published','Court Side Cafe','gold','Match-day coffee partner.',2,true)
) as v(status,name,sponsor_level,blurb,display_order,in_carousel);

with c as (select id from clubs where slug='parkville-netball')
insert into teams (club_id,status,name,age_group,gender,grade,display_order)
select c.id, v.* from c cross join (values
  ('published','A Grade','Open','Women','A Grade',1),
  ('published','B Grade','Open','Women','B Grade',2),
  ('published','Under 17','U17','Women','Junior Girls',3),
  ('published','Mixed Social','Open','Mixed','Mixed',4)
) as v(status,name,age_group,gender,grade,display_order);

with c as (select id from clubs where slug='parkville-netball')
insert into matches (club_id,status,grade,round,match_date,opponent,home_away,our_score,opponent_score)
select c.id, v.* from c cross join (values
  ('completed','A Grade','Round 1', now() - interval '2 days','Hawthorn Stars','Home',54,49),
  ('scheduled','A Grade','Round 2', now() + interval '5 days','Eastern Eagles','Away',null,null),
  ('scheduled','A Grade','Round 3', now() + interval '12 days','Western Waves','Home',null,null),
  ('scheduled','A Grade','Round 4', now() + interval '19 days','Northcote Nets','Away',null,null)
) as v(status,grade,round,match_date,opponent,home_away,our_score,opponent_score);

with c as (select id from clubs where slug='parkville-netball')
insert into ladder (club_id,grade,position,team,played,won,lost,drawn,points,percentage,is_own)
select c.id, v.* from c cross join (values
  ('A Grade',1,'Parkville Netball Club',1,1,0,0,4,1.2,true),
  ('A Grade',2,'Hawthorn Stars',1,1,0,0,4,1.12,false),
  ('A Grade',3,'Eastern Eagles',1,1,0,0,4,1.05,false),
  ('A Grade',4,'Western Waves',1,0,1,0,0,0.95,false),
  ('A Grade',5,'Northcote Nets',1,0,1,0,0,0.88,false)
) as v(grade,position,team,played,won,lost,drawn,points,percentage,is_own);

with c as (select id from clubs where slug='metro-city-basketball')
insert into news (club_id,status,title,slug,author,summary,content,published_at)
select c.id, v.* from c cross join (values
  ('published','Heat run away with it in the final quarter','heat-run-away','Stats','A 20-point final term sealed a statement win.','<p>A 20-point final term sealed a statement win.</p>', now() - interval '2 days'),
  ('published','Domestic comp registrations open','domestic-open','Club','Get your team in for the summer season.','<p>Get your team in for the summer season.</p>', now() - interval '6 days'),
  ('published','Rep tryouts announced for 2026','rep-tryouts','Pathways','Dates locked in for representative selection.','<p>Dates locked in for representative selection.</p>', now() - interval '10 days')
) as v(status,title,slug,author,summary,content,published_at);

with c as (select id from clubs where slug='metro-city-basketball')
insert into events (club_id,status,title,slug,event_date,location,description,featured)
select c.id, v.* from c cross join (values
  ('published','Season Tip-Off','tip-off', now() + interval '6 days','Metro City Stadium','Join us at the club.', true),
  ('published','Presentation Day','presentation-day', now() + interval '30 days','Metro City Stadium','Join us at the club.', false)
) as v(status,title,slug,event_date,location,description,featured);

with c as (select id from clubs where slug='metro-city-basketball')
insert into sponsors (club_id,status,name,sponsor_level,blurb,display_order,in_carousel)
select c.id, v.* from c cross join (values
  ('published','Metro Sports Store','platinum','Proudly outfitting the club.',1,true),
  ('published','The Free Throw Cafe','gold','Courtside coffee.',2,true)
) as v(status,name,sponsor_level,blurb,display_order,in_carousel);

with c as (select id from clubs where slug='metro-city-basketball')
insert into teams (club_id,status,name,age_group,gender,grade,display_order)
select c.id, v.* from c cross join (values
  ('published','Men''s Div 1','Open','Men','Men''s',1),
  ('published','Women''s Div 1','Open','Women','Women''s',2),
  ('published','Under 16 Boys','U16','Men','Junior Boys',3),
  ('published','Under 16 Girls','U16','Women','Junior Girls',4)
) as v(status,name,age_group,gender,grade,display_order);

with c as (select id from clubs where slug='metro-city-basketball')
insert into matches (club_id,status,grade,round,match_date,opponent,home_away,our_score,opponent_score)
select c.id, v.* from c cross join (values
  ('completed','Men''s Div 1','Round 1', now() - interval '2 days','Riverside Hawks','Home',88,81),
  ('scheduled','Men''s Div 1','Round 2', now() + interval '5 days','Lakeside Lakers','Away',null,null),
  ('scheduled','Men''s Div 1','Round 3', now() + interval '12 days','Eastgate Heat','Home',null,null),
  ('scheduled','Men''s Div 1','Round 4', now() + interval '19 days','Southside Kings','Away',null,null)
) as v(status,grade,round,match_date,opponent,home_away,our_score,opponent_score);

with c as (select id from clubs where slug='metro-city-basketball')
insert into ladder (club_id,grade,position,team,played,won,lost,drawn,points,percentage,is_own)
select c.id, v.* from c cross join (values
  ('Men''s Div 1',1,'Metro City Basketball',1,1,0,0,2,2.0,true),
  ('Men''s Div 1',2,'Riverside Hawks',1,1,0,0,2,2.0,false),
  ('Men''s Div 1',3,'Lakeside Lakers',1,1,0,0,2,1.0,false),
  ('Men''s Div 1',4,'Eastgate Heat',1,0,1,0,0,0.0,false),
  ('Men''s Div 1',5,'Southside Kings',1,0,1,0,0,0.0,false)
) as v(grade,position,team,played,won,lost,drawn,points,percentage,is_own);

with c as (select id from clubs where slug='bayside-lacrosse')
insert into news (club_id,status,title,slug,author,summary,content,published_at)
select c.id, v.* from c cross join (values
  ('published','Last-minute goal seals the points','last-minute-goal','Match Report','An end-to-end thriller went our way in the dying seconds.','<p>An end-to-end thriller went our way in the dying seconds.</p>', now() - interval '2 days'),
  ('published','Come and try lacrosse this month','come-and-try','Club','Never picked up a stick? Now''s your chance.','<p>Never picked up a stick? Now''s your chance.</p>', now() - interval '6 days'),
  ('published','Women''s program goes from strength to strength','womens-program','Club','Record numbers at training this pre-season.','<p>Record numbers at training this pre-season.</p>', now() - interval '10 days')
) as v(status,title,slug,author,summary,content,published_at);

with c as (select id from clubs where slug='bayside-lacrosse')
insert into events (club_id,status,title,slug,event_date,location,description,featured)
select c.id, v.* from c cross join (values
  ('published','Season Opener & BBQ','opener-bbq', now() + interval '7 days','Bayside Reserve','Join us at the club.', true),
  ('published','Club Presentation','presentation', now() + interval '28 days','Bayside Clubrooms','Join us at the club.', false)
) as v(status,title,slug,event_date,location,description,featured);

with c as (select id from clubs where slug='bayside-lacrosse')
insert into sponsors (club_id,status,name,sponsor_level,blurb,display_order,in_carousel)
select c.id, v.* from c cross join (values
  ('published','Bayside Health','platinum','Backing local lacrosse.',1,true),
  ('published','The Crease Cafe','gold','Game-day eats.',2,true)
) as v(status,name,sponsor_level,blurb,display_order,in_carousel);

with c as (select id from clubs where slug='bayside-lacrosse')
insert into teams (club_id,status,name,age_group,gender,grade,display_order)
select c.id, v.* from c cross join (values
  ('published','Men''s Seniors','Open','Men','Men''s',1),
  ('published','Women''s Seniors','Open','Women','Women''s',2),
  ('published','Junior Boys','U15','Men','Junior Boys',3),
  ('published','Junior Girls','U15','Women','Junior Girls',4)
) as v(status,name,age_group,gender,grade,display_order);

with c as (select id from clubs where slug='bayside-lacrosse')
insert into matches (club_id,status,grade,round,match_date,opponent,home_away,our_score,opponent_score)
select c.id, v.* from c cross join (values
  ('completed','Seniors','Round 1', now() - interval '2 days','Coburg Cobras','Home',12,9),
  ('scheduled','Seniors','Round 2', now() + interval '5 days','Eltham Eagles','Away',null,null),
  ('scheduled','Seniors','Round 3', now() + interval '12 days','Williamstown','Home',null,null),
  ('scheduled','Seniors','Round 4', now() + interval '19 days','Footscray','Away',null,null)
) as v(status,grade,round,match_date,opponent,home_away,our_score,opponent_score);

with c as (select id from clubs where slug='bayside-lacrosse')
insert into ladder (club_id,grade,position,team,played,won,lost,drawn,points,percentage,is_own)
select c.id, v.* from c cross join (values
  ('Seniors',1,'Bayside Lacrosse Club',1,1,0,0,4,1.4,true),
  ('Seniors',2,'Coburg Cobras',1,1,0,0,4,1.2,false),
  ('Seniors',3,'Eltham Eagles',1,1,0,0,4,1.0,false),
  ('Seniors',4,'Williamstown',1,0,1,0,0,0.9,false),
  ('Seniors',5,'Footscray',1,0,1,0,0,0.7,false)
) as v(grade,position,team,played,won,lost,drawn,points,percentage,is_own);

with c as (select id from clubs where slug='brighton-rugby')
insert into news (club_id,status,title,slug,author,summary,content,published_at)
select c.id, v.* from c cross join (values
  ('published','Forwards lay the platform in opening win','forwards-platform','Match Report','A dominant scrum set up a hard-fought victory.','<p>A dominant scrum set up a hard-fought victory.</p>', now() - interval '2 days'),
  ('published','Colts program kicks off','colts-kickoff','Juniors','Pathway rugby for our up-and-comers.','<p>Pathway rugby for our up-and-comers.</p>', now() - interval '6 days'),
  ('published','Clubhouse renovations complete','clubhouse-reno','Club','The bar and function room have never looked better.','<p>The bar and function room have never looked better.</p>', now() - interval '10 days')
) as v(status,title,slug,author,summary,content,published_at);

with c as (select id from clubs where slug='brighton-rugby')
insert into events (club_id,status,title,slug,event_date,location,description,featured)
select c.id, v.* from c cross join (values
  ('published','Season Launch Lunch','launch-lunch', now() + interval '9 days','Brighton Clubhouse','Join us at the club.', true),
  ('published','Old Boys'' Day','old-boys-day', now() + interval '27 days','Brighton Oval','Join us at the club.', false)
) as v(status,title,slug,event_date,location,description,featured);

with c as (select id from clubs where slug='brighton-rugby')
insert into sponsors (club_id,status,name,sponsor_level,blurb,display_order,in_carousel)
select c.id, v.* from c cross join (values
  ('published','Brighton Cellars','platinum','Proud club partner.',1,true),
  ('published','The Lineout Bar','gold','Post-match home of the club.',2,true)
) as v(status,name,sponsor_level,blurb,display_order,in_carousel);

with c as (select id from clubs where slug='brighton-rugby')
insert into teams (club_id,status,name,age_group,gender,grade,display_order)
select c.id, v.* from c cross join (values
  ('published','1st XV','Open','Men','Men''s',1),
  ('published','Women''s XV','Open','Women','Women''s',2),
  ('published','Colts','U18','Men','Junior Boys',3),
  ('published','Junior Girls','U16','Women','Junior Girls',4)
) as v(status,name,age_group,gender,grade,display_order);

with c as (select id from clubs where slug='brighton-rugby')
insert into matches (club_id,status,grade,round,match_date,opponent,home_away,our_score,opponent_score)
select c.id, v.* from c cross join (values
  ('completed','1st XV','Round 1', now() - interval '2 days','Camberwell','Home',27,19),
  ('scheduled','1st XV','Round 2', now() + interval '5 days','Box Hill','Away',null,null),
  ('scheduled','1st XV','Round 3', now() + interval '12 days','Harlequins','Home',null,null),
  ('scheduled','1st XV','Round 4', now() + interval '19 days','Power House','Away',null,null)
) as v(status,grade,round,match_date,opponent,home_away,our_score,opponent_score);

with c as (select id from clubs where slug='brighton-rugby')
insert into ladder (club_id,grade,position,team,played,won,lost,drawn,points,percentage,is_own)
select c.id, v.* from c cross join (values
  ('1st XV',1,'Brighton Rugby Union',1,1,0,0,5,1.6,true),
  ('1st XV',2,'Camberwell',1,1,0,0,5,1.3,false),
  ('1st XV',3,'Box Hill',1,1,0,0,5,1.1,false),
  ('1st XV',4,'Harlequins',1,0,1,0,0,0.9,false),
  ('1st XV',5,'Power House',1,0,1,0,0,0.6,false)
) as v(grade,position,team,played,won,lost,drawn,points,percentage,is_own);

with c as (select id from clubs where slug='riverstone-rugby-league')
insert into news (club_id,status,title,slug,author,summary,content,published_at)
select c.id, v.* from c cross join (values
  ('published','Big second half powers the win','big-second-half','Match Report','Four tries after the break broke the game open.','<p>Four tries after the break broke the game open.</p>', now() - interval '2 days'),
  ('published','Junior league registrations now open','junior-league-open','Juniors','Get the kids signed up for the new season.','<p>Get the kids signed up for the new season.</p>', now() - interval '6 days'),
  ('published','Captain re-signs for three more years','captain-resigns','Club','A massive boost to the spine of the side.','<p>A massive boost to the spine of the side.</p>', now() - interval '10 days')
) as v(status,title,slug,author,summary,content,published_at);

with c as (select id from clubs where slug='riverstone-rugby-league')
insert into events (club_id,status,title,slug,event_date,location,description,featured)
select c.id, v.* from c cross join (values
  ('published','Season Launch','season-launch', now() + interval '6 days','Riverstone Leagues Club','Join us at the club.', true),
  ('published','Ladies'' Day','ladies-day', now() + interval '24 days','Riverstone Oval','Join us at the club.', false)
) as v(status,title,slug,event_date,location,description,featured);

with c as (select id from clubs where slug='riverstone-rugby-league')
insert into sponsors (club_id,status,name,sponsor_level,blurb,display_order,in_carousel)
select c.id, v.* from c cross join (values
  ('published','Riverstone Leagues Club','platinum','The heart of the club.',1,true),
  ('published','Westside Tyres','gold','Keeping us rolling.',2,true)
) as v(status,name,sponsor_level,blurb,display_order,in_carousel);

with c as (select id from clubs where slug='riverstone-rugby-league')
insert into teams (club_id,status,name,age_group,gender,grade,display_order)
select c.id, v.* from c cross join (values
  ('published','First Grade','Open','Men','Men''s',1),
  ('published','Women''s','Open','Women','Women''s',2),
  ('published','Under 18 Boys','U18','Men','Junior Boys',3),
  ('published','Under 16 Girls','U16','Women','Junior Girls',4)
) as v(status,name,age_group,gender,grade,display_order);

with c as (select id from clubs where slug='riverstone-rugby-league')
insert into matches (club_id,status,grade,round,match_date,opponent,home_away,our_score,opponent_score)
select c.id, v.* from c cross join (values
  ('completed','First Grade','Round 1', now() - interval '2 days','Penrith Pumas','Home',24,18),
  ('scheduled','First Grade','Round 2', now() + interval '5 days','Windsor Wolves','Away',null,null),
  ('scheduled','First Grade','Round 3', now() + interval '12 days','Quakers Hill','Home',null,null),
  ('scheduled','First Grade','Round 4', now() + interval '19 days','Blacktown','Away',null,null)
) as v(status,grade,round,match_date,opponent,home_away,our_score,opponent_score);

with c as (select id from clubs where slug='riverstone-rugby-league')
insert into ladder (club_id,grade,position,team,played,won,lost,drawn,points,percentage,is_own)
select c.id, v.* from c cross join (values
  ('First Grade',1,'Riverstone Rugby League',1,1,0,0,2,2.0,true),
  ('First Grade',2,'Penrith Pumas',1,1,0,0,2,2.0,false),
  ('First Grade',3,'Windsor Wolves',1,1,0,0,2,2.0,false),
  ('First Grade',4,'Quakers Hill',1,0,1,0,0,0.0,false),
  ('First Grade',5,'Blacktown',1,0,1,0,0,0.0,false)
) as v(grade,position,team,played,won,lost,drawn,points,percentage,is_own);

with c as (select id from clubs where slug='sunset-oztag')
insert into news (club_id,status,title,slug,author,summary,content,published_at)
select c.id, v.* from c cross join (values
  ('published','Mixed comp kicks off under lights','mixed-kicks-off','Club','A huge turnout for round one of the summer comp.','<p>A huge turnout for round one of the summer comp.</p>', now() - interval '2 days'),
  ('published','Team nominations close Friday','noms-close','Comp','Get your side in before the cut-off.','<p>Get your side in before the cut-off.</p>', now() - interval '6 days'),
  ('published','New women''s division added','womens-division','Club','Demand has never been higher.','<p>Demand has never been higher.</p>', now() - interval '10 days')
) as v(status,title,slug,author,summary,content,published_at);

with c as (select id from clubs where slug='sunset-oztag')
insert into events (club_id,status,title,slug,event_date,location,description,featured)
select c.id, v.* from c cross join (values
  ('published','Summer Comp Launch','comp-launch', now() + interval '5 days','Sunset Reserve','Join us at the club.', true),
  ('published','Grand Final Night','grand-final', now() + interval '35 days','Sunset Reserve','Join us at the club.', false)
) as v(status,title,slug,event_date,location,description,featured);

with c as (select id from clubs where slug='sunset-oztag')
insert into sponsors (club_id,status,name,sponsor_level,blurb,display_order,in_carousel)
select c.id, v.* from c cross join (values
  ('published','Sunset Sports','platinum','Backing social sport.',1,true),
  ('published','The Halftime Bar','gold','Post-game refreshments.',2,true)
) as v(status,name,sponsor_level,blurb,display_order,in_carousel);

with c as (select id from clubs where slug='sunset-oztag')
insert into teams (club_id,status,name,age_group,gender,grade,display_order)
select c.id, v.* from c cross join (values
  ('published','Mixed Open','Open','Mixed','Mixed',1),
  ('published','Men''s Open','Open','Men','Men''s',2),
  ('published','Women''s Open','Open','Women','Women''s',3),
  ('published','Juniors','U14','Men','Junior Boys',4)
) as v(status,name,age_group,gender,grade,display_order);

with c as (select id from clubs where slug='sunset-oztag')
insert into matches (club_id,status,grade,round,match_date,opponent,home_away,our_score,opponent_score)
select c.id, v.* from c cross join (values
  ('completed','Mixed Open','Round 1', now() - interval '2 days','Coastal Crew','Home',8,6),
  ('scheduled','Mixed Open','Round 2', now() + interval '5 days','City Slickers','Away',null,null),
  ('scheduled','Mixed Open','Round 3', now() + interval '12 days','Park Rangers','Home',null,null),
  ('scheduled','Mixed Open','Round 4', now() + interval '19 days','The Tag Team','Away',null,null)
) as v(status,grade,round,match_date,opponent,home_away,our_score,opponent_score);

with c as (select id from clubs where slug='sunset-oztag')
insert into ladder (club_id,grade,position,team,played,won,lost,drawn,points,percentage,is_own)
select c.id, v.* from c cross join (values
  ('Mixed Open',1,'Sunset Oztag',1,1,0,0,2,2.0,true),
  ('Mixed Open',2,'Coastal Crew',1,1,0,0,2,2.0,false),
  ('Mixed Open',3,'City Slickers',1,1,0,0,2,1.0,false),
  ('Mixed Open',4,'Park Rangers',1,0,1,0,0,0.0,false),
  ('Mixed Open',5,'The Tag Team',1,0,1,0,0,0.0,false)
) as v(grade,position,team,played,won,lost,drawn,points,percentage,is_own);

with c as (select id from clubs where slug='coastal-touch')
insert into news (club_id,status,title,slug,author,summary,content,published_at)
select c.id, v.* from c cross join (values
  ('published','Drifters held out in a try-fest','drifters-held-out','Match Report','Both sides traded tries before we held on late.','<p>Both sides traded tries before we held on late.</p>', now() - interval '2 days'),
  ('published','Free come-and-try night this week','come-and-try-night','Club','Bring a mate and give touch a go.','<p>Bring a mate and give touch a go.</p>', now() - interval '6 days'),
  ('published','Juniors program returns for summer','juniors-return','Juniors','Saturday-morning touch for the kids.','<p>Saturday-morning touch for the kids.</p>', now() - interval '10 days')
) as v(status,title,slug,author,summary,content,published_at);

with c as (select id from clubs where slug='coastal-touch')
insert into events (club_id,status,title,slug,event_date,location,description,featured)
select c.id, v.* from c cross join (values
  ('published','Season Welcome BBQ','welcome-bbq', now() + interval '7 days','Coastal Fields','Join us at the club.', true),
  ('published','Presentation Evening','presentation', now() + interval '29 days','Coastal Surf Club','Join us at the club.', false)
) as v(status,title,slug,event_date,location,description,featured);

with c as (select id from clubs where slug='coastal-touch')
insert into sponsors (club_id,status,name,sponsor_level,blurb,display_order,in_carousel)
select c.id, v.* from c cross join (values
  ('published','Coastal Surf Co','platinum','Riding with the club.',1,true),
  ('published','The Try Line Kiosk','gold','Game-night feeds.',2,true)
) as v(status,name,sponsor_level,blurb,display_order,in_carousel);

with c as (select id from clubs where slug='coastal-touch')
insert into teams (club_id,status,name,age_group,gender,grade,display_order)
select c.id, v.* from c cross join (values
  ('published','Mixed Open','Open','Mixed','Mixed',1),
  ('published','Men''s Open','Open','Men','Men''s',2),
  ('published','Women''s Open','Open','Women','Women''s',3),
  ('published','Junior Mixed','U12','Mixed','Junior Mixed',4)
) as v(status,name,age_group,gender,grade,display_order);

with c as (select id from clubs where slug='coastal-touch')
insert into matches (club_id,status,grade,round,match_date,opponent,home_away,our_score,opponent_score)
select c.id, v.* from c cross join (values
  ('completed','Mixed Open','Round 1', now() - interval '2 days','Harbour Heat','Home',7,5),
  ('scheduled','Mixed Open','Round 2', now() + interval '5 days','Bayline','Away',null,null),
  ('scheduled','Mixed Open','Round 3', now() + interval '12 days','The Drifters','Home',null,null),
  ('scheduled','Mixed Open','Round 4', now() + interval '19 days','Seaside','Away',null,null)
) as v(status,grade,round,match_date,opponent,home_away,our_score,opponent_score);

with c as (select id from clubs where slug='coastal-touch')
insert into ladder (club_id,grade,position,team,played,won,lost,drawn,points,percentage,is_own)
select c.id, v.* from c cross join (values
  ('Mixed Open',1,'Coastal Touch',1,1,0,0,2,2.0,true),
  ('Mixed Open',2,'Harbour Heat',1,1,0,0,2,2.0,false),
  ('Mixed Open',3,'Bayline',1,1,0,0,2,1.0,false),
  ('Mixed Open',4,'The Drifters',1,0,1,0,0,0.0,false),
  ('Mixed Open',5,'Seaside',1,0,1,0,0,0.0,false)
) as v(grade,position,team,played,won,lost,drawn,points,percentage,is_own);

with c as (select id from clubs where slug='westvale-juniors')
insert into news (club_id,status,title,slug,author,summary,content,published_at)
select c.id, v.* from c cross join (values
  ('published','Under 12s salute in a tight one','u12s-salute','Team Manager','A great team effort got the kids home.','<p>A great team effort got the kids home.</p>', now() - interval '2 days'),
  ('published','Auskick is back on Friday nights','auskick-back','Juniors','First session is free — bring the family.','<p>First session is free — bring the family.</p>', now() - interval '6 days'),
  ('published','Volunteer coaches needed','coaches-needed','Club','Many hands make a great season.','<p>Many hands make a great season.</p>', now() - interval '10 days')
) as v(status,title,slug,author,summary,content,published_at);

with c as (select id from clubs where slug='westvale-juniors')
insert into events (club_id,status,title,slug,event_date,location,description,featured)
select c.id, v.* from c cross join (values
  ('published','Family Season Launch','family-launch', now() + interval '8 days','Westvale Oval','Join us at the club.', true),
  ('published','Footy Colours Day','footy-colours', now() + interval '25 days','Westvale Oval','Join us at the club.', false)
) as v(status,title,slug,event_date,location,description,featured);

with c as (select id from clubs where slug='westvale-juniors')
insert into sponsors (club_id,status,name,sponsor_level,blurb,display_order,in_carousel)
select c.id, v.* from c cross join (values
  ('published','Westvale IGA','platinum','Feeding the future stars.',1,true),
  ('published','Kids Kicks Sports','gold','Boots and gear partner.',2,true)
) as v(status,name,sponsor_level,blurb,display_order,in_carousel);

with c as (select id from clubs where slug='westvale-juniors')
insert into teams (club_id,status,name,age_group,gender,grade,display_order)
select c.id, v.* from c cross join (values
  ('published','Auskick','5-8','Mixed','Auskick',1),
  ('published','Under 12 Boys','U12','Men','Junior Boys',2),
  ('published','Under 12 Girls','U12','Women','Junior Girls',3),
  ('published','Youth Girls','U16','Women','Youth',4)
) as v(status,name,age_group,gender,grade,display_order);

with c as (select id from clubs where slug='westvale-juniors')
insert into matches (club_id,status,grade,round,match_date,opponent,home_away,our_score,opponent_score)
select c.id, v.* from c cross join (values
  ('completed','Under 12s','Round 1', now() - interval '2 days','Highton','Home',48,33),
  ('scheduled','Under 12s','Round 2', now() + interval '5 days','Bell Park','Away',null,null),
  ('scheduled','Under 12s','Round 3', now() + interval '12 days','Lara','Home',null,null),
  ('scheduled','Under 12s','Round 4', now() + interval '19 days','Leopold','Away',null,null)
) as v(status,grade,round,match_date,opponent,home_away,our_score,opponent_score);

with c as (select id from clubs where slug='westvale-juniors')
insert into ladder (club_id,grade,position,team,played,won,lost,drawn,points,percentage,is_own)
select c.id, v.* from c cross join (values
  ('Under 12s',1,'Westvale Junior Football Club',1,1,0,0,4,1.5,true),
  ('Under 12s',2,'Highton',1,1,0,0,4,1.2,false),
  ('Under 12s',3,'Bell Park',1,1,0,0,4,1.0,false),
  ('Under 12s',4,'Lara',1,0,1,0,0,0.8,false),
  ('Under 12s',5,'Leopold',1,0,1,0,0,0.6,false)
) as v(grade,position,team,played,won,lost,drawn,points,percentage,is_own);

with c as (select id from clubs where slug='vintage-masters')
insert into news (club_id,status,title,slug,author,summary,content,published_at)
select c.id, v.* from c cross join (values
  ('published','Reds get the chocolates in the opener','reds-chocolates','Social Sec','A win, a sing-song and a long lunch afterwards.','<p>A win, a sing-song and a long lunch afterwards.</p>', now() - interval '2 days'),
  ('published','New faces welcome — no pressure, all fun','new-faces','Club','Over 35 and keen for a run? Come down.','<p>Over 35 and keen for a run? Come down.</p>', now() - interval '6 days'),
  ('published','Annual reunion weekend locked in','reunion-weekend','Club','Old teammates, new memories.','<p>Old teammates, new memories.</p>', now() - interval '10 days')
) as v(status,title,slug,author,summary,content,published_at);

with c as (select id from clubs where slug='vintage-masters')
insert into events (club_id,status,title,slug,event_date,location,description,featured)
select c.id, v.* from c cross join (values
  ('published','Season Launch & Long Lunch','launch-lunch', now() + interval '9 days','Reds Clubrooms','Join us at the club.', true),
  ('published','Reunion Weekend','reunion', now() + interval '31 days','Reds Oval','Join us at the club.', false)
) as v(status,title,slug,event_date,location,description,featured);

with c as (select id from clubs where slug='vintage-masters')
insert into sponsors (club_id,status,name,sponsor_level,blurb,display_order,in_carousel)
select c.id, v.* from c cross join (values
  ('published','The Vintage Cellar','platinum','Refreshing the Reds since forever.',1,true),
  ('published','Reds Bistro','gold','Post-match feeds.',2,true)
) as v(status,name,sponsor_level,blurb,display_order,in_carousel);

with c as (select id from clubs where slug='vintage-masters')
insert into teams (club_id,status,name,age_group,gender,grade,display_order)
select c.id, v.* from c cross join (values
  ('published','Over 35s','35+','Men','Over 35s',1),
  ('published','Over 45s','45+','Men','Over 45s',2),
  ('published','Supers 55+','55+','Men','Over 55s',3),
  ('published','Women''s Masters','Open','Women','Women''s',4)
) as v(status,name,age_group,gender,grade,display_order);

with c as (select id from clubs where slug='vintage-masters')
insert into matches (club_id,status,grade,round,match_date,opponent,home_away,our_score,opponent_score)
select c.id, v.* from c cross join (values
  ('completed','Over 35s','Round 1', now() - interval '2 days','Old Scotch','Home',56,50),
  ('scheduled','Over 35s','Round 2', now() + interval '5 days','Yarra Valley','Away',null,null),
  ('scheduled','Over 35s','Round 3', now() + interval '12 days','The Has-Beens','Home',null,null),
  ('scheduled','Over 35s','Round 4', now() + interval '19 days','Golden Oldies','Away',null,null)
) as v(status,grade,round,match_date,opponent,home_away,our_score,opponent_score);

with c as (select id from clubs where slug='vintage-masters')
insert into ladder (club_id,grade,position,team,played,won,lost,drawn,points,percentage,is_own)
select c.id, v.* from c cross join (values
  ('Over 35s',1,'Vintage Reds Masters',1,1,0,0,4,1.3,true),
  ('Over 35s',2,'Old Scotch',1,1,0,0,4,1.1,false),
  ('Over 35s',3,'Yarra Valley',1,1,0,0,4,1.0,false),
  ('Over 35s',4,'The Has-Beens',1,0,1,0,0,0.9,false),
  ('Over 35s',5,'Golden Oldies',1,0,1,0,0,0.7,false)
) as v(grade,position,team,played,won,lost,drawn,points,percentage,is_own);

with c as (select id from clubs where slug='lakes-united-fnc')
insert into news (club_id,status,title,slug,author,summary,content,published_at)
select c.id, v.* from c cross join (values
  ('published','Big day out as footy and netball both salute','big-day-out','Club','A clean sweep across the grounds and the courts.','<p>A clean sweep across the grounds and the courts.</p>', now() - interval '2 days'),
  ('published','One club, two codes — rego now open','rego-open','Club','Football and netball sign-on is live.','<p>Football and netball sign-on is live.</p>', now() - interval '6 days'),
  ('published','Volunteers power our biggest season yet','volunteers-power','Club','Thank you to everyone pitching in.','<p>Thank you to everyone pitching in.</p>', now() - interval '10 days')
) as v(status,title,slug,author,summary,content,published_at);

with c as (select id from clubs where slug='lakes-united-fnc')
insert into events (club_id,status,title,slug,event_date,location,description,featured)
select c.id, v.* from c cross join (values
  ('published','Season Launch','season-launch', now() + interval '8 days','Lakes Reserve','Join us at the club.', true),
  ('published','Family Fun Day','family-fun', now() + interval '27 days','Lakes Reserve','Join us at the club.', false)
) as v(status,title,slug,event_date,location,description,featured);

with c as (select id from clubs where slug='lakes-united-fnc')
insert into sponsors (club_id,status,name,sponsor_level,blurb,display_order,in_carousel)
select c.id, v.* from c cross join (values
  ('published','Lakes Real Estate','platinum','Proud major partner of the Lakes.',1,true),
  ('published','United Bakehouse','gold','Game-day pies and coffee.',2,true)
) as v(status,name,sponsor_level,blurb,display_order,in_carousel);

with c as (select id from clubs where slug='lakes-united-fnc')
insert into teams (club_id,status,name,age_group,gender,grade,display_order)
select c.id, v.* from c cross join (values
  ('published','Seniors (Football)','Open','Men','Men''s',1),
  ('published','Netball A Grade','Open','Women','Women''s',2),
  ('published','Junior Boys Football','U16','Men','Junior Boys',3),
  ('published','Junior Girls Netball','U16','Women','Junior Girls',4)
) as v(status,name,age_group,gender,grade,display_order);

with c as (select id from clubs where slug='lakes-united-fnc')
insert into matches (club_id,status,grade,round,match_date,opponent,home_away,our_score,opponent_score)
select c.id, v.* from c cross join (values
  ('completed','Seniors','Round 1', now() - interval '2 days','Shoreham','Home',72,65),
  ('scheduled','Seniors','Round 2', now() + interval '5 days','Devon Meadows','Away',null,null),
  ('scheduled','Seniors','Round 3', now() + interval '12 days','Tooradin','Home',null,null),
  ('scheduled','Seniors','Round 4', now() + interval '19 days','Pearcedale','Away',null,null)
) as v(status,grade,round,match_date,opponent,home_away,our_score,opponent_score);

with c as (select id from clubs where slug='lakes-united-fnc')
insert into ladder (club_id,grade,position,team,played,won,lost,drawn,points,percentage,is_own)
select c.id, v.* from c cross join (values
  ('Seniors',1,'Lakes United FNC',1,1,0,0,4,1.4,true),
  ('Seniors',2,'Shoreham',1,1,0,0,4,1.2,false),
  ('Seniors',3,'Devon Meadows',1,1,0,0,4,1.0,false),
  ('Seniors',4,'Tooradin',1,0,1,0,0,0.85,false),
  ('Seniors',5,'Pearcedale',1,0,1,0,0,0.6,false)
) as v(grade,position,team,played,won,lost,drawn,points,percentage,is_own);
