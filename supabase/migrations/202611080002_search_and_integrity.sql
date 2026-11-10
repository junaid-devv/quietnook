-- Index category terms alongside article text, including queries spanning both.
alter table public.articles add column category_terms text not null default '';
alter table public.articles drop column search_vector;
alter table public.articles add column search_vector tsvector generated always as(
 setweight(to_tsvector('english',coalesce(title,'')),'A') ||
 setweight(to_tsvector('english',coalesce(excerpt,'')),'B') ||
 setweight(to_tsvector('english',coalesce(body_text,'')),'C') ||
 setweight(to_tsvector('english',coalesce(category_terms,'')),'D')
) stored;
create index articles_search_idx on public.articles using gin(search_vector);
create or replace function public.revise_article() returns trigger language plpgsql security definer set search_path='' as $$begin
 if pg_trigger_depth()>1 and (to_jsonb(new)-'category_terms'-'search_vector')=(to_jsonb(old)-'category_terms'-'search_vector') then return new;end if;
 if old.slug<>new.slug then
   if exists(select 1 from public.redirects where source_slug=new.slug and target_article_id<>old.id) then raise exception 'Slug reserved by a redirect';end if;
   delete from public.redirects where source_slug=new.slug and target_article_id=old.id;
   insert into public.redirects(source_slug,target_article_id) values(old.slug,old.id) on conflict(source_slug) do update set target_article_id=old.id;
 end if;
 insert into public.revisions(article_id,snapshot,editor_id) values(old.id,to_jsonb(old)||jsonb_build_object('category_ids',(select coalesce(jsonb_agg(category_id),'[]') from public.article_categories where article_id=old.id)),auth.uid());
 new.updated_at=now();return new;end$$;
create function public.refresh_article_taxonomy() returns trigger language plpgsql security definer set search_path='' as $$declare aid uuid;begin
 aid=case when TG_OP='DELETE' then old.article_id else new.article_id end;
 update public.articles a set category_terms=coalesce((select string_agg(c.name,' ' order by c.name) from public.article_categories ac join public.categories c on c.id=ac.category_id where ac.article_id=aid),'') where a.id=aid;
 return null;end$$;
create trigger article_taxonomy_changed after insert or delete or update on public.article_categories for each row execute function public.refresh_article_taxonomy();
create function public.refresh_category_terms() returns trigger language plpgsql security definer set search_path='' as $$begin
 update public.articles a set category_terms=coalesce((select string_agg(c.name,' ' order by c.name) from public.article_categories ac join public.categories c on c.id=ac.category_id where ac.article_id=a.id),'') where a.id in(select article_id from public.article_categories where category_id=new.id);
 return new;end$$;
create trigger category_name_changed after update of name on public.categories for each row execute function public.refresh_category_terms();
create or replace function public.search_articles(query_text text default '',category_slug text default '',page_number integer default 1,page_size integer default 12) returns table(id uuid,title text,slug text,excerpt text,body jsonb,status text,author_id uuid,cover_media_id uuid,publish_at timestamptz,updated_at timestamptz,seo_title text,seo_description text,total_count bigint) language sql stable security invoker set search_path='' as $$
 select a.id,a.title,a.slug,a.excerpt,'[]'::jsonb,a.status,a.author_id,a.cover_media_id,a.publish_at,a.updated_at,a.seo_title,a.seo_description,count(*) over()
 from public.articles a where public.article_is_public(a) and length(query_text)<=200 and
 (category_slug='' or exists(select 1 from public.article_categories ac join public.categories c on c.id=ac.category_id where ac.article_id=a.id and c.slug=category_slug)) and
 (query_text='' or a.search_vector@@websearch_to_tsquery('english',query_text))
 order by case when query_text<>'' then ts_rank(a.search_vector,websearch_to_tsquery('english',query_text)) else 0 end desc,a.publish_at desc,a.id limit least(greatest(page_size,1),50) offset (greatest(page_number,1)-1)*least(greatest(page_size,1),50)$$;
create function public.count_articles(query_text text default '',category_slug text default '') returns bigint language sql stable security invoker set search_path='' as $$
 select count(*) from public.articles a where public.article_is_public(a) and length(query_text)<=200 and (query_text='' or a.search_vector@@websearch_to_tsquery('english',query_text)) and (category_slug='' or exists(select 1 from public.article_categories ac join public.categories c on c.id=ac.category_id where ac.article_id=a.id and c.slug=category_slug))$$;
-- Prevent direct editor API writes from reusing another article's historical URL.
create function public.guard_new_slug() returns trigger language plpgsql set search_path='' as $$begin if exists(select 1 from public.redirects where source_slug=new.slug and target_article_id<>new.id) then raise exception 'Slug reserved by a redirect';end if;return new;end$$;
create trigger guard_article_slug before insert on public.articles for each row execute function public.guard_new_slug();
