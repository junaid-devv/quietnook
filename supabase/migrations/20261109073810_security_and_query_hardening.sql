-- Explicit privileges; table grants never replace row-level authorization.
revoke all on public.editor_members, public.rate_limits from anon, authenticated;
grant select on public.editor_members to authenticated;
grant select on public.categories, public.site_settings, public.articles,
  public.authors, public.media, public.article_categories, public.article_media,
  public.redirects to anon, authenticated;
grant select, insert, update, delete on public.categories, public.site_settings,
  public.articles, public.authors, public.media, public.article_categories,
  public.article_media, public.redirects, public.revisions to authenticated;
grant all on all tables in schema public to service_role;

-- Membership can use the caller's own-membership policy; no elevation is needed.
alter function public.is_editor() security invoker;
alter function public.article_is_public(public.articles) set search_path = '';
revoke execute on function public.is_editor() from public, anon;
grant execute on function public.is_editor() to authenticated, service_role;
revoke execute on function public.save_article(jsonb) from public, anon;
grant execute on function public.save_article(jsonb) to authenticated;

-- Triggers run for authorized writes only and do not need definer privileges.
alter function public.revise_article() security invoker;
alter function public.refresh_article_taxonomy() security invoker;
alter function public.refresh_category_terms() security invoker;
revoke execute on function public.revise_article(), public.refresh_article_taxonomy(),
  public.refresh_category_terms(), public.guard_new_slug() from public, anon, authenticated;
do $$ begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $$;

alter policy own_membership on public.editor_members
  using (user_id = (select auth.uid()));

-- One SELECT policy per role/table; cache the membership check per statement.
do $$ declare t text; p record; public_condition text; begin
  foreach t in array array['authors','categories','media','articles',
    'article_categories','article_media','revisions','site_settings','redirects'] loop
    public_condition := 'false';
    for p in select policyname, qual from pg_policies
      where schemaname='public' and tablename=t and policyname like 'public_%' loop
      public_condition := p.qual;
      execute format('alter policy %I on public.%I to anon', p.policyname, t);
    end loop;
    execute format('drop policy editor_manage on public.%I', t);
    execute format('create policy authenticated_read on public.%I for select to authenticated using ((select public.is_editor()) or (%s))', t, public_condition);
    execute format('create policy editor_insert on public.%I for insert to authenticated with check ((select public.is_editor()))', t);
    execute format('create policy editor_update on public.%I for update to authenticated using ((select public.is_editor())) with check ((select public.is_editor()))', t);
    execute format('create policy editor_delete on public.%I for delete to authenticated using ((select public.is_editor()))', t);
  end loop;
end $$;

drop policy editorial_storage_editor on storage.objects;
alter policy editorial_storage_public on storage.objects to anon;
create policy editorial_storage_read on storage.objects for select to authenticated
using (bucket_id='editorial' and ((select public.is_editor()) or
  exists(select 1 from public.media m where m.storage_key=name)));
create policy editorial_storage_insert on storage.objects for insert to authenticated
with check (bucket_id='editorial' and (select public.is_editor()));
create policy editorial_storage_update on storage.objects for update to authenticated
using (bucket_id='editorial' and (select public.is_editor()))
with check (bucket_id='editorial' and (select public.is_editor()));
create policy editorial_storage_delete on storage.objects for delete to authenticated
using (bucket_id='editorial' and (select public.is_editor()));

create index articles_author_listing_idx on public.articles(author_id,publish_at desc,id);
create index articles_cover_media_idx on public.articles(cover_media_id);
create index article_media_media_idx on public.article_media(media_id,article_id);
create index authors_portrait_media_idx on public.authors(portrait_media_id);
create index categories_parent_idx on public.categories(parent_id);
create index revisions_article_time_idx on public.revisions(article_id,created_at desc);
create index revisions_editor_idx on public.revisions(editor_id);
create index redirects_target_idx on public.redirects(target_article_id);
