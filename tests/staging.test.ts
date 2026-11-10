import test from "node:test";
import assert from "node:assert/strict";
import { stagingAccess } from "../src/lib/staging";
test("staging authentication fails closed when required and never protects the intended production site", () => {
  const names=["STAGING","REQUIRE_STAGING_AUTH","STAGING_AUTH_USER","STAGING_AUTH_PASSWORD"];
  const previous=names.map(k=>process.env[k]);
  try {
    process.env.STAGING="true"; process.env.REQUIRE_STAGING_AUTH="true";
    delete process.env.STAGING_AUTH_USER; delete process.env.STAGING_AUTH_PASSWORD;
    assert.equal(stagingAccess(null),"unconfigured");
    process.env.STAGING_AUTH_USER="review"; process.env.STAGING_AUTH_PASSWORD="a-long-private-review-password";
    assert.equal(stagingAccess(null),"denied");
    assert.equal(stagingAccess("Basic invalid"),"denied");
    const header=`Basic ${Buffer.from("review:a-long-private-review-password").toString("base64")}`;
    assert.equal(stagingAccess(header),"allowed");
    process.env.STAGING="false"; assert.equal(stagingAccess(null),"allowed");
  } finally {names.forEach((k,i)=>previous[i]===undefined?delete process.env[k]:process.env[k]=previous[i]);}
});
