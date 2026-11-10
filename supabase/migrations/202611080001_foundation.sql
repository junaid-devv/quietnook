-- No article or author seeds. Run on a dedicated Supabase project.
create extension if not exists pgcrypto;
create table public.editor_members(user_id uuid primary key references auth.users(id) on delete cascade, created_at timestamptz not null default now());
create function public.is_editor() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.editor_members where user_id=auth.uid())$$;
create table public.authors(id uuid primary key default gen_random_uuid(),name text not null check(length(name) between 1 and 150),slug text unique not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),bio text not null default '',portrait_media_id uuid, created_at timestamptz default now());
create table public.categories(id uuid primary key default gen_random_uuid(),slug text unique not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),name text not null,kind text not null check(kind in ('topic','room','season')),parent_id uuid references public.categories(id),description text not null default '',icon text not null default 'leaf',image text,position integer not null default 0,indexable boolean not null default false,seo_title text not null default '',seo_description text not null default '');
create table public.media(id uuid primary key default gen_random_uuid(),storage_key text unique not null,mime text not null check(mime in ('image/jpeg','image/png','image/webp','image/avif')),width integer not null check(width>0),height integer not null check(height>0),bytes integer not null check(bytes between 1 and 10000000),alt text not null check(length(alt)>0),caption text not null default '',provenance text not null,license text not null,focal_x integer not null default 50 check(focal_x between 0 and 100),focal_y integer not null default 50 check(focal_y between 0 and 100),folder text not null default 'library',created_at timestamptz not null default now());
alter table public.authors add foreign key(portrait_media_id) references public.media(id) on delete set null;
create table public.articles(id uuid primary key default gen_random_uuid(),title text not null check(length(title) between 1 and 200),slug text unique not null check(slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),excerpt text not null default '',body jsonb not null default '[]' check(jsonb_typeof(body)='array'),body_text text not null default '',status text not null default 'draft' check(status in ('draft','scheduled','published')),author_id uuid references public.authors(id),cover_media_id uuid references public.media(id),publish_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),seo_title text not null default '',seo_description text not null default '',search_vector tsvector generated always as(setweight(to_tsvector('english',coalesce(title,'')),'A') || setweight(to_tsvector('english',coalesce(excerpt,'')),'B') || setweight(to_tsvector('english',coalesce(body_text,'')),'C')) stored,check(status='draft' or (author_id is not null and publish_at is not null and jsonb_array_length(body)>0)));
create index articles_search_idx on public.articles using gin(search_vector);
create index articles_public_idx on public.articles(status,publish_at desc);
create table public.article_categories(article_id uuid references public.articles(id) on delete cascade,category_id uuid references public.categories(id) on delete cascade,primary key(article_id,category_id));
create index article_categories_category_idx on public.article_categories(category_id,article_id);
create table public.article_media(article_id uuid references public.articles(id) on delete cascade,media_id uuid references public.media(id),primary key(article_id,media_id));
create table public.revisions(id uuid primary key default gen_random_uuid(),article_id uuid not null references public.articles(id) on delete cascade,snapshot jsonb not null,editor_id uuid references auth.users(id),created_at timestamptz not null default now());
create table public.site_settings(id text primary key check(id='public'),value jsonb not null default '{}',updated_at timestamptz not null default now());
create table public.redirects(id uuid primary key default gen_random_uuid(),source_slug text unique not null,target_article_id uuid not null references public.articles(id) on delete cascade,created_at timestamptz not null default now());
-- Eligibility is enforced by RLS at every public query, including referenced media.
create function public.article_is_public(a public.articles) returns boolean language sql stable as $$select a.status='published' and a.publish_at<=now()$$;
alter table public.editor_members enable row level security;
create policy own_membership on public.editor_members for select to authenticated using(user_id=auth.uid());
do $$declare t text;begin foreach t in array array['authors','categories','media','articles','article_categories','article_media','revisions','site_settings','redirects'] loop execute format('alter table public.%I enable row level security',t);execute format('create policy editor_manage on public.%I for all to authenticated using(public.is_editor()) with check(public.is_editor())',t);end loop;end$$;
create policy public_categories on public.categories for select using(true);
create policy public_settings on public.site_settings for select using(true);
create policy public_articles on public.articles for select using(public.article_is_public(articles));
create policy public_authors on public.authors for select using(exists(select 1 from public.articles a where a.author_id=authors.id and public.article_is_public(a)));
create policy public_article_categories on public.article_categories for select using(exists(select 1 from public.articles a where a.id=article_id and public.article_is_public(a)));
create policy public_article_media on public.article_media for select using(exists(select 1 from public.articles a where a.id=article_id and public.article_is_public(a)));
create policy public_media on public.media for select using(exists(select 1 from public.article_media am join public.articles a on a.id=am.article_id where am.media_id=media.id and public.article_is_public(a)) or exists(select 1 from public.site_settings s where s.value->>'hero_image'='/api/media/'||media.id::text||'/') or exists(select 1 from public.categories c where c.image='/api/media/'||media.id::text||'/'));
create policy public_redirects on public.redirects for select using(exists(select 1 from public.articles a where a.id=target_article_id and public.article_is_public(a)));
-- Private bucket: public article media receives time-limited links only after RLS checks.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('editorial','editorial',false,10000000,array['image/jpeg','image/png','image/webp','image/avif']) on conflict(id) do nothing;
create policy editorial_storage_editor on storage.objects for all to authenticated using(bucket_id='editorial' and public.is_editor()) with check(bucket_id='editorial' and public.is_editor());
create policy editorial_storage_public on storage.objects for select to anon,authenticated using(bucket_id='editorial' and exists(select 1 from public.media m where m.storage_key=name));
create function public.revise_article() returns trigger language plpgsql security definer set search_path='' as $$begin
 if old.slug<>new.slug then
   delete from public.redirects where source_slug=new.slug;
   insert into public.redirects(source_slug,target_article_id) values(old.slug,old.id) on conflict(source_slug) do update set target_article_id=old.id;
 end if;
 insert into public.revisions(article_id,snapshot,editor_id) values(old.id,to_jsonb(old)||jsonb_build_object('category_ids',(select coalesce(jsonb_agg(category_id),'[]') from public.article_categories where article_id=old.id)),auth.uid());
 new.updated_at=now();return new;end$$;
create trigger article_revision before update on public.articles for each row execute function public.revise_article();
-- Atomic writes, including relationships. Invocation remains subject to editor authorization.
create function public.save_article(payload jsonb) returns uuid language plpgsql security invoker set search_path='' as $$declare aid uuid;mid uuid;begin
 if not public.is_editor() then raise exception 'Editor access required';end if;
 aid=coalesce((payload->>'id')::uuid,gen_random_uuid());
 if exists(select 1 from public.redirects where source_slug=payload->>'slug' and target_article_id<>aid) then raise exception 'Slug is reserved by an existing redirect';end if;
 insert into public.articles(id,title,slug,excerpt,body,body_text,status,author_id,cover_media_id,publish_at,seo_title,seo_description) values(aid,payload->>'title',payload->>'slug',payload->>'excerpt',payload->'body',payload->>'body_text',payload->>'status',(payload->>'author_id')::uuid,(payload->>'cover_media_id')::uuid,(payload->>'publish_at')::timestamptz,payload->>'seo_title',payload->>'seo_description') on conflict(id) do update set title=excluded.title,slug=excluded.slug,excerpt=excluded.excerpt,body=excluded.body,body_text=excluded.body_text,status=excluded.status,author_id=excluded.author_id,cover_media_id=excluded.cover_media_id,publish_at=excluded.publish_at,seo_title=excluded.seo_title,seo_description=excluded.seo_description;
 delete from public.article_categories where article_id=aid;
 insert into public.article_categories(article_id,category_id) select aid,value::uuid from jsonb_array_elements_text(payload->'category_ids');
 delete from public.article_media where article_id=aid;
 insert into public.article_media(article_id,media_id) select aid,(payload->>'cover_media_id')::uuid where payload->>'cover_media_id' is not null on conflict do nothing;
 insert into public.article_media(article_id,media_id) select aid,(b->>'media_id')::uuid from jsonb_array_elements(payload->'body') b where b->>'type'='image' on conflict do nothing;
 return aid;end$$;
create function public.search_articles(query_text text default '',category_slug text default '',page_number integer default 1,page_size integer default 12) returns table(id uuid,title text,slug text,excerpt text,body jsonb,status text,author_id uuid,cover_media_id uuid,publish_at timestamptz,updated_at timestamptz,seo_title text,seo_description text,total_count bigint) language sql stable security invoker set search_path='' as $$
 select a.id,a.title,a.slug,a.excerpt,'[]'::jsonb,a.status,a.author_id,a.cover_media_id,a.publish_at,a.updated_at,a.seo_title,a.seo_description,count(*) over()
 from public.articles a where public.article_is_public(a) and length(query_text)<=200 and
 (category_slug='' or exists(select 1 from public.article_categories ac join public.categories c on c.id=ac.category_id where ac.article_id=a.id and c.slug=category_slug)) and
 (query_text='' or a.search_vector@@websearch_to_tsquery('english',query_text) or exists(select 1 from public.article_categories ac join public.categories c on c.id=ac.category_id where ac.article_id=a.id and to_tsvector('english',c.name)@@websearch_to_tsquery('english',query_text)))
 order by case when query_text<>'' then ts_rank(a.search_vector,websearch_to_tsquery('english',query_text)) else 0 end desc,a.publish_at desc,a.id limit least(greatest(page_size,1),50) offset (greatest(page_number,1)-1)*least(greatest(page_size,1),50)$$;
create function public.publish_due() returns integer language plpgsql security definer set search_path='' as $$declare n integer;begin update public.articles set status='published' where status='scheduled' and publish_at<=now();get diagnostics n=row_count;return n;end$$;
revoke all on function public.publish_due() from public,anon,authenticated;
grant execute on function public.publish_due() to service_role;
-- Database-backed rate limiting: persistent across server instances.
create table public.rate_limits(key text primary key,window_start timestamptz not null,hits integer not null);
alter table public.rate_limits enable row level security;
create function public.consume_rate_limit(bucket text,max_hits integer,window_seconds integer) returns boolean language plpgsql security definer set search_path='' as $$declare n integer;begin
 insert into public.rate_limits(key,window_start,hits) values(bucket,now(),1) on conflict(key) do update set hits=case when public.rate_limits.window_start<now()-make_interval(secs=>window_seconds) then 1 else public.rate_limits.hits+1 end,window_start=case when public.rate_limits.window_start<now()-make_interval(secs=>window_seconds) then now() else public.rate_limits.window_start end returning hits into n;
 delete from public.rate_limits where window_start<now()-interval '1 day';return n<=max_hits;end$$;
revoke all on function public.consume_rate_limit(text,integer,integer) from public,anon,authenticated;
grant execute on function public.consume_rate_limit(text,integer,integer) to service_role;
