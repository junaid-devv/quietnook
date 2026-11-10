import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
test("isolated PostgreSQL: RLS, search, publishing, redirects, revisions, storage and zero cleanup", async () => {
  const db = new PGlite();
  try {
    await db.exec(
      `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema storage;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;grant usage on schema public,auth,storage to anon,authenticated,service_role;`,
    );
    for (const file of readdirSync("supabase/migrations").filter(f => f.endsWith(".sql")).sort())
      await db.exec(readFileSync(`supabase/migrations/${file}`, "utf8")
        .replace("create extension if not exists pgcrypto;", ""));
    await db.exec(readFileSync("supabase/seed.sql", "utf8"));
    await db.exec(
      "grant select,insert,update,delete on storage.objects to anon,authenticated,service_role;",
    );
    const editor = "11111111-1111-4111-8111-111111111111",
      outsider = "22222222-2222-4222-8222-222222222222",
      author = "33333333-3333-4333-8333-333333333333",
      media = "44444444-4444-4444-8444-444444444444";
    await db.exec(
      `insert into auth.users values('${editor}'),('${outsider}');insert into public.editor_members(user_id) values('${editor}');insert into public.authors(id,name,slug) values('${author}','Temporary test fixture','isolated-fixture');insert into public.media(id,storage_key,mime,width,height,bytes,alt,provenance,license) values('${media}','test/fixture.webp','image/webp',10,10,100,'Fixture','Temporary isolated test','Temporary test only');insert into storage.objects(bucket_id,name) values('editorial','test/fixture.webp');`,
    );
    const role = async (name: string, user = "") => {
      await db.exec(
        `reset role;set role ${name};select set_config('request.jwt.claim.sub','${user}',false);`,
      );
    };
    const count = async (table: string) =>
      Number(
        (await db.query<{ n: number }>(`select count(*)::int n from ${table}`))
          .rows[0].n,
      );
    await role("anon");
    assert.equal(await count("public.articles"), 0);
    assert.equal(await count("public.authors"), 0);
    assert.equal(await count("public.media"), 0);
    assert.equal(await count("storage.objects"), 0);
    assert.equal(await count("public.categories"), 20);
    await assert.rejects(() =>
      db.exec(
        `insert into public.articles(title,slug) values('Forbidden','forbidden')`,
      ),
    );
    await role("authenticated", outsider);
    assert.equal(await count("public.editor_members"), 0);
    await assert.rejects(() =>
      db.query("select public.save_article($1::jsonb)", [
        JSON.stringify({ title: "Forbidden" }),
      ]),
    );
    await role("authenticated", editor);
    assert.equal(await count("public.editor_members"), 1);
    const cat = (
      await db.query<{ id: string }>(
        "select id from public.categories where slug='bedroom'",
      )
    ).rows[0].id;
    const fixture = {
      title: "Isolated storage project fixture",
      slug: "isolated-fixture",
      excerpt: "Only a temporary verification record",
      body: [{ type: "paragraph", text: "Temporary verification words" }],
      body_text: "Temporary verification words",
      status: "draft",
      author_id: author,
      cover_media_id: media,
      publish_at: null as string | null,
      seo_title: "",
      seo_description: "",
      category_ids: [cat],
    };
    const save = async (payload: unknown) =>
      (
        await db.query<{ save_article: string }>(
          "select public.save_article($1::jsonb)",
          [JSON.stringify(payload)],
        )
      ).rows[0].save_article;
    const id = await save(fixture);
    await save({ ...fixture, id });
    assert.equal(
      await count("public.revisions"),
      1,
      "a deliberate save keeps the prior category snapshot even if text is unchanged",
    );
    assert.equal(await count("public.articles"), 1);
    assert.equal(await count("storage.objects"), 1);
    await role("anon");
    assert.equal(await count("public.articles"), 0);
    assert.equal(await count("public.media"), 0);
    assert.equal(
      (await db.query("select * from public.search_articles('storage')")).rows
        .length,
      0,
    );
    await role("authenticated", editor);
    await save({
      ...fixture,
      id,
      status: "published",
      publish_at: new Date(Date.now() + 86400000).toISOString(),
    });
    await role("anon");
    assert.equal(await count("public.articles"), 0);
    assert.equal(await count("public.media"), 0);
    await role("authenticated", editor);
    await save({
      ...fixture,
      id,
      status: "scheduled",
      publish_at: new Date(Date.now() - 10000).toISOString(),
    });
    await role("anon");
    assert.equal(await count("public.articles"), 0);
    await assert.rejects(() => db.exec("select public.publish_due()"));
    await role("service_role");
    assert.equal(
      (await db.query<{ publish_due: number }>("select public.publish_due()"))
        .rows[0].publish_due,
      1,
    );
    assert.equal(
      (await db.query<{ publish_due: number }>("select public.publish_due()"))
        .rows[0].publish_due,
      0,
    );
    await role("anon");
    assert.equal(await count("public.articles"), 1);
    assert.equal(await count("public.media"), 1);
    assert.equal(await count("storage.objects"), 1);
    assert.equal(await count("public.authors"), 1);
    assert.equal(
      (await db.query("select * from public.search_articles('storage')")).rows
        .length,
      1,
    );
    assert.equal(
      (await db.query("select * from public.search_articles('bedroom')")).rows
        .length,
      1,
    );
    assert.equal(
      (
        await db.query(
          "select * from public.search_articles('bedroom storage')",
        )
      ).rows.length,
      1,
      "query terms can span title and category",
    );
    assert.equal(
      (await db.query("select * from public.search_articles('', 'bedroom')"))
        .rows.length,
      1,
    );
    assert.equal(
      (await db.query("select * from public.search_articles('', 'kitchen')"))
        .rows.length,
      0,
    );
    await role("authenticated", editor);
    await save({
      ...fixture,
      id,
      slug: "renamed-fixture",
      status: "published",
      publish_at: new Date(Date.now() - 10000).toISOString(),
    });
    assert.ok((await count("public.revisions")) >= 3);
    await role("anon");
    assert.equal(await count("public.redirects"), 1);
    await role("authenticated", editor);
    await save({ ...fixture, id, slug: "renamed-fixture", status: "draft" });
    await role("anon");
    assert.equal(await count("public.articles"), 0);
    assert.equal(await count("public.redirects"), 0);
    assert.equal(await count("public.media"), 0);
    assert.equal(
      (await db.query("select * from public.search_articles('storage')")).rows
        .length,
      0,
    );
    await role("service_role");
    assert.equal(
      (
        await db.query<{ consume_rate_limit: boolean }>(
          "select public.consume_rate_limit('test',1,600)",
        )
      ).rows[0].consume_rate_limit,
      true,
    );
    assert.equal(
      (
        await db.query<{ consume_rate_limit: boolean }>(
          "select public.consume_rate_limit('test',1,600)",
        )
      ).rows[0].consume_rate_limit,
      false,
    );
    await db.exec(
      `reset role;delete from public.articles;delete from public.authors;delete from public.media;delete from storage.objects;delete from public.rate_limits;delete from public.editor_members;delete from auth.users;`,
    );
    assert.equal(await count("public.articles"), 0);
    assert.equal(await count("public.revisions"), 0);
    assert.equal(await count("public.media"), 0);
    assert.equal(await count("storage.objects"), 0);
  } finally {
    await db.close();
  }
});
