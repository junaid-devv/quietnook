-- Taxonomy and public settings only. No articles or authors.
insert into public.categories(slug,name,kind,description,icon,position,image,indexable) values
('decor-ideas','Decor Ideas','topic','Thoughtful touches, familiar textures, and room to make it yours.','vase',0,'/images/decor-ideas.webp',false),
('small-spaces','Small Spaces','topic','Make a little room for the things you love.','house',1,'/images/small-spaces.webp',false),
('organization','Organization','topic','Simple systems for a calmer, more comfortable home.','box',2,'/images/organization.webp',false),
('diy-projects','DIY Projects','topic','Small projects with a personal touch.','scissors',3,'/images/diy-projects.webp',false),
('living-room','Living Room','room','Comfortable corners for everyday living.','sofa',4,'/images/living-room.webp',false),
('bedroom','Bedroom','room','A softer place to start and end the day.','bed',5,'/images/bedroom.webp',false),
('kitchen','Kitchen','room','Practical spaces with a little everyday warmth.','pot',6,'/images/kitchen.webp',false),
('bathroom','Bathroom','room','Thoughtful details for even the smallest room.','bath',7,'/images/bathroom.webp',false),
('balcony','Balcony','room','Fresh air and cozy corners, just outside your door.','plant',8,'/images/balcony.webp',false),
('christmas','Christmas','season','Warm lights and thoughtful touches for the holiday season.','snow',9,'/images/christmas.webp',false),
('halloween','Halloween','season','A little playful magic for your home.','bat',10,'/images/halloween.webp',false),
('fall','Fall','season','Earthy colors, soft layers, and a slower pace.','leaf',11,'/images/fall.webp',false),
('new-years-eve','New Year’s Eve','season','Simple ways to welcome a fresh beginning.','spark',12,'/images/new-years-eve.webp',false),
('valentines-day','Valentine’s Day','season','Little details that come from the heart.','heart',13,'/images/valentines-day.webp',false),
('spring','Spring','season','Fresh blooms and lighter days at home.','flower',14,'/images/spring.webp',false),
('summer','Summer','season','Easy living, indoors and out.','sun',15,'/images/summer.webp',false),
('winter','Winter','season','Cozy layers for the colder months.','snow',16,'/images/winter.webp',false),
('thanksgiving','Thanksgiving','season','A welcoming place to gather.','leaf',17,'/images/thanksgiving.webp',false),
('easter','Easter','season','Gentle color and a fresh start for the season.','flower',18,'/images/easter.webp',false),
('fourth-of-july','Fourth of July','season','Easy touches for a summer gathering.','spark',19,'/images/fourth-of-july.webp',false)
on conflict(slug) do nothing;
insert into public.site_settings(id,value) values('public','{"hero_image":"/images/hero-nook.webp","hero_alt":"A linen armchair with a knitted throw beside an oak table, a ceramic mug, and an olive-green vase.","hero_focal":"50% 50%","season_order":["christmas","halloween","fall","new-years-eve","valentines-day","spring","summer"],"featured_categories":["small-spaces","bedroom","organization"],"editorial_timezone":"America/New_York","operator_name":"","contact_email":"quietnookk@gmail.com","about_text":"","privacy_text":"","terms_text":"","affiliate_text":"","social_links":[],"newsletter_enabled":false,"newsletter_privacy":"","newsletter_endpoint":"","search_console_token":"","pinterest_token":""}'::jsonb) on conflict(id) do nothing;
